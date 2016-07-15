 /// <reference path="../typings/index.d.ts" />


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
//Init stuff...
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
        document.getElementById('importantMessages').innerHTML = '';
        document.getElementById('profiles').innerHTML = '';
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
    errorMessage.innerHTML = "<pre>Error: The site does not contain any Mini-Profiler response headers. Ensure the site is in debug mode.</pre>";
    
    //Select the main importantMessages div by it's id to inject messages
    document.getElementById('importantMessages').appendChild(errorMessage);
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
            //Use JS Fetch as opposed to XMLHttpRequest
            fetch(baseUrl + id, { method: 'GET', mode: 'cors'}).then(function(response) {
                return response.json();
            }).then(function(returnedValue) {

                console.log(returnedValue);
                var rendered = Mustache.render(profileItemTemplate, returnedValue);

                //Append item to the UI
                renderProfilerItem(rendered);

            }).catch(function(err) {
               console.log('Problem fetching JSON for profile ID: ' + id);
            });

        });

    });
}

function renderProfilerItem(renderedHtml){

    //Add the HTML to the items div
    var profileMessage = document.createElement("div");

    // Set the HTML from the MustacheJS template
    profileMessage.innerHTML = renderedHtml;

    //Find the '.summary' div that gets added from mustache template
    //and wire up click event handler - as not like jQuery where new DOM items will have same click
    //Select first item in 0 based array (should only ever be one result)
    var summary = profileMessage.getElementsByClassName('summary')[0];
    summary.addEventListener('click', toggleDetailsDisplay);

    var profiles =  document.getElementById('profiles');

    //Select the main logs div by it's id to inject messages
    profiles.appendChild(profileMessage);
}

function toggleDetailsDisplay(e:Event){
    e.preventDefault();
    console.log('clicked item', e);

    var clickedElement = e.srcElement;
    var summaryElement;

    if(clickedElement.nodeName.toLowerCase() === "strong" || clickedElement.nodeName.toLowerCase() === "small"){
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

interface payloadMessage {
  resetUi: boolean;
  containsProfileIds: boolean;
  profileIds: Array<string>;
}