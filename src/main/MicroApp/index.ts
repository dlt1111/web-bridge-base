import { DEFAULT_NAMESPACE, EAction, IPostMessageContent, TCallback, TFunctionMap } from "../../constants/const";
import { onMessageFromParent, postMessageToParent } from "../../postMessage";
import { genUID } from "../../utils";
import Logger from "../../utils/logger";

export interface IInitParams {
  targetOrigin?: string;
  useLogger?: boolean;
}

class MicroBase {
  private functions: TFunctionMap;
  private targetOrigin: string = "*";
  private _isInitialized: boolean = false;
  protected logger = new Logger({ prefix: "MicroApp" });

  constructor() {
    this.logger.log("**实例化**");
    this.functions = {} as TFunctionMap;
  }

  /**
   * 子应用初始化
   */
  public init(params: IInitParams = {}) {
    if (this._isInitialized) return;

    this.logger.log("*初始化配置*");

    this._isInitialized = true;

    const { targetOrigin, useLogger } = params;

    if (useLogger != null) this.logger.setOptions({ isOpen: useLogger });

    if (targetOrigin != null) this.targetOrigin = targetOrigin;

    onMessageFromParent((data, event) => {
      const fns = this.functions?.[data?.action];
      if (fns && fns.length > 0) {
        fns.forEach(fn => {
          this.logger.log(`「函数执行」触发动作: ${data?.action}`);
          fn(data?.payload, event);
        });
      }
    }, this.targetOrigin);

    this._init();
  }

  /**
   * 主动获取主应即时返回的数据（主应用需监听）
   */
  protected get<T>(data: IPostMessageContent, namespace?: string) {
    data._key = genUID();

    return new Promise<IPostMessageContent<T>>(resolve => {
      const clear = onMessageFromParent(res => {
        if (res._key === data._key) {
          clear();
          resolve(res);
        }
      }, this.targetOrigin);

      this.emit(data, namespace);
    });
  }

  /**
   * 主动触发主应用的监听回调
   */
  protected emit<T = any>(message: IPostMessageContent<T>, namespace?: string) {
    this.logger.log(`「发送」${message?.action}`);
    postMessageToParent(message, namespace, this.targetOrigin);
  }

  /**
   * 被动监听主应用的触发
   */
  protected on<T = any>(action: string, callback: TCallback<T>) {
    this.logger.log(`「监听」${action}`);
    this._pushFunction<T>(action, callback);
    return () => this._popFunction<T>(action, callback);
  }

  private _pushFunction<T = any>(name: string, fn: TCallback<T>) {
    if (!this.functions[name]) {
      this.functions[name] = [];
    }
    this.functions[name].push(fn);
  }

  private _popFunction<T = any>(name: string, fn: TCallback<T>) {
    if (!this.functions[name]) return;
    this.functions[name] = this.functions[name].filter(f => f !== fn);
  }

  private _init() {
    this.logger.log("「动作」通知容器初始化");
    postMessageToParent({ action: EAction.initMicroApp }, DEFAULT_NAMESPACE, this.targetOrigin);
  }
}

export default MicroBase;

export * from "../../constants";
