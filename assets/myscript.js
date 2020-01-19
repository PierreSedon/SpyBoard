
function listClickHandler(event){
    var listItems = $(".list-group-item");
    listItems.removeClass("active");
    event.currentTarget.classList.add("active");
    console.log("test");
}

function handleNewFilesList(data){
    const list = document.getElementById("fileList");
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
    for (var i = 0; i < data.files.length; i++){
        var li = document.createElement("li");
        li.classList.add("list-group-item");
        var file = data.files[i];
        if (file.mode.charAt(0).localeCompare("d") == 0){
            li.classList.add("folder");
        }
        if (file.mode.charAt(3).localeCompare("h") == 0){
            li.classList.add("hidden");
        }
        li.innerHTML = file.name;
        li.addEventListener("click", listClickHandler);
        list.appendChild(li);
    }
}

function sendAjaxCall(action, command=null, printOutput=true, isJson=false) {
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
            if (printOutput){
                if (action.localeCompare("init") != 0){
                    $( "#terminaltext")[0].innerHTML += command;
                    $( "#terminaltext")[0].innerHTML += "\n";
                } else {
                    sendAjaxCall("list", null, false, true);
                }
                $( "#terminaltext")[0].innerHTML += response;
                $('#terminaltext').scrollTop($('#terminaltext')[0].scrollHeight);
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
    
    $( ".btn-secondary" ).click(function( event ) {
        sendAjaxCall("download", $(" #terminalinput ")[0].value);
    });

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