using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Security.AccessControl;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Routing;
using umbraco.cms.businesslogic.packager;
using Umbraco.Core.Configuration;
using Umbraco.Core.Models;
using Umbraco.DevTools.Logger.Models.Diagnostics;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;
using File = System.IO.File;

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


        public FolderInfo GetFolderPermissions()
        {

            //Create a list of folder permissions
             var permissions = new List<FolderPermission>();

            //Root folder path
            string rootFolderPath = HttpContext.Current.Server.MapPath("~/");

            //Get the root folder
            var rootFolder = new DirectoryInfo(rootFolderPath);

            //Loop over folders
            foreach (var folder in rootFolder.GetDirectories())
            {
                var permissionToAdd = new FolderPermission();
                permissionToAdd.FolderName = folder.Name;

                var rules = new List<FolderPermissionItem>();

                //Loop over rules
                //Taken from - http://forums.asp.net/t/1625708.aspx?Folder+rights+on+network
                foreach (FileSystemAccessRule rule in folder.GetAccessControl().GetAccessRules(true, true, typeof(NTAccount)))
                {
                    var permissionItemToAdd = new FolderPermissionItem();
                    permissionItemToAdd.Type = rule.FileSystemRights.ToString();
                    permissionItemToAdd.User = rule.IdentityReference.Value;
                    permissionItemToAdd.Access = rule.AccessControlType == AccessControlType.Allow ? "grants" : "denies";

                    //Add items to the rule
                    rules.Add(permissionItemToAdd);
                }

                //Set the permissions on object to the rules list
                permissionToAdd.Permissions = rules;

                //Add it to the list
                permissions.Add(permissionToAdd);
            }

            
            //Return the list
            return new FolderInfo
            {
                Folders = permissions
            };
            
        }

        [HttpGet]
        public UmbracoMacros GetMacros()
        {
            return new UmbracoMacros
            {
                Macros = UmbracoContext.Application.Services.MacroService.GetAll().ToList()
            };
        }

        [HttpGet]
        public MvcRoutes GetRoutes()
        {
            //Get the routes from route table
            var allRoutes = RouteTable.Routes.ToList();
            var routes = new List<Routes>();

            foreach (var route in allRoutes)
            {
                var item = (Route)route;

                routes.Add(new Routes
                {
                    Url = item.Url
                });
            }

            return new MvcRoutes
            {
                Routes = routes
            };
        }


        [HttpGet]
        public UmbracoSections GetSections()
        {
            //Sections & Trees
            var sections = UmbracoContext.Application.Services.SectionService.GetSections();

            var umbracoApps = new List<UmbracoSection>();

            //Get the specific trees for the section
            foreach (var section in sections)
            {
                var treesForSection = UmbracoContext.Application.Services.ApplicationTreeService.GetApplicationTrees(section.Alias);

                var umbracoApp = new UmbracoSection
                {
                    App = section,
                    Trees = treesForSection.ToList()
                };

                umbracoApps.Add(umbracoApp);
            }

            return new UmbracoSections
            {
                Sections = umbracoApps
            };
        }







        [HttpGet]
        public UmbracoInfo GetUmbracoInfo()
        {
            
            //Get File Bits
            var physicalFiles = GetPhysicalFiles();


            //Packages
            var umbPackages = GetPackages();

            return new UmbracoInfo()
            {
                //Files = physicalFiles,
                Packages = umbPackages
            };



            //Backoffice Users


            //Members


            //Document Types & User Types
            
            
            //Domains, languages & Dictionary


            //Relations & Relation Types


            //Server Sync (Current server, other servers etc)


            //Media (Simple count)


            //Examine - Checks
            //Check via API versus count in Examine index


            // //Backoffice count all users
            // var allUserCount = UmbracoContext.Application.Services.UserService.GetCount(MemberCountType.All);


            // //Get DocTypes & Get MediaTypes
            // var b = UmbracoContext.Application.Services.ContentTypeService.GetAllContentTypeAliases();

            // //Get domains
            // var c = UmbracoContext.Application.Services.DomainService.GetAll(true)
            // var h = UmbracoContext.Application.Services.LocalizationService.GetAllLanguages();


            // var i = UmbracoContext.Application.Services.MemberGroupService.GetAll();

            // var j =  UmbracoContext.Application.Services.MemberService.Count();

            // var k = UmbracoContext.Application.Services.MemberTypeService.GetAll();



            // var m = UmbracoContext.Application.Services.RelationService.GetAllRelations();

            // var n = UmbracoContext.Application.Services.SectionService.GetSections();



            // var o = UmbracoContext.Application.Services.ServerRegistrationService.CurrentServerIdentity;

            // var p = UmbracoContext.Application.Services.ServerRegistrationService.GetCurrentServerRole();

            // var q = UmbracoContext.Application.Services.ServerRegistrationService.GetActiveServers();

        }
        
        private UmbracoFiles GetPhysicalFiles()
        {
            //Get CSS files
            var cssFiles = UmbracoContext.Application.Services.FileService.GetStylesheets().ToList();

            //Get Template Files
            var templateFiles = UmbracoContext.Application.Services.FileService.GetTemplates().ToList();

            //Get scripts
            var scriptFiles = UmbracoContext.Application.Services.FileService.GetScripts().ToList();

            return new UmbracoFiles
            {
                Stylesheets = cssFiles,
                Templates = templateFiles,
                Scripts = scriptFiles
            };
        }

        private List<InstalledPackage> GetPackages()
        {
            return InstalledPackage.GetAllInstalledPackages();
        }
    }

    
    
}
