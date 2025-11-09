import { PostMessageData } from "../constants/class";
import { DEFAULT_NAMESPACE, DEFAULT_ORIGIN, IPostMessageContent } from "../constants/const";

const postMessageToIframe = <T = any>(win: Window, message: IPostMessageContent<T>, targetOrigin = DEFAULT_ORIGIN) => {
  if (!win) throw new Error("window is not exist");

  win.postMessage(new PostMessageData(message), targetOrigin);
};

const onMessageFromIframe = <T = any>(
  callback: (
    data: IPostMessageContent<T>,
    msgNamespace: string,
    event: MessageEvent<PostMessageData<IPostMessageContent<T>>>
  ) => void,
  allowedOrigin?: string,
  options?: boolean | AddEventListenerOptions
) => {
  const handler = (event: MessageEvent<PostMessageData<IPostMessageContent<T>>>) => {
    const { origin } = event;

    if (allowedOrigin !== DEFAULT_ORIGIN && origin !== allowedOrigin) return;

    if (typeof event?.data !== "object") return;

    const { data, namespace: msgNamespace = "*" } = event.data;

    callback(data, msgNamespace, event);
  };

  window.addEventListener("message", handler, options);

  return () => {
    window.removeEventListener("message", handler);
  };
};

const postMessageToParent = <T = any>(
  message: IPostMessageContent<T>,
  namespace = DEFAULT_NAMESPACE,
  targetOrigin = DEFAULT_ORIGIN
) => {
  if (!window.parent) throw new Error("parent window is not exist");

  window.parent.postMessage(new PostMessageData(message, namespace), targetOrigin);
};

const onMessageFromParent = <T = any>(
  callback: (data: IPostMessageContent<T>, event: MessageEvent<PostMessageData<IPostMessageContent<T>>>) => void,
  allowedOrigin?: string,
  options?: boolean | AddEventListenerOptions
) => {
  const handler = (event: MessageEvent<PostMessageData<IPostMessageContent<T>>>) => {
    const { origin } = event;

    if (allowedOrigin !== DEFAULT_ORIGIN && origin !== allowedOrigin) return;

    if (typeof event?.data !== "object") return;

    const { data } = event.data;

    callback(data, event);
  };

  window.addEventListener("message", handler, options);

  return () => {
    window.removeEventListener("message", handler);
  };
};

export { postMessageToIframe, onMessageFromIframe, postMessageToParent, onMessageFromParent };
