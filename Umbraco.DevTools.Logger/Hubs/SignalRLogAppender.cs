using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;

namespace Umbraco.DevTools.Logger.Hubs
{
    public class SignalRLogAppender : Hub
    {
        public void Send(string name, string message)
        {
            //Call the broadcastMessage JS Function to update clients.
            Clients.All.broadcastMessage(name, message);
        }

        /// <summary>
        /// For all connected SignalR clients, push the Log4Net log message to them.
        /// In our case we will be pushing the log message to a connected Chrome DevTools client
        /// </summary>
        /// <param name="log">The Log4Net message</param>
        public void SendLogMessage(string log)
        {
            Clients.All.appendLogMessage(log);
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
