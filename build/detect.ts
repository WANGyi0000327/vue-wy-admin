import browserslist from "browserslist";
import { r } from "./utils";
const { loadConfig: browserslistLoadConfig } = browserslist;

/**
 * 默认打包目标 (浏览器兼容程度)
 */
export const defaultBuildTargets = browserslistLoadConfig({
  path: r("./"),
}) || ["last 2 versions and not dead, > 0.3%, Firefox ESR"];
