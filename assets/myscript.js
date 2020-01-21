const MAX_AJAX_CALLS = 5;

var currentDirectory = "";
var selectedItem = null;
var isFolderSelected = false;
var isFirstListClick = true;
var successiveAjaxCalls = 0;

function listClickHandler(event){
    var listItems = $(".list-group-item");
    listItems.removeClass("active");
    event.currentTarget.classList.add("active");

    selectedItem = event.currentTarget.title;
    
    if (event.currentTarget.getAttribute('isFolder')){
        handleFolderClick();
    } else {
        handleFileClick();
    }

    // On fait la modification après le traitement dossier/fichier car on y a besoin de l'information firstClick
    if (isFirstListClick){
        isFirstListClick = false;
        $( "#buttonDownload" ).removeClass("disabled");
        $( "#buttonDownload" ).addClass("active");
        $( "#buttonDelete" ).removeClass("disabled");
        $( "#buttonDelete" ).addClass("active");
    }
}

function handleGoFilesClick(){
    if (!$("#goFiles").hasClass("active")){
        $("#goTerminal").removeClass("active");
        $("#goFiles").addClass("active");

        $( "#terminalLayout" )[0].style.display = "none";
        $( "#filesLayout" )[0].style.display = "block";
    }
}

function handleGoTerminalClick(){
    if (!$("#goTerminal").hasClass("active")){
        $("#goFiles").removeClass("active");
        $("#goTerminal").addClass("active");

        $( "#filesLayout" )[0].style.display = "none";
        $( "#terminalLayout" )[0].style.display = "block";
    }
}

function handleFolderClick(){
    if (!isFolderSelected || isFirstListClick){
        isFolderSelected = true;
        $( "#buttonPrint" ).removeClass("active");
        $( "#buttonPrint" ).addClass("disabled");
        $( "#buttonGo" ).removeClass("disabled");
        $( "#buttonGo" ).addClass("active");
    }
}

function handleFileClick(){
    if (isFolderSelected || isFirstListClick){
        isFolderSelected = false;
        $( "#buttonPrint" ).removeClass("disabled");
        $( "#buttonPrint" ).addClass("active");
        $( "#buttonGo" ).removeClass("active");
        $( "#buttonGo" ).addClass("disabled");
    }
}

function resetVisualState(){
    isFolderSelected = false;
    selectedItem = null;
    isFirstListClick = true;
    $( "#buttonPrint" ).removeClass("active");
    $( "#buttonPrint" ).addClass("disabled");
    $( "#buttonGo" ).removeClass("active");
    $( "#buttonGo" ).addClass("disabled");
    $( "#buttonDownload" ).removeClass("active");
    $( "#buttonDownload" ).addClass("disabled");
    $( "#buttonDelete" ).removeClass("active");
    $( "#buttonDelete" ).addClass("disabled");

    $( ".list-group-item.active" ).removeClass("active");

    $( "#directory" )[0].style.display = "none";
    $( "#spinner" )[0].style.display = "block";
}

function handleButtonDownloadClick(){
    event.preventDefault();
    if (isFolderSelected){
        sendAjaxCall("downloadZip", currentDirectory + "/" + selectedItem);
        // TODO: Utiliser la ligne suivante pour le rendu
        // sendAjaxCall("downloadZip", currentDirectory + "\\" +selectedItem);
    } else {
        sendAjaxCall("download", currentDirectory + "/" + selectedItem);
        // TODO: Utiliser la ligne suivante pour le rendu
        // sendAjaxCall("download", currentDirectory + "\\" +selectedItem);
        console.log(currentDirectory + "\\" +selectedItem);
    }
}

function handleButtonDeleteClick(){
    event.preventDefault();
    if (isFolderSelected){
        sendAjaxCall("deleteFolder", currentDirectory + "/" + selectedItem , false, true);
        // TODO: Utiliser la ligne suivante pour le rendu
        // sendAjaxCall("deleteFolder", currentDirectory + "\\" + selectedItem , false, true);
    } else {
        sendAjaxCall("delete", currentDirectory + "/" + selectedItem , false, true);
        // TODO: Utiliser la ligne suivante pour le rendu
        // sendAjaxCall("delete", currentDirectory + "\\" + selectedItem , false, true);
    }
    resetVisualState();
}

function handleButtonPrintClick(){
    event.preventDefault();
    if (!isFolderSelected){
        sendAjaxCall("print", currentDirectory + "/" + selectedItem, false, false);
        // TODO: Utiliser la ligne suivante pour le rendu
        // sendAjaxCall("print", currentDirectory + "\\" + selectedItem, false, false);
    }
}

function handleButtonParentClick(event){
    event.preventDefault();
    sendAjaxCall("parent", null, false, true);
    resetVisualState();
}

function handleButtonGoClick(){
    event.preventDefault();
    if (isFolderSelected){
        sendAjaxCall("go", currentDirectory + "/" + selectedItem , false, true);
        // TODO: Utiliser la ligne suivante pour le rendu
        // sendAjaxCall("go", currentDirectory + "\\" + selectedItem , false, true);
        resetVisualState();
    }
}

function handleNewFilesList(data){
    if ((data.directory.localeCompare(".") == 0) && successiveAjaxCalls < MAX_AJAX_CALLS){
        sendAjaxCall("list", null, false, true);
        successiveAjaxCalls++;
        return;
    }
    if (successiveAjaxCalls == MAX_AJAX_CALLS){
        successiveAjaxCalls = 0;
        handleButtonParentClick();
        return;
    }
    successiveAjaxCalls = 0;
    const list = document.getElementById("fileList");
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
    
    $( "#spinner" )[0].style.display = "none";

    currentDirectory = data.directory;

    var directoryText = $( "#directory" )[0];
    directoryText.innerHTML = currentDirectory;
    directoryText.style.display = "block";

    for (var i = 0; i < data.files.length; i++){
        var li = document.createElement("li");
        li.classList.add("list-group-item");
        var file = data.files[i];
        li.title = file.name;
        if (file.mode.charAt(0).localeCompare("d") != 0){
            li.innerHTML = '<p style="margin-bottom:0;font-size:larger">' + file.name + '</p>';
            li.innerHTML += '<span class = "mybadge">' + file.size + ' B</span>';
        } else {
            li.setAttribute('isFolder', true);
            li.innerHTML = '<p style="margin-bottom:0;font-size:larger;font-weight:bold">' + file.name + '</p>';
        }
        if (file.mode.charAt(3).localeCompare("h") == 0){
            li.classList.add("list-group-item-warning");
        }
        li.innerHTML += '<p style="margin-bottom:0;font-size:smaller;">' + 'Last modified: ' + file.lastModifiedDay + ' ' + file.lastModifiedTime + '</p>';
        li.addEventListener("click", listClickHandler);
        list.appendChild(li);
    }
}

function sendAjaxCall(action, command=null, terminalOutput=true, isJson=false) {
    var ajaxurl = 'assets/ajax.php';
    var data =  {
        'action': action,
        'command': command    
    };
    
    if (isJson){
        $.ajax({
            
            // The URL for the request
            url: ajaxurl,
            
            // The data to send (will be converted to a query string)
            data: data,
            
            // Whether this is a POST or GET request
            type: "POST",
            
            // The type of data we expect back
            dataType : "json",
        })
        // Code to run if the request succeeds (is done);
        // The response is passed to the function
        .done(function( response ) {
            console.log(response);
            // Handle the response object to print current directory and files
            handleNewFilesList(response);
        })
        // Code to run if the request fails; the raw request and
        // status codes are passed to the function
        .fail(function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        })
        // Code to run regardless of success or failure;
        .always(function( xhr, status ) {
            console.log( "Ajax call for action " + action + (command == null ? "" : " and command " + command) + " completed" );
        });
    } else {
        
        $.ajax({
            
            // The URL for the request
            url: ajaxurl,
            
            // The data to send (will be converted to a query string)
            data: data,
            
            // Whether this is a POST or GET request
            type: "POST",
            
            // The type of data we expect back
            // dataType : "json",
        })
        // Code to run if the request succeeds (is done);
        // The response is passed to the function
        .done(function( response ) {
            if (terminalOutput){
                if (action.localeCompare("init") == 0){
                    sendAjaxCall("list", null, false, true);
                } else {
                    $( "#terminaltext")[0].innerHTML += command;
                    $( "#terminaltext")[0].innerHTML += "\n";
                }
                $( "#terminaltext")[0].innerHTML += response;
                $('#terminaltext').scrollTop($('#terminaltext')[0].scrollHeight);
            }
            if (action.localeCompare("print") == 0){
                $('#printModal').modal('show');
                $('#modalTitle')[0].innerHTML = command;
                $('#modalText')[0].innerHTML = response;
            }
            console.log(response);
        })
        // Code to run if the request fails; the raw request and
        // status codes are passed to the function
        .fail(function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        })
        // Code to run regardless of success or failure;
        .always(function( xhr, status ) {
            console.log( "Ajax call for action " + action + (command == null ? "" : " and command " + command) + " completed" );
        });
    }
}

$( document ).ready(function() {
    var previousCommands = [];
    var currentCommandNumber = 0;

    sendAjaxCall("init", null, true, false);
    // sendAjaxCall("write", "Get-ChildItem -Force");
    // document.addEventListener('outputRead', function(event){
    //     $( "#terminaltext" )[0].textContent = event.detail;
    // });
    // readTextFile("http://localhost/bootstrap/reverseoutput");
    
    // Change the active member of the list when it is clicked
    // $( ".list-group-item" ).click(function( event ) {
    //     var listItems = $(".list-group-item");
    //     listItems.removeClass("active");
    //     event.currentTarget.classList.add("active");
    //     console.log("test");
    // });
    
    // $( ".btn-secondary" ).click(function( event ) {
    //     sendAjaxCall("download", $(" #terminalinput ")[0].value);
    // });

    $( "#terminalinput")[0].addEventListener('keydown', function(e){
        if (e.code == "Enter"){
            var command = $(" #terminalinput ")[0].value;
            sendAjaxCall("write", command);
            previousCommands.push(command);
            currentCommandNumber++;
            $(" #terminalinput ")[0].value = "";
        } else if (e.code == "ArrowUp"){
            if (currentCommandNumber != 0){
                $(" #terminalinput ")[0].value = previousCommands[currentCommandNumber-1];
                currentCommandNumber--;
            }
        } else if (e.code == "ArrowDown"){
            if (currentCommandNumber < previousCommands.length-1){
                $(" #terminalinput ")[0].value = previousCommands[currentCommandNumber+1];
                currentCommandNumber++;
            } else if (currentCommandNumber == previousCommands.length-1){
                currentCommandNumber++;
                $(" #terminalinput ")[0].value = "";
            }
        } else {
            // $( "#terminaltext")[0].innerHTML += e.key;
        }
    });
    
});