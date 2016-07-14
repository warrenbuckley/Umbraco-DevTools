/// <reference path="../typings/index.d.ts" />

chrome.devtools.panels.create(
    "Umbraco Logs",
    "images/icon.png",
    "views/logger-devtools.html",
    function(panel){
        
        //Callback function - anything useful in panel object to use?
        console.log('panel', panel);
    }
);

chrome.devtools.panels.create(
    "Umbraco Profiler",
    "images/icon.png",
    "views/profiler-devtools.html",
    function(panel){
        
        //Callback function - anything useful in panel object to use?
        console.log('panel', panel);
    }
);