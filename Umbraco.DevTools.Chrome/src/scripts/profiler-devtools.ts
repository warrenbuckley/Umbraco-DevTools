 /// <reference path="../typings/index.d.ts" />

let hasMiniProfilerHeaders = false;

//On a refresh we need to clear out the results
let miniProfilerIds = [];

// //When any request has finished in the current page
// chrome.devtools.network.onRequestFinished.addListener(function(request) {

    // let headers = request.response.headers;

    // Loop over the response headers
    // for (var index = 0; index < headers.length; index++) {
    //     var headerItem = headers[index];

    //     if(headerItem.name === 'X-MiniProfiler-Ids'){
    //         hasMiniProfilerHeaders = true;

    //         Parsing as JSON so we get an array of IDs
    //         As the value is a string not a real JS array object
    //         let profilerIds = JSON.parse(headerItem.value);

    //         for (var i=0; i < profilerIds.length; i++) {
    //             miniProfilerIds.push( profilerIds[i] );
    //         }

    //         console.log('miniProfilerIds for request', miniProfilerIds);
    //     }
    // }

//     if(!hasMiniProfilerHeaders){
//         displayNoProfilersFound();
//     } else {
//         fetchProfileItems();
//     }

// });



// Request Finish (HTML, CSS, JS, img, will all fire)
// Check Response Header for mini-profilers
// Add only distinct IDs to the array - Check it exists before adding

// When ALL requests/page finished THEN
// We count/check for any items in the array
// None - then display an error message in the UI
// Got some IDs then AJAX get each JSON result - for each response do some Mustache template & inject into UI

// When requests/page START or refreshed THEN we need to clear out past/previous results in our array
// Along with the UI. Would need clearing


var profileItemTemplate = '';

//Open up a connection to our profiler-background JS file
var backgroundPageConnection = chrome.runtime.connect({
    name: "devtools-umbraco-profiler-page"
});


backgroundPageConnection.onMessage.addListener(function (message:payloadMessage) {
    // The background page JS code is monitoring all WebRequests for 'main_frame' so not JS, CSS, images
    // In the background file we we see if the page has mini-profiler header IDs
    // This background page after request has finished will send us a custom JSON object
    // Containing a simple bool if we found Mini-Profiler IDs & then array of ID's if found

    // Another message that we will recieve from background is when a new request starts
    // This is so we can a clear bool flag & clear out any previous mini profiler requests in the UI

    //Call a function here - handleMessage(message)

    console.log('Recieved message from bg page', message);
    handleMessage(message);

});


//Get the Mustache template via a simple GET & pre-parse it
fetchMustacheTemplate();


//Parse Mustache JS ahead of time to speed things up & only fetch the template once
function fetchMustacheTemplate(){

    //Load & cache the mustache template
    //Fetch Mustache Template with jQuery AJAX get
    var templateRequest = new XMLHttpRequest();
    templateRequest.open('GET','templates/profile-item.mst', true);
    templateRequest.onreadystatechange = function(){
        if(templateRequest.status !== 200){
            console.log('Problem fetching mustache template');
            return;
        }

        //The mustache template as HTML
        profileItemTemplate = templateRequest.responseText;

        //Parse the template once on DOM load
        //No need to fetch it every time
        Mustache.parse(profileItemTemplate);
    };
    templateRequest.send();
}


function handleMessage(message:payloadMessage){
    
    //Clear out the UI
    if(message.resetUi){
        document.getElementById('items').innerHTML = '';
    }

    //No profiler id's in response - display error messahe
    if(message.containsProfileIds == false && message.resetUi == false){
        displayError();
    }

    //Found Profiler IDs AND the array of IDs is not empty
    if(message.containsProfileIds && message.profileIds.length > 0){
        fetchProfilers(message);
    }
}

function displayError(){
    
    //Message displayed in DevTools tab - so user can see/understand the error
    var errorMessage = document.createElement("div");
    errorMessage.classList.add('log-item');
    errorMessage.classList.add('ERROR');
    errorMessage.innerHTML = "Error: The site does not contain any Mini-Profiler response headers. Ensure the site is in debug mode.";
    
    //Select the main importantMessages div by it's id to inject messages
    document.getElementById('items').appendChild(errorMessage);
}

function fetchProfilers(message:payloadMessage){

    var baseUrl = '';

    chrome.devtools.inspectedWindow.eval("window.location.origin", function(result, isException) {
      var currentPageUrl = result.toString();

      //http://localhost:54152?umbDebug=true
      //http://localhost:54152

      //Append mini-profiler url to fetch raw JSON (popup=1) returns JSON as opposed to HTML
      baseUrl = currentPageUrl + '/mini-profiler-resources/results?popup=1&id=';

        //Loop over the IDs in the array & AJAX get each one based on the mini-profiler URL convention
        message.profileIds.forEach(id => {
            
            //Perform AJAX get of JSON 
            var jsonRequest = new XMLHttpRequest();
            jsonRequest.open('GET', baseUrl + id, true);
            jsonRequest.onreadystatechange = function(){
                if(jsonRequest.status !== 200){
                    console.log('Problem fetching JSON for profile ID: ' + id);
                    return;
                }

                //The mustache template as HTML
                var json = jsonRequest.responseText;
                console.log('json for id: ' + id, json);

                var rendered = Mustache.render(profileItemTemplate, json);

                //Append item to the UI
                renderProfilerItem(rendered);
            };
            jsonRequest.send();

        });

    });
}

function renderProfilerItem(renderedHtml){

    //Add the HTML to the items div
    var profileMessage = document.createElement("div");

    // Set the HTML from the MustacheJS template
    profileMessage.innerHTML = renderedHtml;

    var items =  document.getElementById('items');

    //Select the main logs div by it's id to inject messages
    items.appendChild(profileMessage);
}

interface payloadMessage {
  resetUi: boolean;
  containsProfileIds: boolean;
  profileIds: Array<string>;
}