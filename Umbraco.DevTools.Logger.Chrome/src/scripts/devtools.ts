 /// <reference path="../typings/index.d.ts" />

// Chrome API - Inspected Tab - Get the URL so we can inject the SignalR proxy hub JS
chrome.devtools.inspectedWindow.eval("location.origin", function(result: string, exception) {
    if (!exception){

        console.log('Domain of inspected tab', result);
    
        //Manually push/add a script tag to SignalR proxy Hub
        //We assume the SignalR proxy is at http://domain.co.uk + /signalr/hubs
        var signalrProxy = document.createElement("script");
        signalrProxy.src = result + "/signalr/hubs";
        signalrProxy.onload = signalrLoaded;
        signalrProxy.onerror = signalrFailed;

        //Append the JS to the head tag
        document.head.appendChild(signalrProxy);

    }
    else {
        //Used for internal debugging
        console.log("Unable to get the inspected tab location.origin.", exception);

        //Message displayed in DevTools tab - so user can see/understand the error
        var errorMessage = document.createElement("div");
        errorMessage.innerHTML = "<h1>Error</h1>Unable to get in the inspected tab using <pre>location.origin</pre>"
        document.body.appendChild(errorMessage);
        
    }
});


function signalrLoaded(){
    alert('SignalR Loaded');
}

function signalrFailed(){
    alert('FAILED');
}


//Main JS function called from SignalR Hub to add a new Log4Net Message
function appendLogMessage(logMessage:string){
    
    //Just alert what we push from the server
    alert(logMessage);

}