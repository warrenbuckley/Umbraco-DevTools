# Umbraco Dev Tools
A Chrome Extension to view live logs from an Umbraco Website. WIth future plans to see more detailed view/report of MiniProfiler results, along with a few other useful tools to add to your toolkit.

![Screenshot of Umbraco Developer Tools](https://raw.githubusercontent.com/warrenbuckley/Umbraco-DevTools/master/md-images/github-screenshot.png)

## Why build this?
I personally always wanted to build a Chrome Extension and learn something a bit new, but I find sometime trawling through large or long logfiles hard & cumbersome. So I thought it would be a nicer debugging experience that you open a Chrome Developer Tools and see logs in realtime whilst you perform the set of actions that is casuing an error or irregularity. With seeing logs in realtime you will be able to pinpoint the problem a lot quicker.

## Requirements for usage
Due to some underlying OWIN MiddleWare startup code for Umbraco that I need to hook into, this now requires a minimum of at least 7.5 beta 2 and the associated Chrome Extension from the Chrome Store - https://chrome.google.com/webstore/detail/umbraco-developer-tools/gjcgemjmhmgcmioedcghnemmadcimjia

## Projects
An overview of what makes up this project

* `Umbraco.DevTools.Chrome`<br/>
This is the code for the Chrome Extension itself which is made up of client side assets, that includes the logging extension that connects to the Logger SignalR Hub, along with the Mini Profiler results viewer

* `Umbraco.DevTools.TestSite`<br/>
This contains a sample Umbraco website allowing us to test and set debug points in the main C# project

* `Umbraco.DevTools.Logger`<br/>
This contains the code for Log4Net appender and the SignalR hub that pushes Log4Net log messages to our Chrome extension

## Setup & Configuration
The Nuget package & Umbraco zip should handle this for you automatically. You may use the following below as reference:

### SignalR Setup
To ensure the SignalR hub is registered and picks up the custom SignalR Authorize attribute to determine if you have logged into Umbraco, we need to tell Umbraco what OWIN startup class we want to use, by modifying the web.config of your Umbraco site to the following

`<add key="owin:appStartup" value="UmbracoDevToolsLoggerOwinStartup" />`

### Log4Net Configuration
Add the following to your Log4Net config inside the `<root>` element
```
<appender-ref ref="ChromeDevToolsAppender" />
```

Next add a new appender element to the file as follows:
```
<appender name="ChromeDevToolsAppender" type="Umbraco.DevTools.Logger.Appender.SignalrLogAppender,Umbraco.DevTools.Logger">
  <layout type="log4net.Layout.PatternLayout">
    <conversionPattern value="%date [P%property{processId}/D%property{appDomainId}/T%thread] %-5level %logger - %message%newline" />
  </layout>
</appender>
```
