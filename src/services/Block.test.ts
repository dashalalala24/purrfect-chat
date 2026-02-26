import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';

import Block from './Block';

type TestBlockProps = {
  title: string;
};

class TestBlock extends Block<TestBlockProps> {
  render(): string {
    return `<div class="block">${this.props.title}</div>`;
  }
}

class TestBlockWithEvent extends Block<Record<string, unknown>> {
  render(): string {
    return '<button class="action">Click</button>';
  }
}

type TCounterProps = {
  counter: number;
  onRender: () => void;
};

class NonUpdatingBlock extends Block<TCounterProps> {
  componentDidUpdate(): boolean {
    return false;
  }

  render(): string {
    this.props.onRender();
    return `<div class="counter">${this.props.counter}</div>`;
  }
}

class ChildBlock extends Block<Record<string, unknown>> {
  public mountSpy = sinon.spy();

  componentDidMount(): void {
    this.mountSpy();
  }

  render(): string {
    return '<span data-testid="child-content">Child</span>';
  }
}

class ParentWithChildBlock extends Block<Record<string, unknown>> {
  render(): string {
    return '<section data-testid="parent">{{{child}}}</section>';
  }
}

describe('Block', () => {
  describe('props updates', () => {
    it('updates content after setProps', () => {
      const block = new TestBlock({ title: 'before' });

      block.setProps({ title: 'after' });

      expect(block.getContent().textContent).to.equal('after');
    });

    it('does not rerender when componentDidUpdate returns false', () => {
      const renderSpy = sinon.spy();
      const block = new NonUpdatingBlock({ counter: 1, onRender: renderSpy });
      const renderCallsAfterInit = renderSpy.callCount;

      block.setProps({ counter: 2, onRender: renderSpy });

      expect(renderSpy.callCount).to.equal(renderCallsAfterInit);
      expect(block.getContent().textContent).to.equal('1');
    });
  });

  describe('events', () => {
    it('binds DOM events from props.events', () => {
      const clickHandler = sinon.spy();
      const block = new TestBlockWithEvent({ events: { click: clickHandler } });

      block.getContent().dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

      expect(clickHandler.calledOnce).to.equal(true);
    });

    it('replaces event handlers after rerender', () => {
      const firstClickHandler = sinon.spy();
      const secondClickHandler = sinon.spy();
      const block = new TestBlockWithEvent({ events: { click: firstClickHandler } });

      block.setProps({ events: { click: secondClickHandler } });
      block.getContent().dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

      expect(firstClickHandler.called).to.equal(false);
      expect(secondClickHandler.calledOnce).to.equal(true);
    });
  });

  describe('visibility', () => {
    it('changes element visibility with show and hide', () => {
      const block = new TestBlock({ title: 'visibility' });

      block.hide();
      const hiddenDisplay = block.getContent().style.display;
      block.show();
      const shownDisplay = block.getContent().style.display;

      expect(hiddenDisplay).to.equal('none');
      expect(shownDisplay).to.equal('flex');
    });
  });

  describe('children lifecycle', () => {
    it('renders child block into template stub', () => {
      const child = new ChildBlock({});
      const parent = new ParentWithChildBlock({ child });

      const childElement = parent.getContent().querySelector('[data-testid="child-content"]');

      expect(childElement).to.not.equal(null);
      expect(childElement?.textContent).to.equal('Child');
    });

    it('dispatches componentDidMount to child blocks', () => {
      const child = new ChildBlock({});
      const parent = new ParentWithChildBlock({ child });

      parent.dispatchComponentDidMount();

      expect(child.mountSpy.calledOnce).to.equal(true);
    });
  });
});
