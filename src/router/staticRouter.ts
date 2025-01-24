import { fileManager, system, monitor } from "@/router/enums";
const systemManagementRouter = {
  path: "/system",
  meta: {
    icon: "ri:settings-3-line",
    title: "menus.pureSysManagement",
    rank: system,
  },
  children: [
    {
      path: "/system/user/index",
      name: "SystemUser",
      meta: {
        icon: "ri:admin-line",
        title: "menus.pureUser",
        roles: ["admin"],
      },
    },
    {
      path: "/system/role/index",
      name: "SystemRole",
      meta: {
        icon: "ri:admin-fill",
        title: "menus.pureRole",
        roles: ["admin"],
      },
    },
    {
      path: "/system/menu/index",
      name: "SystemMenu",
      meta: {
        icon: "ep:menu",
        title: "menus.pureSystemMenu",
        roles: ["admin"],
      },
    },
    {
      path: "/system/dept/index",
      name: "SystemDept",
      meta: {
        icon: "ri:git-branch-line",
        title: "menus.pureDept",
        roles: ["admin"],
      },
    },
  ],
};
const fileManagerRouter = {
  path: "/fileManager",
  meta: {
    icon: "i-vscode-icons-default-folder",
    title: "menus.hsfileManager",
    rank: fileManager,
    roles: ["admin"],
  },
  children: [
    {
      path: "/fileManager/index",
      name: "FileManager",
      meta: {
        title: "menus.hsfileManager",
      },
    },
  ],
};
const fileManagerRouter1 = {
  path: "/fileManager",
  meta: {
    icon: "i-vscode-icons-default-folder",
    title: "menus.hsfileManager",
    rank: fileManager,
    roles: ["admin"],
  },
  children: [],
};
const systemMonitorRouter = {
  path: "/monitor",
  meta: {
    icon: "ep:monitor",
    title: "menus.pureSysMonitor",
    rank: monitor,
  },
  children: [
    {
      path: "/monitor/online-user",
      component: "monitor/online/index",
      name: "OnlineUser",
      meta: {
        icon: "ri:user-voice-line",
        title: "menus.pureOnlineUser",
        roles: ["admin"],
      },
    },
    {
      path: "/monitor/login-logs",
      component: "monitor/logs/login/index",
      name: "LoginLog",
      meta: {
        icon: "ri:window-line",
        title: "menus.pureLoginLog",
        roles: ["admin"],
      },
    },
    {
      path: "/monitor/operation-logs",
      component: "monitor/logs/operation/index",
      name: "OperationLog",
      meta: {
        icon: "ri:history-fill",
        title: "menus.pureOperationLog",
        roles: ["admin"],
      },
    },
    {
      path: "/monitor/system-logs",
      component: "monitor/logs/system/index",
      name: "SystemLog",
      meta: {
        icon: "ri:file-search-line",
        title: "menus.pureSystemLog",
        roles: ["admin"],
      },
    },
  ],
};
const permissionRouter = {
  path: "/permission",
  meta: {
    title: "权限管理",
    icon: "ep:lollipop",
    rank: 10,
  },
  children: [
    {
      path: "/permission/page/index",
      name: "PermissionPage",
      meta: {
        title: "页面权限",
        roles: ["admin", "common"],
      },
    },
    // {
    //   path: "/permission/button",
    //   meta: {
    //     title: "按钮权限",
    //     roles: ["admin", "common"]
    //   },
    //   children: [
    //     {
    //       path: "/permission/button/router",
    //       component: "permission/button/index",
    //       name: "PermissionButtonRouter",
    //       meta: {
    //         title: "路由返回按钮权限",
    //         auths: [
    //           "permission:btn:add",
    //           "permission:btn:edit",
    //           "permission:btn:delete"
    //         ]
    //       }
    //     },
    //     {
    //       path: "/permission/button/login",
    //       component: "permission/button/perms",
    //       name: "PermissionButtonLogin",
    //       meta: {
    //         title: "登录接口返回按钮权限"
    //       }
    //     }
    //   ]
    // }
  ],
};
// export const staticRouter = [systemManagementRouter, fileManagerRouter];
// export const staticRouter = [systemManagementRouter];
export const staticRouter = [systemManagementRouter, systemMonitorRouter];
