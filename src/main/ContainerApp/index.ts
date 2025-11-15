import { PostMessageData } from "../../constants/class";
import {
  DEFAULT_NAMESPACE,
  EAction,
  INamespaceMap,
  IPostMessageContent,
  TCallback,
  TFunctionMap
} from "../../constants/const";
import { onMessageFromIframe, postMessageToIframe } from "../../postMessage";
import RouterSDK from "../../router";
import Logger from "../../utils/logger";

export interface IInitParams {
  targetOrigin?: string;
  useLogger?: boolean;
}

class ContainerBase {
  private functions: INamespaceMap;
  private targetOrigin: string = "*";
  private _isInitialized: boolean = false;
  private iframeElement: HTMLIFrameElement | null = null;
  protected logger = new Logger({ prefix: "ContainerApp" });

  public routerSDK: RouterSDK;

  constructor() {
    this.logger.log("**实例化**");
    this.functions = {} as INamespaceMap;
    this.routerSDK = new RouterSDK();
  }

  /**
   * 容器初始化
   */
  public init(params: IInitParams = {}) {
    if (this._isInitialized) return;

    this.logger.log("*初始化配置*");

    this._isInitialized = true;

    const { targetOrigin, useLogger } = params;

    if (useLogger != null) this.logger.setOptions({ isOpen: useLogger });

    if (targetOrigin != null) this.targetOrigin = targetOrigin;

    onMessageFromIframe((data, msgNamespace, event) => {
      const fns = this.functions[msgNamespace]?.[data?.action];
      if (fns && fns.length > 0) {
        fns.forEach(fn => {
          if (data && data._key) {
            this.logger.log(
              `「函数执行并回复」namespace：${msgNamespace} 消息key: ${data._key} 触发动作: ${data?.action}`
            );
            const response = fn(data?.payload, event);
            if (!response) {
              this.logger.warn(`消息key: ${data._key} 此消息回调函数应返回响应内容，当前未返回任何内容`);
              return;
            }
            event.source?.postMessage(
              new PostMessageData({ action: data.action, payload: response, _key: data._key }, msgNamespace),
              { targetOrigin: event.origin }
            );
          } else {
            this.logger.log(`「函数执行」namespace：${msgNamespace} 触发动作: ${data?.action}`);
            fn(data?.payload, event);
          }
        });
      }
    }, this.targetOrigin);

    if (window.opener) {
      window.addEventListener("beforeunload", () => {
        postMessageToIframe(window.opener, {
          action: EAction.unloadOpener,
          payload: { name: window.name, url: window.location.href }
        });
      });
    }
  }

  /**
   * 设置容器DOM元素
   */
  public setContainer(iframe: HTMLIFrameElement) {
    this.iframeElement = iframe;
  }

  /**
   * 监听子应用初始化
   */
  public onInitMicroApp(callback: (p?: any) => void) {
    this.logger.log("「监听」子应用初始化");
    return this.on(EAction.initMicroApp, callback);
  }

  /**
   * 监听由window.open打开的页面卸载事件
   */
  public onUnloadOpener(callback: (data?: any) => void, namespace?: string) {
    this.logger.log("「监听」子窗口卸载");
    return this.on(EAction.unloadOpener, callback, namespace);
  }

  /**
   * 主动触发子应用的监听回调
   */
  protected emit<T = any>(message: IPostMessageContent<T>) {
    this.logger.log(`「发送」${message?.action}`);
    postMessageToIframe(this.iframeElement?.contentWindow!, message, this.targetOrigin);
  }

  /**
   * 被动监听子应用的触发
   */
  protected on<T = any>(action: string, callback: TCallback<T>, namespace = DEFAULT_NAMESPACE) {
    this.logger.log(`「监听」${action}`);
    this._pushFunction<T>(action, callback, namespace);
    return () => this._popFunction<T>(action, callback, namespace);
  }

  private _pushFunction<T = any>(name: string, fn: TCallback<T>, namespace = DEFAULT_NAMESPACE) {
    if (!this.functions[namespace]) {
      this.functions[namespace] = {} as TFunctionMap;
    }
    if (!this.functions[namespace][name]) {
      this.functions[namespace][name] = [];
    }
    this.functions[namespace][name].push(fn);
  }

  private _popFunction<T = any>(name: string, fn: TCallback<T>, namespace = DEFAULT_NAMESPACE) {
    const namespaceFunctions = this.functions[namespace];
    if (!namespaceFunctions?.[name]) return;

    const functionList = namespaceFunctions[name];
    const index = functionList.indexOf(fn);

    if (index !== -1) {
      functionList.splice(index, 1);
    }
  }
}

export default ContainerBase;

export * from "../../constants";
