/// <reference path="../typings/index.d.ts" />

chrome.devtools.panels.create(
    "Umbraco Logs",
    "images/icon.png",
    "views/logger-devtools.html",
    function(panel){
        
        //Callback function - anything useful in panel object to use?
        console.log('Logger Panel', panel);
    }
);

chrome.devtools.panels.create(
    "Umbraco Diagnostics",
    "images/icon.png",
    "views/diagnostics-devtools.html",
    function(panel){
        
        //Callback function - anything useful in panel object to use?
        console.log('Diagnostics Panel', panel);
    }
);