import type { TBlockConstructor } from './Block';
import Route from './Route';
import store from './Store';
import { AuthRoutes, Routes } from '../consts/routes';

class Router {
  private static __instance: Router;
  private routes: Route[] = [];
  private history: History = window.history;
  private _currentRoute: Route | null = null;
  private _rootQuery: string = '#app';
  private readonly onPopState = () => {
    this._onRoute(window.location.pathname);
  };

  constructor(rootQuery?: string) {
    if (Router.__instance) {
      return Router.__instance;
    }

    this._rootQuery = rootQuery ?? '#app';

    Router.__instance = this;
  }

  use(pathname: string, block: TBlockConstructor) {
    const route = new Route(pathname, block, { rootQuery: this._rootQuery });

    this.routes.push(route);

    return this;
  }

  start() {
    window.addEventListener('popstate', this.onPopState);

    const pathname = window.location.pathname;

    if (
      !this.isAuthenticated() &&
      pathname !== Routes.SignIn &&
      pathname !== Routes.SignUp &&
      pathname !== Routes.NotFound &&
      pathname !== Routes.ServerError
    ) {
      this.go(Routes.SignIn);

      return;
    }

    if (this.isAuthenticated() && AuthRoutes.includes(pathname)) {
      this.go(Routes.Chats);

      return;
    }

    this._onRoute(window.location.pathname);
  }

  private isAuthenticated(): boolean {
    return !!store.getState().user;
  }

  private _onRoute(pathname: string): void {
    const route = this.getRoute(pathname);
    if (!route) {
      return;
    }
    if (this._currentRoute && this._currentRoute !== route) {
      this._currentRoute.leave();
    }
    this._currentRoute = route;
    route.render();
  }

  go(pathname: string): void {
    this.history.pushState({}, '', pathname);
    this._onRoute(pathname);
  }

  getRoute(pathname: string): Route | undefined {
    const route = this.routes.find((route) => route.match(pathname));
    if (!route) {
      return this.routes.find((route) => route.match('*'));
    }
    return route;
  }

  back(): void {
    this.history.back();
  }

  forward(): void {
    this.history.forward();
  }
}

export default Router;
