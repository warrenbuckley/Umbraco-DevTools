using System.Web.Http;
using Umbraco.Core;

namespace Umbraco.DevTools.Logger
{
    public class UmbracoStartup : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            //Now Umbraco has booted up correcrtly & is all configured with DB etc
            //Let's tell Umbraco we want to use CORS & that decorated API Controllers will only allow CORS requests
            //So this will not make existing users API Controllers start accepting CORS unless they opted into this already

            //We do not pass any options/params here otherwise it would make all API controllers etc use this CORS rules
            //Want to use the opt in method of decorating with attributes
            GlobalConfiguration.Configuration.EnableCors();
        }
        
    }
}
