using System;
using System.Security.Principal;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Umbraco.Core.Security;
using Umbraco.Web;
using AuthorizeAttribute = Microsoft.AspNet.SignalR.AuthorizeAttribute;

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

            var auth = UmbracoContext.Current.HttpContext.GetUmbracoAuthTicket();
            
            //If we do not get an Umb Auth Ticket/Cookie then
            //Not logged in at all
            if (auth == null)
            {
                return false;
            }

            //Next let's check the AuthTicket has expired or not.
            //If it has then prevent access
            if (auth.Expired)
            {
                return false;
            }
            
            //The name (login/username) is empty on AuthTicket
            if (string.IsNullOrEmpty(auth.Name))
            {
                return false;
            }

            //Still verify we can get the user from UserService
            //Just in case the AuthTicket for user is no longer valid (user deleted or user denied access)
            var currentUser = UmbracoContext.Current.Application.Services.UserService.GetByUsername(auth.Name);

            if (currentUser == null)
            {
                return false;
            }

            //Been revoked access to Umbraco since the auth ticket/cookie was granted
            if (currentUser.IsApproved == false)
            {
                return false;
            }
            
            //TODO: Unsure if I should check if the logged in backoffice user has access to the 'developer' section or not

            //Passed all above tests - so logged in & valid still
            //Return true
            return true;
            
        }
    }
}
