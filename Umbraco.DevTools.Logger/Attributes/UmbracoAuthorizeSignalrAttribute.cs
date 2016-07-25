using System;
using System.Linq;
using System.Security.Principal;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Umbraco.Core.Logging;
using Umbraco.Core.Security;
using Umbraco.Web;
using AuthorizeAttribute = Microsoft.AspNet.SignalR.AuthorizeAttribute;

namespace Umbraco.DevTools.Logger.Attributes
{
    [AttributeUsage(AttributeTargets.Class, Inherited = false, AllowMultiple = false)]
    public class UmbracoAuthorizeSignalrAttribute : AuthorizeAttribute
    {
        private const string LogAuthFailMessage = "Umbraco DevTools; User Authorized failed: {0}";

        public UmbracoAuthorizeSignalrAttribute()
        {
        }

        protected override bool UserAuthorized(IPrincipal user)
        {
            //Not logged in & thus do not have Umbraco auth cookie assigned
            if (user == null)
            {
                LogHelper.Warn<IPrincipal>(string.Format(LogAuthFailMessage, "user == null"));
                return false;
            }

            if (user.Identity == null)
            {
                LogHelper.Warn<IPrincipal>(string.Format(LogAuthFailMessage, "user.Identity == null"));
                //If we cannot get the identity then something weird has gone wrong
                return false;
            }


            if (user.Identity.IsAuthenticated == false)
            {
                LogHelper.Warn<IPrincipal>(string.Format(LogAuthFailMessage, "user.Identity.IsAuthenticated == false"));
                //We got the umbraco auth/identity cookie but its telling ut no longer authenticated
                //Then ensure we do not allow access
                return false;
            }
       
            //Need to try cast Identity to Umbraco specific type
            //Again if it's not this then we have some other auth token/cookie & bail out
            if (user.Identity is Umbraco.Core.Security.UmbracoBackOfficeIdentity == false)
            {
                LogHelper.Warn<IPrincipal>(string.Format(LogAuthFailMessage, "user.Identity is Umbraco.Core.Security.UmbracoBackOfficeIdentity == false"));
                //Not the correct object/type we are expecting for the Identity property
                return false;
            }

            //Explicitly cast to UmbracoBackOfficeIdentity
            var umbracoIdentity = (UmbracoBackOfficeIdentity) user.Identity;

            //Check if the ticket/auth expired or not?
            if (umbracoIdentity.Ticket.Expired)
            {
                LogHelper.Warn<IPrincipal>(string.Format(LogAuthFailMessage, "umbracoIdentity.Ticket.Expired"));
                return false;
            }

            //Ensure user has access to the developer section
            if (umbracoIdentity.AllowedApplications.Contains("developer") == false)
            {
                LogHelper.Warn<IPrincipal>(string.Format(LogAuthFailMessage, "umbracoIdentity.AllowedApplications.Contains(\"developer\") == false"));
                //May have access to other areas of Umbraco
                //But makes sense that developers or users who have access to developer section can run this tool
                return false;
            }

            //TODO: Should we check if user is in admin group/role?
            //Was expecting it on this identity object inside roles but is empty
         
            //Passed all above tests - so logged in & valid still
            //Return true
            return true;
            
        }
    }
}
