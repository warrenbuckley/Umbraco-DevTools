 /// <reference path="../typings/index.d.ts" />

/*
    TODO
    Add in toolbar UI
    Connected or disconnected message
    Add in button to connect (if disconnected)
    Add in button to disconnected (if connected)
*/

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


                //Snippet from SignalR docs
                //http://www.asp.net/signalr/overview/guide-to-the-api/handling-connection-lifetime-events#notifydisconnect
                var tryingToReconnect = false;

                //Reconnecting event
                connection.reconnecting(function(){
                    tryingToReconnect = true;
                    console.log('Reconnecting event fired');
                });

                //Reconnected event
                connection.reconnected(function(){
                    tryingToReconnect = false;
                    console.log('Reconnected event fired');
                });

                //Disconnect event
                connection.disconnected(function(){
                    console.log('Disconnect event (Trying to Reconnect?)', tryingToReconnect);

                    if(tryingToReconnect){
                        //Trying to reconnect the client due to connectivity
                        appendReconnectMessage();
                    }
                    else {
                        //The client was disconnected (either by server)
                        appendDisconnectedMessage();
                    }
                });


                //Error Event
                connection.error(function (error) {
                    console.log('SignalR error: ' + error)
                });

        } else{
            console.log('Unable to get the tabs location.origin aka domain');
        }
    });

    //Get the Mustache template via a simple GET & pre-parse it
    fetchMustacheTemplate();

    //Button click event - To clear logs
    var clearButton = document.getElementById('clearButton');
    clearButton.addEventListener('click', clearLogs);

});

function fetchMustacheTemplate(){

    //Load & cache the mustache template
    //Fetch Mustache Template with jQuery AJAX get
    var templateRequest = new XMLHttpRequest();
    templateRequest.open('GET','templates/log-item.mst', true);
    templateRequest.onreadystatechange = function(){
        if(templateRequest.status !== 200){
            console.log('Problem fetching mustache template');
            return;
        }

        //The mustache template as HTML
        logItemTemplate = templateRequest.responseText;

        //Parse the template once on DOM load
        //No need to fetch it every time
        Mustache.parse(logItemTemplate);
    };
    templateRequest.send();

}

function toggleDetailsDisplay(e:Event){
    e.preventDefault();
    console.log('clicked item', e);

    var clickedElement = e.srcElement;
    var summaryElement;

    if(clickedElement.nodeName.toLowerCase() === "span"){
        //We clicked the span inside the div - so get the parent div
        summaryElement = clickedElement.parentElement;
    }
    else {
        //We clicked the actual div - yay
        summaryElement = clickedElement;
    }

    //Get next sibling of the clicked item
    //Which should be the .details div
    var details = summaryElement.nextElementSibling;
    details.classList.toggle('show');
}

function clearLogs(e:Event) {
    e.preventDefault();
    document.getElementById('importantMessages').innerHTML = '';
    document.getElementById('logs').innerHTML = '';
}

function addMessage(message:string, cssClass:string, appendToImportant:boolean = false){
    //Message displayed in DevTools tab - so user can see/understand the error
    var messageToDisplay = document.createElement("div");
    messageToDisplay.classList.add('log-item');
    messageToDisplay.classList.add(cssClass);
    messageToDisplay.innerHTML = '<pre>' + message + '</pre>';

    if(appendToImportant){
        //Select the main importantMessages div by it's id to inject messages
        document.getElementById('importantMessages').appendChild(messageToDisplay);
    }
    else {
        //Add to the bottom of the logs
        document.getElementById('logs').appendChild(messageToDisplay);
    }

    
}

function appendConnectedMessage(){
    addMessage('Connected to Umbraco Logging...', 'INFO', true);
}

function appendDisconnectedMessage(){
    addMessage('Disconnected from Umbraco Logging...', 'INFO');
}

function appendReconnectMessage(){
    addMessage('Reconnecting to Umbraco Logging...', 'INFO');
}

function displayError(){
    addMessage('Error: Cannot connect to SignalR Log4Net Hub or you do not have permission to.', 'ERROR');
}

//Main JS function called from SignalR Hub to add a new Log4Net Message
function appendLogMessage(log:logMessage){
    
    //Get value of checkbox in toolbar
    var checkbox = document.getElementById('pauseLogger');

    //Only log items to the DIV if checkbox is NOT checked
    if(checkbox.checked === false){
        console.log('Log Item', log);

        var rendered = Mustache.render(logItemTemplate, log);

        //Message displayed in DevTools tab - so user can see/understand the error
        var logMessage = document.createElement("div");

        // Set the HTML from the MustacheJS template
        logMessage.innerHTML = rendered;

        var logs =  document.getElementById('logs');

        //Select the main logs div by it's id to inject messages
        logs.appendChild(logMessage);

        //Find the '.summary' div that gets added from mustache template
        //and wire up click event handler - as not like jQuery where new DOM items will have same click
        //Select first item in 0 based array (should only ever be one result)
        var summary = logMessage.getElementsByClassName('summary')[0];
        summary.addEventListener('click', toggleDetailsDisplay);

        //Scroll to bottom of page/log items
        var logContainer = document.getElementById('items');
        logContainer.scrollTop = logContainer.scrollHeight;
    }
       
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

