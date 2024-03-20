import type { HTTPError } from 'ky';

declare module '@tanstack/react-query' {
  // eslint-disable-next-line no-unused-vars
  interface Register {
    defaultError: HTTPError;
  }
}
