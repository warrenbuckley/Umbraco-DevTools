using System;
using System.Security.Claims;
using System.Security.Principal;
using Microsoft.AspNet.SignalR;
using Umbraco.Core;
using Umbraco.Web;

namespace Umbraco.DevTools.Logger.Attributes
{
    [AttributeUsage(AttributeTargets.Class, Inherited = false, AllowMultiple = false)]
    public class UmbracoAuthorizeSignalrAttribute : AuthorizeAttribute
    {
        public UmbracoAuthorizeSignalrAttribute()
        {
        }

        protected override bool UserAuthorized(IPrincipal user)
        {
            if (user == null)
            {
                return false;
            }

            var isAuthd = user.Identity.IsAuthenticated;

            return isAuthd;
            

            //var principal = user as ClaimsPrincipal;

            //if (principal != null)
            //{
            //    Claim authenticated = principal.FindFirst(ClaimTypes.);
            //    if (authenticated != null && authenticated.Value == "true")
            //    {
            //        return true;
            //    }
            //    else
            //    {
            //        return false;
            //    }
            //}
            //else
            //{
            //    return false;
            //}

            //try
            //{
            //    //we need to that the app is configured and that a user is logged in
            //    if (ApplicationContext.Current.IsConfigured == false)
            //        return false;

            //    var isLoggedIn = UmbracoContext.Current.Security.IsAuthenticated();
            //    return isLoggedIn;
            //}
            //catch (Exception ex)
            //{
            //    return false;
            //}
        }
    }
}
