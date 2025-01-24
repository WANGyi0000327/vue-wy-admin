import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer,
} from "axios";
import type {
  PureHttpError,
  RequestMethods,
  PureHttpResponse,
  PureHttpRequestConfig,
} from "./types.d";
import { stringify } from "qs";
import NProgress from "../progress";
import { getToken, formatToken } from "@/utils/auth";
import { useUserStoreHook } from "@/store/modules/user";
import { encrypt } from "@/utils/auth/sign";
import baseUrl from "./base";
import { isEmpty } from "@iceywu/utils";

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  // 当前使用mock模拟请求，将baseURL制空
  baseURL: baseUrl.apiServer,
  // 请求超时时间
  timeout: 10000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer,
  },
};

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** `token`过期后，暂存待执行的请求 */
  private static requests = [];

  /** 防止重复刷新`token` */
  private static isRefreshing = false;

  // 接口是否异常
  private static isApiError = false;

  // 业务异常code名单
  private static errorCodes = [401, 403];

  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {};

  /** 根据角色切换token */
  private static tokenRoleName = "";

  /** 根据接口切换baseURL */
  private static serverName = "apiServer";

  /** 是否需要加密 */
  private static isNeedEncrypt = false;

  /** 是否显示loading */
  private static isNeedLoading = false;

  /** 是否是上传 */
  private static isUpload = false;

  /** 处理 x-www-form-urlencoded 方式的请求 */
  private static isFormUrlEncoded = false;

  /** 保存当前Axios实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 重连原始请求 */
  private static retryOriginalRequest(config: PureHttpRequestConfig) {
    return new Promise((resolve) => {
      PureHttp.requests.push((token: string) => {
        config.headers["Authorization"] = formatToken(token);
        resolve(config);
      });
    });
  }

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig): Promise<any> => {
        const {
          isNeedToken = true,
          isNeedLoading = false,
          serverName = "apiServer",
          isNeedEncrypt = false,
          isFormUrlEncoded = false,
          headers = {},
        } = config;
        PureHttp.isNeedLoading = isNeedLoading;
        if (serverName) {
          config.baseURL = baseUrl[serverName] || baseUrl.apiServer;
        }
        if (import.meta.env.VITE_APP_MOCK_IN_DEVELOPMENT === "true") {
          config.baseURL = "";
        }

        // header信息
        if (!isEmpty(headers)) {
          Object.keys(headers).forEach((key: string) => {
            config.headers.set(key, headers[key]);
          });
        }

        // 参数处理
        if (isNeedEncrypt) {
          const { data, method, params } = config;
          const { tempData, nonce, timestamp, sign } = encrypt(
            method === "get" ? params : data,
          );
          config.headers.timestamp = timestamp;
          config.headers.nonce = nonce;
          config.headers.sign = sign;
          if (method === "get") {
            config.params = tempData;
          } else {
            config.data = tempData;
          }
        }
        // 处理 x-www-form-urlencoded 方式的请求
        if (isFormUrlEncoded) {
          config.headers["Content-Type"] = "application/x-www-form-urlencoded";
          config.data = new URLSearchParams(config.data).toString();
        }

        // 开启进度条动画
        isNeedLoading && NProgress.start();

        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }

        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }

        /** 请求白名单，放置一些不需要token的接口（通过设置请求白名单，防止token过期后再请求造成的死循环问题） */

        return !isNeedToken
          ? config
          : new Promise((resolve) => {
              const data = getToken();
              if (data) {
                const now = new Date().getTime();
                const expired = parseInt(data.expires) - now <= 0;

                if (expired) {
                  if (!PureHttp.isRefreshing) {
                    PureHttp.isRefreshing = true;
                    // token过期刷新
                    useUserStoreHook()
                      .handRefreshToken({ refreshToken: data.refreshToken })
                      .then((res) => {
                        const token = res.data.accessToken;
                        config.headers["Authorization"] = formatToken(token);
                        PureHttp.requests.forEach((cb) => cb(token));
                        PureHttp.requests = [];
                      })
                      .finally(() => {
                        PureHttp.isRefreshing = false;
                      });
                  }
                  resolve(PureHttp.retryOriginalRequest(config));
                } else {
                  config.headers["Authorization"] = formatToken(
                    data.accessToken,
                  );
                  resolve(config);
                }
              } else {
              }
            });
      },
      (error: PureHttpError): Promise<any> => {
        return Promise.reject(error);
      },
    );
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        const $config = response.config;
        // 关闭进度条动画
        if (PureHttp.isNeedLoading && !PureHttp.isApiError) {
          NProgress.done();
        }
        const { code } = response.data;
        // 业务异常code名单
        if (PureHttp.errorCodes.includes(code)) {
          PureHttp.isApiError = true;
          return response;
        }
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return response.data;
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }
        return response.data;
      },
      (error: PureHttpError) => {
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        // 关闭进度条动画
        NProgress.done();
        // 所有的响应异常 区分来源为取消请求/非取消请求
        return Promise.reject($error);
      },
    );
  }

  /** 通用请求工具函数 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig,
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig,
    } as PureHttpRequestConfig;

    // 单独处理自定义请求/响应回调
    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /** 单独抽离的`post`工具函数 */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig,
  ): Promise<T> {
    return this.request<T>("post", url, params, config);
  }

  /** 单独抽离的`get`工具函数 */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig,
  ): Promise<T> {
    return this.request<T>("get", url, params, config);
  }
}
export const http = new PureHttp();
