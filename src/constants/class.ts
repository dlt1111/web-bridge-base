import { IPostMessageContent } from "./const";

export interface IPostMessageData {
  data: IPostMessageContent | object;
}

export class PostMessageData<T extends IPostMessageContent = IPostMessageContent> implements IPostMessageData {
  data: T;
  namespace?: string;
  constructor(data: T, namespace?: string) {
    this.namespace = namespace;
    this.data = data ?? ({} as T);
  }
}
