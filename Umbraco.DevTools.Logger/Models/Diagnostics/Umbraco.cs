using System.Collections.Generic;
using umbraco.cms.businesslogic.packager;
using Umbraco.Core.Models;

namespace Umbraco.DevTools.Logger.Models.Diagnostics
{
    public class UmbracoInfo
    {
        public List<UmbracoSection> Sections { get; set; }
        //public List<IMacro> Macros { get; set; }
        public UmbracoFiles Files { get; set; }
        public List<Routes> Routes { get; set; }
        public List<InstalledPackage> Packages { get; set; }
    }

    public class UmbracoSections
    {
        public List<UmbracoSection> Sections { get; set; }
    }

    public class UmbracoSection
    {
        public Section App { get; set; }
        public List<ApplicationTree> Trees { get; set; }
    }

    public class UmbracoFiles
    {
        public List<Stylesheet> Stylesheets { get; set; }
        public List<ITemplate> Templates { get; set; }
        public List<Script> Scripts { get; set; }
    }

    public class MvcRoutes
    {
        public List<Routes> Routes { get; set; }
    }

    public class Routes
    {
        public string Url { get; set; }
    }

    public class UmbracoMacros
    {
        public List<IMacro> Macros { get; set; }
    }
}
