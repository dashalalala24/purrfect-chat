import type Block from './Block';
import type { TBlockConstructor } from './Block';
import isEqual from '../utils/isEqual';

type TRouteProps = {
  rootQuery: string;
};

class Route {
  private _pathname: string;
  private _blockClass: TBlockConstructor;
  private _block: Block | null;
  private _props: TRouteProps;

  constructor(pathname: string, view: TBlockConstructor, props: TRouteProps) {
    this._pathname = pathname;
    this._blockClass = view;
    this._block = null;
    this._props = props;
  }

  match(pathname: string): boolean {
    return isEqual(pathname, this._pathname);
  }

  navigate(pathname: string): void {
    if (this.match(pathname)) {
      this.render();
    }
  }

  leave() {
    if (this._block) {
      this._block.hide();
    }
  }

  private _render(query: string, block: Block) {
    const root = document.querySelector(query);
    root!.append(block.getContent());
  }

  render() {
    if (!this._block) {
      const block = new this._blockClass({});
      this._block = block;
      this._render(this._props.rootQuery, block);

      return;
    }

    this._block.show();
  }
}

export default Route;
