using Microsoft.Owin;
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
            //Setup SignalR
            app.MapSignalR();

            //Carry on doing the normal Umbraco OWIN stuff required to make Umbraco work
            base.Configuration(app);
        }
    }
}
