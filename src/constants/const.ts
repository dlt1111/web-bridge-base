import { PostMessageData } from "./class";

export enum EAction {
  initMicroApp = "INIT_MICRO_APP",
  unloadOpener = "UNLOAD_OPENER"
}

export interface IPostMessageContent<T = any> {
  /**
   * 业务行为类型消息
   */
  action: string;
  /**
   * 具体数据内容
   */
  payload?: T;
  /**
   * 消息唯一key，需要获取某次调用对应的响应时使用
   */
  _key?: string;
}

export const DEFAULT_NAMESPACE = "*";

export const DEFAULT_ORIGIN = "*";

export type TCallback<T = any> = (data: any, event: MessageEvent<PostMessageData<IPostMessageContent>>) => void | T;

export type TFunctionMap = Record<string, TCallback[]>;

export interface INamespaceMap {
  [namespace: string]: TFunctionMap;
}
