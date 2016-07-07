using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Microsoft.Owin.Cors;
using Owin;
using Umbraco.DevTools.Logger;
using Umbraco.Web;

// To use this startup class, change the appSetting value in the web.config called 
// "owin:appStartup" to be "UmbracoDevToolsLoggerOwinStartup"
[assembly: OwinStartup("UmbracoDevToolsLoggerOwinStartup", typeof(UmbracoDevToolsLoggerOwinStartup))]
namespace Umbraco.DevTools.Logger
{
    public class UmbracoDevToolsLoggerOwinStartup : UmbracoDefaultOwinStartup
    {
        public override void Configuration(IAppBuilder app)
        {

            //Carry on doing the normal Umbraco OWIN stuff required to make Umbraco work
            base.Configuration(app);

            // http://www.asp.net/signalr/overview/guide-to-the-api/hubs-api-guide-javascript-client#crossdomain
            // Branch the pipeline here for requests that start with "/signalr"
            app.Map("/signalr", map =>
            {
                // Setup the CORS middleware to run before SignalR.
                // By default this will allow all origins. You can 
                // configure the set of origins and/or http verbs by
                // providing a cors options with a different policy.
                map.UseCors(CorsOptions.AllowAll);
                var hubConfiguration = new HubConfiguration
                {
                    // You can enable JSONP by uncommenting line below.
                    // JSONP requests are insecure but some older browsers (and some
                    // versions of IE) require JSONP to work cross domain
                    // EnableJSONP = true
                };
                // Run the SignalR pipeline. We're not using MapSignalR
                // since this branch already runs under the "/signalr"
                // path.
                map.RunSignalR(hubConfiguration);
            });

        }
    }
}
