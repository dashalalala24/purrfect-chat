import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';

import Block from './Block';
import Router from './Router';
import store from './Store';
import { Routes } from '../consts/routes';

class TestPage extends Block<Record<string, unknown>> {
  render(): string {
    return '<main data-testid="test-page">Test page</main>';
  }
}

class NotFoundPage extends Block<Record<string, unknown>> {
  render(): string {
    return '<main data-testid="not-found-page">Not found</main>';
  }
}

class FirstPage extends Block<Record<string, unknown>> {
  render(): string {
    return '<main data-testid="first-page">First</main>';
  }
}

class SecondPage extends Block<Record<string, unknown>> {
  render(): string {
    return '<main data-testid="second-page">Second</main>';
  }
}

describe('Router', () => {
  let router: Router;
  let internalRouter: {
    routes: unknown[];
    _currentRoute: unknown;
  };

  beforeEach(() => {
    sessionStorage.clear();
    store.clearAuthData();
    document.body.innerHTML = '<div id="app"></div>';
    window.history.pushState({}, '', '/');

    (Router as unknown as { __instance: Router | undefined }).__instance = undefined;
    router = new Router('#app');
    internalRouter = router as unknown as {
      routes: unknown[];
      _currentRoute: unknown;
    };
    internalRouter.routes = [];
    internalRouter._currentRoute = null;

    sinon.restore();
  });

  describe('constructor', () => {
    it('follows singleton pattern', () => {
      const secondRouter = new Router('#another-root');

      expect(secondRouter).to.equal(router);
    });
  });

  describe('route registration', () => {
    it('pushes new route into router on use', () => {
      router.use('/test', TestPage);

      const route = router.getRoute('/test');

      expect(route).to.not.equal(undefined);
    });

    it('has proper routes length after use', () => {
      router.use('/test', TestPage);

      expect(internalRouter.routes.length).to.equal(1);
    });

    it('returns wildcard route when pathname is not found', () => {
      router.use('/known', TestPage).use('*', NotFoundPage);

      const actualRoute = router.getRoute('/unknown');
      const wildcardRoute = router.getRoute('*');

      expect(actualRoute).to.equal(wildcardRoute);
    });
  });

  describe('navigation', () => {
    it('pushes history and renders route on go', () => {
      router.use('/known', TestPage).use('*', NotFoundPage);
      const pushStateSpy = sinon.spy(window.history, 'pushState');

      router.go('/known');

      expect(pushStateSpy.calledWith({}, '', '/known')).to.equal(true);
      expect(document.querySelector('[data-testid="test-page"]')).to.not.equal(null);
    });

    it('calls leave on previous route when navigating to another route', () => {
      router.use('/first', FirstPage).use('/second', SecondPage).use('*', NotFoundPage);
      const firstRoute = router.getRoute('/first') as { leave: () => void };
      const leaveSpy = sinon.spy(firstRoute, 'leave');

      router.go('/first');
      router.go('/second');

      expect(leaveSpy.calledOnce).to.equal(true);
      expect(document.querySelector('[data-testid="second-page"]')).to.not.equal(null);
    });

    it('delegates back and forward to history API', () => {
      const backSpy = sinon.spy(window.history, 'back');
      const forwardSpy = sinon.spy(window.history, 'forward');

      router.back();
      router.forward();

      expect(backSpy.calledOnce).to.equal(true);
      expect(forwardSpy.calledOnce).to.equal(true);
    });

    it('does not render anything for unknown path when wildcard route is absent', () => {
      router.use('/known', TestPage);

      router.go('/unknown');

      expect(document.querySelector('[data-testid="test-page"]')).to.equal(null);
    });
  });

  describe('start guards', () => {
    it('redirects guest user to sign-in page on start', () => {
      window.history.pushState({}, '', Routes.Chats);
      const goSpy = sinon.spy(router, 'go');

      router.start();

      expect(goSpy.calledWith(Routes.SignIn)).to.equal(true);
    });

    it('redirects authorized user from auth route to chats on start', () => {
      store.setUser({
        id: 1,
        first_name: 'Test',
        second_name: 'User',
        phone: '+79999999999',
        login: 'tester',
        email: 'tester@example.com',
      });
      window.history.pushState({}, '', Routes.SignUp);
      const goSpy = sinon.spy(router, 'go');

      router.start();

      expect(goSpy.calledWith(Routes.Chats)).to.equal(true);
    });
  });
});
