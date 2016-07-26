 /// <reference path="../typings/index.d.ts" />


// Do an AJAX HTTP Get to API

$(function () {

    chrome.devtools.inspectedWindow.eval("location.origin", function(result: string, exception) {
        if(!exception){
            
            //Set where /signalr is
            //So it's the current inspected tab + /Umbraco/DevTools/Public/Ping
            var apiUrl = result + "/Umbraco/DevTools/Public/Ping";

                
        } else{
            console.log('Unable to get the tabs location.origin aka domain');
        }
    });

});
