import Handlebars from 'handlebars';
import { nanoid } from 'nanoid';

import EventBus from './EventBus';

type TEvents = Record<string, (e: Event) => void>;

type TComponentProps<P extends Record<string, unknown>> = P & {
  events?: TEvents;
  hasID?: boolean;
};

type TBlockProps<P extends Record<string, unknown>> = P & {
  events?: TEvents;
};

type TBlockEventMap<P extends Record<string, unknown>> = {
  init: () => void;
  'flow:component-did-mount': () => void;
  'flow:component-did-update': (oldProps: TBlockProps<P>, newProps: TBlockProps<P>) => void;
  'flow:render': () => void;
};

type TAnyBlock = Block<Record<string, unknown>>;

abstract class Block<Props extends Record<string, unknown> = Record<string, unknown>> {
  static EVENTS = {
    INIT: 'init',
    FLOW_CDM: 'flow:component-did-mount',
    FLOW_CDU: 'flow:component-did-update',
    FLOW_RENDER: 'flow:render',
  } as const;

  private _element: HTMLElement | null = null;
  private _meta: { tagName: string } | null = null;
  public _id: string = nanoid(6);
  private _eventBus: () => EventBus<TBlockEventMap<Props>>;
  public props: TComponentProps<Props>;
  public children: Record<string, TAnyBlock>;

  constructor(propsWithChildren: object) {
    const eventBus = new EventBus<TBlockEventMap<Props>>();

    const { props, children } = this._getPropsAndChildren(propsWithChildren);
    this.props = this._makePropsProxy({ ...props });
    this.children = children;

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

  _registerEvents(eventBus: EventBus<TBlockEventMap<Props>>) {
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

  componentDidMount(_oldProps?: TBlockProps<Props>) {}

  dispatchComponentDidMount() {
    this._eventBus().emit(Block.EVENTS.FLOW_CDM);
  }

  _componentDidUpdate(oldProps: TBlockProps<Props>, newProps: TBlockProps<Props>) {
    const response = this.componentDidUpdate(oldProps, newProps);
    if (!response) {
      return;
    }
    this._render();
  }

  componentDidUpdate(_oldProps?: TBlockProps<Props>, _newProps?: TBlockProps<Props>) {
    return true;
  }

  _getPropsAndChildren(propsAndChildren: object) {
    const children: Record<string, TAnyBlock> = {};
    const props: Record<string, unknown> = {};

    Object.entries(propsAndChildren as Record<string, unknown>).forEach(([key, value]) => {
      if (value instanceof Block) {
        children[key] = value;
      } else {
        props[key] = value;
      }
    });

    return { children, props: props as TComponentProps<Props> };
  }

  setProps = (nextProps: TBlockProps<Props>) => {
    if (!nextProps) {
      return;
    }

    Object.assign(this.props, nextProps);
  };

  get element() {
    return this._element;
  }

  _render() {
    const propsAndStubs: Record<string, unknown> = { ...this.props };

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
      const currentElement = this._element;
      const currentElementParent = currentElement.parentNode;

      if (currentElementParent) {
        try {
          currentElementParent.replaceChild(newElement, currentElement);
        } catch (error) {
          if (!(error instanceof DOMException) || error.name !== 'NotFoundError') {
            throw error;
          }
        }
      }
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

  _makePropsProxy(props: TComponentProps<Props>) {
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

export type TBlockConstructor = new (
  propsWithChildren: object,
) => Block<Record<string, unknown>>;

export default Block;
