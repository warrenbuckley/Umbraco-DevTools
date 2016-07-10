 /// <reference path="../typings/index.d.ts" />

var logItemTemplate = '';

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

                    //Display our conencted/welcome message
                    appendConnectedMessage();
                    
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

    //Load & cache the mustache template
    //Fetch Mustache Template with jQuery AJAX get
    $.get('templates/log-item.mst', function(templateMarkup) {

        //The mustache template as HTML
        logItemTemplate = templateMarkup;

        //Parse the template once on DOM load
        //No need to fetch it every time
        Mustache.parse(logItemTemplate);

    }, "html"); //Had to explictly set mime type to HTML

    
    $(document).on("click", ".summary", function(event){
        event.preventDefault();
        $(this).next('div.details').toggle();
    }); 

});

function appendConnectedMessage(){
    //Message displayed in DevTools tab - so user can see/understand the error
    var errorMessage = document.createElement("div");
    errorMessage.innerHTML = "<pre> Connected</pre>";

    //Select the main importantMessages div by it's id to inject messages
    document.getElementById('importantMessages').appendChild(errorMessage);

}

//Main JS function called from SignalR Hub to add a new Log4Net Message
function appendLogMessage(log:logMessage){
    
    console.log('log', log);

    var rendered = Mustache.render(logItemTemplate, log);

    //Message displayed in DevTools tab - so user can see/understand the error
    var errorMessage = document.createElement("div");

    // Set the HTML from the MustacheJS template
    errorMessage.innerHTML = rendered;

    //Select the main logs div by it's id to inject messages
    document.getElementById('logs').appendChild(errorMessage);

    //Scroll to bottom of page
    window.scrollTo(0, document.body.scrollHeight);   
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