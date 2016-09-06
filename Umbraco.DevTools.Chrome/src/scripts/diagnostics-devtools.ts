/// <reference path="../typings/index.d.ts" />
var cookies, generalMustacheTemplate, assembliesMustacheTemplate = "";
chrome.devtools.inspectedWindow.eval("document.cookie", function (result, exception) {
    if (!exception) {
        console.log('Cookie result', result);
        //Set the inspected page cookie to our cookies variable
        cookies = result;
    }
});

// Do an AJAX HTTP Get to API
chrome.devtools.inspectedWindow.eval("location.origin", function (result, exception) {
    if (!exception) {

        preFetchMustacheTemplates();
        getGeneralInfo(result);
        getAssemblies(result);
        
    }
    else {
        console.log('Unable to get the tabs location.origin aka domain');
    }
});

function getGeneralInfo(baseUrl) {
    //So it's the current inspected tab + /Umbraco/DevTools/Public/Ping
    var apiUrl = baseUrl + "/umbraco/backoffice/DevTools/Diagnostics/GetGeneralInfo";
    //We use the current inspected tab's cookies - & if they have auth'd to Umbraco backoffice
    //Then we can use it for our AJAX request to the backoffice API
    console.log('Setting cookies to ', cookies);
    document.cookie = cookies;
    var apiRequest = new XMLHttpRequest();
    apiRequest.open('GET', apiUrl, true);
    apiRequest.onreadystatechange = function () {
        if (apiRequest.status !== 200 || apiRequest.readyState != 4) {
            return;
        }
        //Not logged in to Umbraco backoffice
        if (apiRequest.status == 401 && apiRequest.readyState == 4) {
            console.log('UNAUTH');
        }
        console.log('apiRequest', apiRequest);
        console.log('Response from API', apiRequest.responseText);
        //Parse & render the JSON response using mustache
        appendGeneralInfo(apiRequest.responseText);
    };
    apiRequest.withCredentials = true;
    apiRequest.send();
}

function getAssemblies(baseUrl) {
    //So it's the current inspected tab + /Umbraco/DevTools/Public/Ping
    var apiUrl = baseUrl + "/umbraco/backoffice/DevTools/Diagnostics/GetAssemblies";
    //We use the current inspected tab's cookies - & if they have auth'd to Umbraco backoffice
    //Then we can use it for our AJAX request to the backoffice API
    console.log('Setting cookies to ', cookies);
    document.cookie = cookies;
    var apiRequest = new XMLHttpRequest();
    apiRequest.open('GET', apiUrl, true);
    apiRequest.onreadystatechange = function () {
        if (apiRequest.status !== 200 || apiRequest.readyState != 4) {
            return;
        }
        //Not logged in to Umbraco backoffice
        if (apiRequest.status == 401 && apiRequest.readyState == 4) {
            console.log('UNAUTH');
        }
        console.log('apiRequest', apiRequest);
        console.log('Response from API', apiRequest.responseText);
        //Parse & render the JSON response using mustache
        appendAssemblies(apiRequest.responseText);
    };
    apiRequest.withCredentials = true;
    apiRequest.send();
}

function preFetchMustacheTemplates() {
    //Load & cache the mustache template
    //Fetch Mustache Template with jQuery AJAX get
    var generalTemplate = new XMLHttpRequest();
    generalTemplate.open('GET', 'templates/diagnostics/general-info.mst', true);
    generalTemplate.onreadystatechange = function () {
        if (generalTemplate.status !== 200) {
            console.log('Problem fetching mustache template');
            return;
        }
        //The mustache template as HTML
        generalMustacheTemplate = generalTemplate.responseText;
        //Parse the template once on DOM load
        //No need to fetch it every time
        Mustache.parse(generalMustacheTemplate);
    };
    generalTemplate.send();
    
    var assembliesTemplate = new XMLHttpRequest();
    assembliesTemplate.open('GET', 'templates/diagnostics/assemblies.mst', true);
    assembliesTemplate.onreadystatechange = function () {
        if (assembliesTemplate.status !== 200) {
            console.log('Problem fetching mustache template');
            return;
        }
        //The mustache template as HTML
        assembliesMustacheTemplate = assembliesTemplate.responseText;
        //Parse the template once on DOM load
        //No need to fetch it every time
        Mustache.parse(assembliesMustacheTemplate);
    };
    assembliesTemplate.send();
}

function appendGeneralInfo(json) {
    //Parse the string into real JSON object for Mustache
    var realJson = JSON.parse(json);
    var rendered = Mustache.render(generalMustacheTemplate, realJson);
    var data = document.getElementById('general-data');
    data.innerHTML = rendered;
}

function appendAssemblies(json) {
    //Parse the string into real JSON object for Mustache
    var realJson = JSON.parse(json);
    var rendered = Mustache.render(assembliesMustacheTemplate, realJson);
    var data = document.getElementById('assemblies-data');
    data.innerHTML = rendered;
}
