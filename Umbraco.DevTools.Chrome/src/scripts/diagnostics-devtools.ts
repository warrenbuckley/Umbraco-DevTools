 /// <reference path="../typings/index.d.ts" />


// Do an AJAX HTTP Get to API
chrome.devtools.inspectedWindow.eval("location.origin", function(result: string, exception) {
        if(!exception){
            
            //Set where /signalr is
            //So it's the current inspected tab + /Umbraco/DevTools/Public/Ping
            var apiUrl = result + "/Umbraco/DevTools/Public/Ping";

             //Perform AJAX get of JSON
            //Use JS Fetch as opposed to XMLHttpRequest
            fetch(apiUrl, { method: 'GET', mode: 'cors'}).then(function(response) {
                console.log('response', response);
                return response.json();
            }).then(function(returnedValue) {

                console.log('Returned value', returnedValue);

            }).catch(function(err) {
               console.log('Problem calling API', err);
            });
                
        } else{
            console.log('Unable to get the tabs location.origin aka domain');
        }
    });