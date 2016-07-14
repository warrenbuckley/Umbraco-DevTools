 /// <reference path="../typings/index.d.ts" />

let hasMiniProfilerHeaders = false;
let miniProfilerIds:Array<string> = [];

//Listen to connection from profiler-devtools
chrome.runtime.onConnect.addListener(function(devToolsConnection) {

  //When we are connected from Chrome DevTools Tab
  //We can add two webRequest event listeners (As we can only get webRequest API in BG page)

  //Before any 'main_frame' request happens so not CSS, JS etc...
  chrome.webRequest.onBeforeRequest.addListener(function(details) {
    
    console.log('on before request', details);

    //Reset Profile IDs & check
    //So we don't send previous request IDs in a response when the onComplete event finishes
    miniProfilerIds = [];
    hasMiniProfilerHeaders = false;

    //Simple JSON payload message that we will use to let the DevTools Tab UI
    //To clear out the UI
    var message:payloadMessage = {
      resetUi: true,
      containsProfileIds: false,
      profileIds: []
    };

    //Send our message back to our connected devtools page
    devToolsConnection.postMessage(message);

  },
  {urls: ["http://*/*", "https://*/*"], types: ["main_frame"]},
  ["blocking"]);
  
  //When the request has finished, we check for any mini-profiler response headers
  chrome.webRequest.onCompleted.addListener(function(details) {
    
    let responseHeaders = details.responseHeaders;
    console.log('request finished', details);
    console.log('request finished headers', responseHeaders);

    //Loop over the response headers
    for (var index = 0; index < responseHeaders.length; index++) {
        var headerItem = responseHeaders[index];

        if(headerItem.name === 'X-MiniProfiler-Ids'){
            hasMiniProfilerHeaders = true;

            //Parsing as JSON so we get an array of IDs
            //As the value is a string not a real JS array object
            let profilerIds = JSON.parse(headerItem.value);

            //Loop over this & push into our real array
            for (var i=0; i < profilerIds.length; i++) {
                miniProfilerIds.push( profilerIds[i] );
            }
        }
    }

    //Once finished looking at the headers
    //Lets send back what we found
    var message:payloadMessage = {
      resetUi: false,
      containsProfileIds: hasMiniProfilerHeaders,
      profileIds: miniProfilerIds
    };
    
    //Send the message back
    devToolsConnection.postMessage(message);

  },
  {urls: ["http://*/*", "https://*/*"], types: ["main_frame"]},
  ["responseHeaders"]);     

});


interface payloadMessage {
  resetUi: boolean;
  containsProfileIds: boolean;
  profileIds: Array<string>;
}