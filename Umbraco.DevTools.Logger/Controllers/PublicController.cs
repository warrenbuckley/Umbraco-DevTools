using System.Web.Http;
using System.Web.Http.Cors;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;

namespace Umbraco.DevTools.Logger.Controllers
{
    /// <summary>
    /// /Umbraco/DevTools/Public/
    /// </summary>
    [PluginController("DevTools")]
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class PublicController : UmbracoApiController
    {
        [HttpGet]
        // /Umbraco/DevTools/Public/Ping
        public string Ping()
        {
            return "Pong";
        }
    }
}
