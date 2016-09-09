namespace Umbraco.DevTools.Logger.Models.Diagnostics
{
    public class GeneralInfo
    {
        public VersionInfo UmbracoVersion { get; set; }
        public ServerInfo Server { get; set; }
        public DatabaseInfo Database { get; set; }
    }

    public class VersionInfo
    {
        public string Version { get; set; }
        public string Assembly { get; set; }
        public string VersionComment { get; set; }
    }

    public class ServerInfo
    {
        public string MachineName { get; set; }
        public int ProcessorCount { get; set; }
        public string AspNetVersion { get; set; }
        public string OperatingSystem { get; set; }
        public string IisVersion { get; set; }
    }

    public class DatabaseInfo
    {
        public string Connection { get; set; }
        public string Type { get; set; }
        public bool Configured { get; set; }
    }
}
