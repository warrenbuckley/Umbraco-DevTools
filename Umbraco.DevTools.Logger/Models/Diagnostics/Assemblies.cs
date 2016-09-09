using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Umbraco.DevTools.Logger.Models.Diagnostics
{
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
}
