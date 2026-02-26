import { expect } from 'chai';
import { afterEach, describe, it } from 'mocha';
import sinon from 'sinon';

import HTTPTransport, { METHOD } from './httpTransport';

type TMockXHROptions = {
  onCreate?: (xhr: MockXMLHttpRequest) => void;
};

class MockXMLHttpRequest {
  static latest: MockXMLHttpRequest | null = null;
  static onCreate?: (xhr: MockXMLHttpRequest) => void;

  timeout = 0;
  withCredentials = false;
  onload: ((this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => unknown) | null = null;
  onabort: ((this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => unknown) | null = null;
  onerror: ((this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => unknown) | null = null;
  ontimeout: ((this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => unknown) | null = null;

  open = sinon.spy((_method: string, _url: string) => undefined);
  setRequestHeader = sinon.spy((_key: string, _value: string) => undefined);
  send = sinon.spy((_body?: Document | XMLHttpRequestBodyInit | null) => undefined);

  constructor() {
    MockXMLHttpRequest.latest = this;
    MockXMLHttpRequest.onCreate?.(this);
  }
}

const originalXHR = globalThis.XMLHttpRequest;

function installMockXHR(options: TMockXHROptions = {}) {
  MockXMLHttpRequest.latest = null;
  MockXMLHttpRequest.onCreate = options.onCreate;
  globalThis.XMLHttpRequest = MockXMLHttpRequest as unknown as typeof XMLHttpRequest;
}

function resolveLatestRequest() {
  const latest = MockXMLHttpRequest.latest;

  if (!latest || !latest.onload) {
    throw new Error('MockXMLHttpRequest is not ready.');
  }

  latest.onload.call(latest as unknown as XMLHttpRequest, {} as ProgressEvent<EventTarget>);
}

function rejectLatestRequestBy(eventName: 'onerror' | 'onabort' | 'ontimeout') {
  const latest = MockXMLHttpRequest.latest;
  const handler = latest?.[eventName];

  if (!latest || !handler) {
    throw new Error(`MockXMLHttpRequest ${eventName} handler is not ready.`);
  }

  handler.call(latest as unknown as XMLHttpRequest, {} as ProgressEvent<EventTarget>);
}

describe('HTTPTransport', () => {
  afterEach(() => {
    globalThis.XMLHttpRequest = originalXHR;
    MockXMLHttpRequest.latest = null;
    MockXMLHttpRequest.onCreate = undefined;
    sinon.restore();
  });

  describe('request url and payload', () => {
    it('adds query params for GET requests and sends without body', async () => {
      installMockXHR();
      const transport = new HTTPTransport();

      const request = transport.get('/chats', { data: { limit: 10, title: 'cats' } });
      resolveLatestRequest();
      await request;

      const latest = MockXMLHttpRequest.latest as MockXMLHttpRequest;
      expect(latest.open.calledWith(METHOD.GET, '/chats?limit=10&title=cats')).to.equal(true);
      expect(latest.send.calledWithExactly()).to.equal(true);
    });

    it('sends JSON for non-GET requests and sets Content-Type by default', async () => {
      installMockXHR();
      const transport = new HTTPTransport();
      const payload = { title: 'Purrfect chat' };

      const request = transport.post('/chats', { data: payload });
      resolveLatestRequest();
      await request;

      const latest = MockXMLHttpRequest.latest as MockXMLHttpRequest;
      expect(latest.setRequestHeader.calledWith('Content-Type', 'application/json')).to.equal(true);
      expect(latest.send.calledWith(JSON.stringify(payload))).to.equal(true);
    });

    it('sends FormData without forcing Content-Type header', async () => {
      installMockXHR();
      const transport = new HTTPTransport();
      const formData = new FormData();
      formData.append('avatar', 'cat.png');

      const request = transport.put('/profile/avatar', { data: formData });
      resolveLatestRequest();
      await request;

      const latest = MockXMLHttpRequest.latest as MockXMLHttpRequest;
      expect(latest.setRequestHeader.calledWith('Content-Type', 'application/json')).to.equal(
        false,
      );
      expect(latest.send.calledWith(formData)).to.equal(true);
    });
  });

  describe('request options', () => {
    it('sets timeout and withCredentials for request', async () => {
      installMockXHR();
      const transport = new HTTPTransport();

      const request = transport.request('/profile', { method: METHOD.GET }, 3210);
      resolveLatestRequest();
      await request;

      const latest = MockXMLHttpRequest.latest as MockXMLHttpRequest;
      expect(latest.timeout).to.equal(3210);
      expect(latest.withCredentials).to.equal(true);
    });

    it('passes custom headers to XMLHttpRequest', async () => {
      installMockXHR();
      const transport = new HTTPTransport();

      const request = transport.get('/profile', {
        headers: {
          Authorization: 'Bearer token',
        },
      });
      resolveLatestRequest();
      await request;

      const latest = MockXMLHttpRequest.latest as MockXMLHttpRequest;
      expect(latest.setRequestHeader.calledWith('Authorization', 'Bearer token')).to.equal(true);
    });

    it('does not override provided Content-Type header', async () => {
      installMockXHR();
      const transport = new HTTPTransport();
      const payload = { title: 'Custom header' };

      const request = transport.post('/chats', {
        headers: { 'Content-Type': 'text/plain' },
        data: payload,
      });
      resolveLatestRequest();
      await request;

      const latest = MockXMLHttpRequest.latest as MockXMLHttpRequest;
      expect(latest.setRequestHeader.calledWith('Content-Type', 'text/plain')).to.equal(true);
      expect(latest.setRequestHeader.calledWith('Content-Type', 'application/json')).to.equal(
        false,
      );
    });
  });

  describe('error handling', () => {
    it('rejects request on xhr error event', async () => {
      installMockXHR();
      const transport = new HTTPTransport();
      const request = transport.get('/fail');

      rejectLatestRequestBy('onerror');

      await request.then(
        () => {
          throw new Error('Request should be rejected.');
        },
        (error) => {
          expect(error).to.be.instanceOf(Object);
        },
      );
    });

    it('rejects request on xhr abort event', async () => {
      installMockXHR();
      const transport = new HTTPTransport();
      const request = transport.get('/abort');

      rejectLatestRequestBy('onabort');

      await request.then(
        () => {
          throw new Error('Request should be rejected.');
        },
        (error) => {
          expect(error).to.be.instanceOf(Object);
        },
      );
    });

    it('rejects request on xhr timeout event', async () => {
      installMockXHR();
      const transport = new HTTPTransport();
      const request = transport.get('/timeout');

      rejectLatestRequestBy('ontimeout');

      await request.then(
        () => {
          throw new Error('Request should be rejected.');
        },
        (error) => {
          expect(error).to.be.instanceOf(Object);
        },
      );
    });
  });
});
