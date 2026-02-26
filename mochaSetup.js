import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: 'http://localhost/',
});

const { window } = dom;

Object.assign(globalThis, {
  window,
  document: window.document,
  history: window.history,
  location: window.location,
  sessionStorage: window.sessionStorage,
  FormData: window.FormData,
  XMLHttpRequest: window.XMLHttpRequest,
  DOMException: window.DOMException,
  MouseEvent: window.MouseEvent,
});
