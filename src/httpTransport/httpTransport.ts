export enum METHOD {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

function queryStringify(data: Record<string, unknown>): string {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Data must be an object.');
  }

  const keys = Object.keys(data);

  if (keys.length === 0) {
    return '';
  }

  const queryParts = keys.map((key) => {
    const value = data[key];

    return `${key}=${value ?? ''}`;
  });

  const queryString = queryParts.join('&');

  return queryString;
}

type Options = {
  method: METHOD;
  headers?: Record<string, string>;
  data?: Record<string, unknown> | FormData;
};

type OptionsWithoutMethod = Omit<Options, 'method'>;

type HTTPMethod = <R = XMLHttpRequest>(url: string, options?: OptionsWithoutMethod) => Promise<R>;

export default class HTTPTransport {
  get: HTTPMethod = (url: string, options: OptionsWithoutMethod = {}) => {
    return this.request(url, { ...options, method: METHOD.GET });
  };

  post: HTTPMethod = (url: string, options: OptionsWithoutMethod = {}) => {
    return this.request(url, { ...options, method: METHOD.POST });
  };

  put: HTTPMethod = (url: string, options: OptionsWithoutMethod = {}) => {
    return this.request(url, { ...options, method: METHOD.PUT });
  };

  delete: HTTPMethod = (url: string, options: OptionsWithoutMethod = {}) => {
    return this.request(url, { ...options, method: METHOD.DELETE });
  };

  request = <R = XMLHttpRequest>(
    url: string,
    options: Options = { method: METHOD.GET },
    timeout = 5000,
  ): Promise<R> => {
    const { headers = {}, method, data } = options;
    const requestHeaders = { ...headers };

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      let requestUrl = url;

      if (method === METHOD.GET && data && !(data instanceof FormData)) {
        requestUrl = `${url}?${queryStringify(data)}`;
      }

      xhr.open(method, requestUrl);
      xhr.timeout = timeout;
      xhr.withCredentials = true;

      if (data && !(data instanceof FormData) && !requestHeaders['Content-Type']) {
        requestHeaders['Content-Type'] = 'application/json';
      }

      Object.entries(requestHeaders).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.onload = () => resolve(xhr as R);

      xhr.onabort = reject;
      xhr.onerror = reject;
      xhr.ontimeout = reject;

      if (method === METHOD.GET || !data) {
        xhr.send();
      } else if (data instanceof FormData) {
        xhr.send(data);
      } else {
        xhr.send(JSON.stringify(data));
      }
    });
  };
}
