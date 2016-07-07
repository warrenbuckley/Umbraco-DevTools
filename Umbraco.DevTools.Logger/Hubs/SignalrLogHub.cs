using Microsoft.AspNet.SignalR;
using Umbraco.DevTools.Logger.Appender;
using Umbraco.DevTools.Logger.Attributes;
using Umbraco.Web.Mvc;

namespace Umbraco.DevTools.Logger.Hubs
{
    
    [UmbracoAuthorizeSignalr]
    public class SignalrLogHub : Hub
    {
        public SignalrLogHub()
        {
            SignalrLogAppender.Instance.MessageLogged = MessageLogged;
        }

        /// <summary>
        /// For all connected SignalR clients, push the Log4Net log message to them.
        /// In our case we will be pushing the log message to a connected Chrome DevTools client
        /// </summary>
        private void MessageLogged(LogEntry logEntry)
        {
            //So when this is invoked by Log4Net
            //We need to invoke the JS function appendLogMessage on all clients
            Clients.All.appendLogMessage(logEntry);
        }
        

        // See if we need to do anything smart when the cleitn first connects or disconnects
        //public override Task OnConnected()
        //{
        //    return base.OnConnected();
        //}

        //public override Task OnDisconnected(bool stopCalled)
        //{
        //    return base.OnDisconnected(stopCalled);
        //}
    }
}
