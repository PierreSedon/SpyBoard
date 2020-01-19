
// function readTextFile(file)
// {
//     var rawFile = new XMLHttpRequest();
//     rawFile.open("GET", file, true);
//     rawFile.onreadystatechange = function ()
//     {
//         if(rawFile.readyState === 4)
//         {
//             if(rawFile.status === 200 || rawFile.status == 0)
//             {
//                 var outputText = rawFile.responseText;
//                 var event = new CustomEvent('outputRead', {'detail': outputText});
//                 document.dispatchEvent(event);
//             }
//         }
//     }
//     rawFile.send(null);
// }

// window.setInterval(function() {
//     readTextFile("http://localhost/bootstrap/reverseoutput");
// }, 1000);

function sendAjaxCall(action, command=null, printOutput=true) {
    var ajaxurl = 'assets/ajax.php';
    var data =  {
        'action': action,
        'command': command    
    };
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

$( document ).ready(function() {
    sendAjaxCall("init", null, true);
    // sendAjaxCall("write", "Get-ChildItem -Force");
    // document.addEventListener('outputRead', function(event){
    //     $( "#terminaltext" )[0].textContent = event.detail;
    // });
    // readTextFile("http://localhost/bootstrap/reverseoutput");
    
    // Change the active member of the list when it is clicked
    $( ".list-group-item" ).click(function( event ) {
        var listItems = $(".list-group-item");
        listItems.removeClass("active");
        event.currentTarget.classList.add("active");
    });
    
    $( ".btn-secondary" ).click(function( event ) {
        sendAjaxCall("download", $(" #terminalinput ")[0].value);
    });

    $( "#terminalinput")[0].addEventListener('keypress', function(e){
        if (e.code == "Enter"){
            sendAjaxCall("write", $(" #terminalinput ")[0].value);
            $(" #terminalinput ")[0].value = "";
        } else {
            // $( "#terminaltext")[0].innerHTML += e.key;
        }
    });
    
});