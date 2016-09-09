using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Umbraco.DevTools.Logger.Models.Diagnostics
{
    public class FolderInfo
    {
        public List<FolderPermission> Folders { get; set; }
    }

    public class FolderPermission
    {
        public string FolderName { get; set; }
        public List<FolderPermissionItem> Permissions { get; set; }
    }

    public class FolderPermissionItem
    {
        public string User { get; set; }
        public string Type { get; set; }
        public string Access { get; set; }
    }
}
