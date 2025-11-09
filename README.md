# web-bridge-base

作为 web 容器和 iframe 子应用互相调用的基类，可继承此类进行自定义扩展互相调用的方法。

## 说明

消息格式

```ts
interface IPostMessageContent<T = any> {
  /**
   * 业务行为类型消息
   */
  action: string;
  /**
   * 具体数据内容
   */
  payload?: T;
}
```

三种使用方式，主子应用互相发送和接受监听成对出现，依赖 action 字段识别

1. 主动调用

   ```ts
   this.emit({ action: "xxx", payload: {} });
   ```

2. 被动监听

   ```ts
   // 若要及时返回数据，父应用这里的callback需有返回值，子应用使用 this.get 调用
   const clear = this.on("xxx", callback);
   clear(); // 移除监听
   ```

3. 子应用即时获取响应
   使用 async await 及时获取响应消息

   ```ts
   const response = await this.get({ action: "xxx" });
   const { action, payload } = response;
   ```

## 示例

### ContainerApp（容器使用）

```ts
import ContainerBase, { IPostMessageContent, PostMessageData } from "web-bridge/containerApp";

class Container extends ContainerBase {
  constructor() {
    super();
  }

  public onContainerInfo(
    callback: (
      data: { action: "containerInfo" },
      event: MessageEvent<PostMessageData<IPostMessageContent<{ action: "containerInfo" }>>>
    ) => { user: string }, // 返回的数据会即时传给子应用
    namespace?: string
  ) {
    this.logger.log("「监听」获取容器信息");
    return this.on("containerInfo", callback, namespace); // 如果同一个页面有多个iframe，需要传入自行约定的namespace做区分
  }

  public onLogin(callback: () => void, namespace?: string) {
    this.logger.log("「监听」登录动作");
    return this.on("login", callback, namespace);
  }

  public changeRole(params: { role: "admin" | "user" }) {
    this.logger.log("「动作」改变角色");

    this.emit({ action: "roleChange", payload: params });
  }
}

export default new Container();
```

### MicroApp（iframe 子应用使用）

```ts
import MicroBase from "web-bridge/microApp";

class Micro extends MicroBase {
  constructor() {
    super();
  }

  public onRoleChange(callback: (data: { role: "admin" | "user" }) => void) {
    this.logger.log("「监听」角色改变");
    return this.on("roleChange", callback);
  }

  public async getContainerInfo(namespace?: string) {
    this.logger.log("「动作」获取容器信息");
    const res = await this.get<IContainerInfoParams>({ action: "containerInfo" }, namespace);
    return res.payload;
  }

  public login(namespace?: string) {
    this.logger.log("「动作」触发登录");
    this.emit({ action: "login" }, namespace); // 如果同一个页面有多个iframe，需要传入自行约定的namespace做区分
  }
}

export default new Micro();
```
