export interface IRoute {
  path: string;
}

export type TRoutesMap = Record<string, IRoute>;

class RouterSDK {
  containerAppRoute: string;
  microAppRoute: string;
  routesMap: TRoutesMap;

  constructor() {
    this.containerAppRoute = window.location.pathname;
    this.microAppRoute = "";
    this.routesMap = {} as TRoutesMap;
  }

  public registerMicroAppRoutes<T extends string = string>(routes: Record<T, IRoute>) {
    this.routesMap = { ...this.routesMap, ...routes };
  }

  public getRoutePath(route: string) {
    const path = this.routesMap[route];
    if (path) return path;
  }
}

export default RouterSDK;
