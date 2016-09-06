using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Security.Cryptography;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using Umbraco.Core.Configuration;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;

namespace Umbraco.DevTools.Logger.Controllers
{
    [PluginController("DevTools")]
    [EnableCors(origins: "chrome-extension://jedkgnoniejbbkcghjmfhdgappfcempk", headers: "*", methods: "*", SupportsCredentials = true)]
    public class DiagnosticsController : UmbracoAuthorizedApiController
    {
        [HttpGet]
        // /umbraco/backoffice/DevTools/Diagnostics/Ping
        public string Ping()
        {
            return "Secure Pong";
        }


        // /umbraco/backoffice/DevTools/Diagnostics/GetGeneralInfo
        [HttpGet]
        public GeneralInfo GetGeneralInfo()
        {

            var info = new GeneralInfo
            {
                UmbracoVersion = new VersionInfo
                {
                    Version = UmbracoVersion.Current.ToString(),
                    VersionComment = UmbracoVersion.CurrentComment,
                    Assembly = UmbracoVersion.AssemblyVersion
                },
                Server = new ServerInfo
                {
                    MachineName = Environment.MachineName,
                    ProcessorCount = Environment.ProcessorCount,
                    AspNetVersion = Environment.Version.ToString(),
                    OperatingSystem = Environment.OSVersion.VersionString,
                    IisVersion = HttpContext.Current.Request.ServerVariables["SERVER_SOFTWARE"]
                },
                Database = new DatabaseInfo
                {
                    Connection = DatabaseContext.ConnectionString,
                    Type = DatabaseContext.DatabaseProvider.ToString(),
                    Configured = DatabaseContext.IsDatabaseConfigured
                }
            };

            return info;
        }


        // /umbraco/backoffice/DevTools/Diagnostics/GetAssemblies
        [HttpGet]
        public AssemblyInfo GetAssemblies()
        {
            var assemblies = new List<AssemblyItem>();

            //Assemblies
            string path = HttpContext.Current.Server.MapPath("~/bin");

            //for each DLL in /bin folder add it to the list
            foreach (string dll in Directory.GetFiles(path, "*.dll"))
            {
                //Load DLL (Reflection)
                var item = Assembly.LoadFile(dll);

                //Get the values from the DLL
                var assemblyToAdd = new AssemblyItem
                {
                    Name = item.GetName().Name,
                    Version = item.GetName().Version.ToString()
                };


                //MD5
                using (var md5 = MD5.Create())
                {
                    using (var stream = File.OpenRead(item.Location))
                    {
                        assemblyToAdd.ChecksumMD5 = BitConverter.ToString(md5.ComputeHash(stream)).Replace("-", "").ToLower();
                    }
                }

                //SHA1
                using (var sha1 = SHA1.Create())
                {
                    using (var stream = File.OpenRead(item.Location))
                    {
                        assemblyToAdd.ChecksumSHA1 = BitConverter.ToString(sha1.ComputeHash(stream)).Replace("-", "").ToLower();
                    }
                }

                //Add it to the list
                assemblies.Add(assemblyToAdd);

            }
            
            //Return the list
            return new AssemblyInfo
            {
                Assemblies = assemblies
            };
        }
        
    }








    
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

    public class AssemblyInfo
    {
        public List<AssemblyItem> Assemblies { get; set; }
    }

    public class AssemblyItem
    {
        public string Name { get; set; }
        public string Version { get; set; }
        public string ChecksumMD5 { get; set; }
        public string ChecksumSHA1 { get; set; }
    }

    //Some basic models - TODO MOVE these
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
