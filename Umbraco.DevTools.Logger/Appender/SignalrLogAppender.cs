using System;
using log4net.Appender;
using log4net.Core;

namespace Umbraco.DevTools.Logger.Appender
{
    //Inspired by https://github.com/ChrisFulstow/log4net.SignalR/blob/master/log4net.SignalR/SignalrAppender.cs
    //Did not use this directly as seemed that we did not need remote proxy & other bits

    public class SignalrLogAppender : AppenderSkeleton
    {
        public SignalrLogAppender()
        {
            Instance = this;
        }
        
        public static SignalrLogAppender Instance { get; private set; }
        public Action<LogEntry> MessageLogged;


        /// <summary>
        /// When this Log4Net appender is adding a new log item
        /// This will format the log based on conversion pattern & send the log on as an event
        /// </summary>
        /// <param name="loggingEvent"></param>
        protected override void Append(LoggingEvent loggingEvent)
        {
            //This is a helper method that returns the raw log object in the format of the conversion pattern as a string
            var formattedLog = RenderLoggingEvent(loggingEvent);

            //Create a new object with our class below
            //So we can send the formatted log event & the original over to SignalR or anyone else subscribed to event
            if (MessageLogged != null)
            {
                MessageLogged(new LogEntry(formattedLog, loggingEvent));
            }
        }
    }

    /// <summary>
    /// Simple class to send the Log4Net log object along with formatted Log according to conversion pattern
    /// </summary>
    public class LogEntry
    {
        public LogEntry(string formttedEvent, LoggingEvent originalLogEvent)
        {
            FormattedEvent = formttedEvent;
            LoggingEvent = originalLogEvent;
        }

        public string FormattedEvent { get; set; }
        public LoggingEvent LoggingEvent { get; set; }
    }
}
