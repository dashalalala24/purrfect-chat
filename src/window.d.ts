import type Router from './services/Router';

declare global {
  interface Window {
    router: Router;
  }
}
