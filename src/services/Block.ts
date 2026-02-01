import Handlebars from 'handlebars';
import { nanoid } from 'nanoid';

import EventBus from './EventBus';

type TProps = Record<string, unknown>;

type TEvents = Record<string, (e: Event) => void>;

export type TComponentProps = TProps & {
  events?: TEvents;
  hasID?: boolean;
};

export type TBlockProps = TProps & {
  events?: TEvents;
};

export default class Block {
  static EVENTS = {
    INIT: 'init',
    FLOW_CDM: 'flow:component-did-mount',
    FLOW_CDU: 'flow:component-did-update',
    FLOW_RENDER: 'flow:render',
  };

  private _element: HTMLElement | null = null;
  private _meta: { tagName: string } | null = null;
  public _id: string = nanoid(6);
  private _eventBus: () => EventBus;
  public props: TComponentProps;
  public children: Record<string, Block>;

  constructor(propsWithChildren: object) {
    const eventBus = new EventBus();

    const { props, children } = this._getPropsAndChildren(propsWithChildren);
    this.props = this._makePropsProxy({ ...props });
    this.children = children as Record<string, Block>;

    this._eventBus = () => eventBus;

    this._registerEvents(eventBus);

    eventBus.emit(Block.EVENTS.INIT);
  }

  _addEvents() {
    const { events = {} } = this.props as { events?: TEvents };

    Object.keys(events).forEach((eventName) => {
      this._element?.addEventListener(eventName, events[eventName]);
    });
  }

  _removeEvents() {
    const { events = {} } = this.props as { events?: TEvents };

    Object.keys(events).forEach((eventName) => {
      this._element?.removeEventListener(eventName, events[eventName]);
    });
  }

  _registerEvents(eventBus: EventBus) {
    eventBus.on(Block.EVENTS.INIT, this._init.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDU, this._componentDidUpdate.bind(this));
    eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
  }

  _createResources() {
    if (this._meta) {
      const { tagName } = this._meta;
      this._element = this._createDocumentElement(tagName);
    } else {
      throw new Error('_meta is null. Cannot create resources.');
    }
  }

  _init() {
    this.init();

    this._eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  init() {}

  _componentDidMount() {
    this.componentDidMount(this.props);

    Object.values(this.children).forEach((child) => {
      child.dispatchComponentDidMount();
    });
  }

  componentDidMount(oldProps?: TBlockProps) {
    console.log(`CDM! oldProps: ${oldProps}`);
  }

  dispatchComponentDidMount() {
    this._eventBus().emit(Block.EVENTS.FLOW_CDM);
  }

  _componentDidUpdate(oldProps: TBlockProps, newProps: TBlockProps) {
    const response = this.componentDidUpdate(oldProps, newProps);
    if (!response) {
      return;
    }
    this._render();
  }

  componentDidUpdate(oldProps?: TBlockProps, newProps?: TBlockProps) {
    console.log(`CDU! old: ${oldProps}, new:${newProps}`);

    return true;
  }

  _getPropsAndChildren(propsAndChildren: object) {
    const children: Record<string, Block> = {};
    const props: TComponentProps = {};

    Object.entries(propsAndChildren).forEach(([key, value]) => {
      if (value instanceof Block) {
        children[key] = value;
      } else {
        props[key] = value;
      }
    });

    return { children, props };
  }

  setProps = (nextProps: TBlockProps) => {
    if (!nextProps) {
      return;
    }

    Object.assign(this.props, nextProps);
  };

  get element() {
    return this._element;
  }

  _render() {
    const propsAndStubs = { ...this.props };

    Object.entries(this.children).forEach(([key, child]) => {
      propsAndStubs[key] = `<div data-id="${child._id}"></div>`;
    });

    const fragment = this._createDocumentElement('template') as HTMLTemplateElement;
    fragment.innerHTML = Handlebars.compile(this.render())(propsAndStubs);

    if (this._element) {
      this._removeEvents();
    }

    const newElement = fragment.content.firstElementChild as HTMLElement;

    Object.values(this.children).forEach((child) => {
      const stub = fragment.content.querySelector(`[data-id="${child._id}"]`);
      stub?.replaceWith(child.getContent());
    });

    if (this._element) {
      this._element.replaceWith(newElement);
    }

    this._element = newElement as HTMLElement;

    this._addEvents();
  }

  render(): string {
    throw new Error('Render not implemented');
  }

  getContent() {
    return this.element as HTMLElement;
  }

  _makePropsProxy(props: TComponentProps) {
    const self = this;

    return new Proxy(props, {
      get(target, prop: string, receiver) {
        const value = Reflect.get(target, prop, receiver);

        return typeof value === 'function' ? value.bind(receiver) : value;
      },
      set(target, prop: string, value, receiver) {
        const oldProps = { ...target };

        const result = Reflect.set(target, prop, value, receiver);
        const newProps = { ...target };

        self._eventBus().emit(Block.EVENTS.FLOW_CDU, oldProps, newProps);

        return result;
      },
      deleteProperty() {
        throw new Error('Нет доступа');
      },
    });
  }

  _createDocumentElement(tagName: string) {
    return document.createElement(tagName);
  }

  show() {
    this.getContent().style.display = 'flex';
  }

  hide() {
    this.getContent().style.display = 'none';
  }
}
