# web-bridge-base

作为 web 容器和 iframe 子应用互相调用的基类，可继承此类进行自定义扩展互相调用的方法。

扩展包模板仓库：https://github.com/dlt1111/web-bridge-template

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
   // 若要即时返回数据，父应用这里的callback需有返回值，子应用使用 this.get 调用
   const clear = this.on("xxx", callback);
   clear(); // 移除监听
   ```

3. 子应用即时获取响应
   使用 async await 及时获取响应消息

   ```ts
   const response = await this.get({ action: "xxx" });
   const { action, payload } = response;
   ```

## 扩展包示例

clone 扩展包模板，修改容器扩展类 `ContainerApp/instance.ts` 和 子应用扩展类`MicroApp/instance.ts`，扩展实现业务需要的交互方法，打包发布成 npm 包，供业务项目使用。

### ContainerApp（容器使用）

```ts
import ContainerBase, { IPostMessageContent, PostMessageData } from "web-bridge-base/containerApp";

class Container extends ContainerBase {
  constructor() {
    super();
  }

  public changeRole(params: { role: "admin" | "user" }) {
    this.logger.log("「动作」改变角色");

    this.emit({ action: "roleChange", payload: params });
  }

  public onLogin(callback: () => void, namespace?: string) {
    this.logger.log("「监听」登录动作");
    return this.on("login", callback, namespace);
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
}

export default new Container();
```

### MicroApp（iframe 子应用使用）

```ts
import MicroBase from "web-bridge-base/microApp";

class Micro extends MicroBase {
  constructor() {
    super();
  }

  public onRoleChange(callback: (data: { role: "admin" | "user" }) => void) {
    this.logger.log("「监听」角色改变");
    return this.on("roleChange", callback);
  }

  public login(namespace?: string) {
    this.logger.log("「动作」触发登录");
    this.emit({ action: "login" }, namespace); // 如果同一个页面有多个iframe，需要传入自行约定的namespace做区分
  }

  public async getContainerInfo(namespace?: string) {
    this.logger.log("「动作」获取容器信息");
    const res = await this.get<any>({ action: "containerInfo" }, namespace);
    return res.payload;
  }
}

export default new Micro();
```

## 业务项目使用

将自定义扩展的新包发布后，供业务项目使用。

主子应用分别引入对应的文件（containerApp / microApp）

并尽可能早的执行各自的 **init** 方法，为了安全 init 中可传入 **targetOrigin** 保证调用精准, 也可不传，默认为 **\***

### 业务项目示例

依照上面扩展包示例的实现，下面具体如何使用

#### 容器

```ts
// xxx 为自定义扩展的包名
import { containerApp } from "xxx/containerApp";

// 尽可能早的初始化（基类自带）
containerApp.init({
  targetOrigin: "https://micro-xxx.com" // postMessage 的 targetOrigin，可不传，默认为*
  useLogger: true // 开启/关闭日志
});

// 设置 iframe DOM 元素，与子应用交互前要先执行此方法（基类自带）
containerApp.setContainer(iframeElement);

// 监听子应用初始化（基类自带）
containerApp.onInitMicroApp(() => {
  // 子应用加载并调用子应用microApp.init()后触发此回调
});

// --------- 以下为自定义扩展的示例方法 ---------

// 业务上触发改变角色身份，通知子应用
containerApp.changeRole({ role: "admin" });

// 监听子应用触发登陆的操作
containerApp.onLogin(() => {
  // 具体业务的登陆逻辑
});

// 容器即时返回子应用请求的业务字段
containerApp.onContainerInfo(() => {
  // 业务需要返回的字段
  return {
    userId: "123456"
  };
});
```

#### 子应用

```ts
import { microApp } from "xxx/microApp";

// 尽可能早的初始化（基类自带）
microApp.init({
  targetOrigin: "https://container-xxx.com" // postMessage 的 targetOrigin，可不传，默认为*
  useLogger: true // 开启/关闭日志
});

// --------- 以下为自定义扩展的示例方法 ---------

// 业务上监听角色身份的变化
microApp.onRoleChange(() => {
  // 执行业务对应的操作
});

// 触发容器处理登陆操作
microApp.login();

// 请求容器即时返回业务上需要的数据
const result = await microApp.getContainerInfo();
```
