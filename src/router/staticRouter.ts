import { fileManager, system } from "@/router/enums";
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
export const staticRouter = [systemManagementRouter, fileManagerRouter];
