 /// <reference path="../typings/index.d.ts" />

$(function () {

    chrome.devtools.inspectedWindow.eval("location.origin", function(result: string, exception) {
        if(!exception){
            // Wire up to the signalr log hub
            var connection = $.hubConnection();
            var logHubProxy = connection.createHubProxy('signalrLogHub');

            //Set where /signalr is
            //So it's the current inspected tab + /signalr
            connection.url = result + "/signalr";

            // Create a function that the hub can call back to display messages.
            logHubProxy.on('appendLogMessage', appendLogMessage);

            connection.start()
                .done(function(){ 
                    console.log('Connection', connection);
                    console.log('Now connected, connection ID=' + connection.id); 
                })
                .fail(function(){
                    //This might be because of Auth problems
                    //Or this page/site does not have the SignalR Log4Net Hub or may not even be an Umbraco site
                    displayError();
                });

        } else{
            console.log('Unable to get the tabs location.origin aka domain');
        }
    });

});

//Main JS function called from SignalR Hub to add a new Log4Net Message
function appendLogMessage(log:logMessage){
    
    //Message displayed in DevTools tab - so user can see/understand the error
    var errorMessage = document.createElement("div");
    errorMessage.className = log.LoggingEvent.Level.Name.toLowerCase();
    errorMessage.innerHTML = "<pre>" + log.FormattedEvent + "</pre>";
    document.body.appendChild(errorMessage);

}


interface logMessage {
    FormattedEvent:string;
    LoggingEvent:logForNet;
}

interface logForNet {
    Domain:string;
    ExceptionString:string;
    LoggerName:string;
    Message:string;
    Level: logForNetLevel;
    //There are more properties available not 100% sure if they are useful
}

interface logForNetLevel {
    DisplayName: string;
    Name: string;
    Value:number;
}

function displayError(){

    //Message displayed in DevTools tab - so user can see/understand the error
    var errorMessage = document.createElement("div");
    errorMessage.innerHTML = "<h1>Error</h1><p>Cannot connect to SignalR Log4Net Hub or you do not have permission to.</p>"
    document.body.appendChild(errorMessage);

}