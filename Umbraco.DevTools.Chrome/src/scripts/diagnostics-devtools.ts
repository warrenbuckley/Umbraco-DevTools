/// <reference path="../typings/index.d.ts" />

var cookies, 
generalMustacheTemplate = "", 
assembliesMustacheTemplate = "",
permissionsMustacheTemplate = "",
umbracoMustacheTemplate = "";


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

        var baseUrl = result.toString();

        //Sections in the UI
        getApiResults(baseUrl, "GetGeneralInfo", "general-info.mst", "general-data");
        getApiResults(baseUrl, "GetAssemblies", "assemblies.mst", "assemblies-data");
        getApiResults(baseUrl, "GetFolderPermissions", "permissions.mst", "permissions-data");
        getApiResults(baseUrl, "GetMacros", "macros.mst", "macros-data");
        getApiResults(baseUrl, "GetRoutes", "routes.mst", "routes-data");
        getApiResults(baseUrl, "GetSections", "sections.mst", "sections-data");
    }
    else {
        console.log('Unable to get the tabs location.origin aka domain');
    }
});


function getApiResults(baseUrl:string, apiEndpoint:string, mustacheTemplate: string, elementId: string){
    //So it's the current inspected tab + /Umbraco/DevTools/Public/Ping
    var apiUrl = baseUrl + "/umbraco/backoffice/DevTools/Diagnostics/" + apiEndpoint;
    
    //We use the current inspected tab's cookies - & if they have auth'd to Umbraco backoffice
    //Then we can use it for our AJAX request to the backoffice API
    console.log('Setting cookies to ', cookies);
    document.cookie = cookies;

    var apiRequest = new XMLHttpRequest();
    apiRequest.open('GET', apiUrl, true);
    apiRequest.onreadystatechange = function () {
       
        //Not logged in to Umbraco backoffice or route nto found
         if ((apiRequest.status === 401 && apiRequest.readyState === 4) || (apiRequest.status === 404 && apiRequest.readyState === 4) {
            console.log('UNAUTH');

            document.getElementById(elementId).innerHTML = "<span class='error'>Ensure you are logged into the Umbraco backoffice</span>";
        }

        if(apiRequest.status === 200 && apiRequest.readyState === 4){
            
            //Parse & render the JSON response using mustache
            appendResults(apiRequest.responseText, mustacheTemplate, elementId);
        }
        
    };
    apiRequest.withCredentials = true;
    apiRequest.send();
}

function appendResults(json:string, mustacheTemplate:string, elementId:string){
    //Parse the string into real JSON object for Mustache
    var realJson = JSON.parse(json);

    //Fetch the .mst template file 
    var templateRequest = new XMLHttpRequest();
    templateRequest.open('GET', 'templates/diagnostics/' + mustacheTemplate, true);
    templateRequest.onreadystatechange = function () {
        if (templateRequest.status !== 200) {
            console.log('Problem fetching mustache template');
            return;
        }

        if(templateRequest.status === 200 && templateRequest.readyState === 4) {
            //The mustache template as HTML in responseText from Request
            var rendered = Mustache.render(templateRequest.responseText, realJson);
            var data = document.getElementById(elementId);
            data.innerHTML = rendered;
        }
    };
    templateRequest.send();    
}