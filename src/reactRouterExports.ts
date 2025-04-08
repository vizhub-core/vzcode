// The React Router exports have been a pain to deal with.
// After upgrading Node and React Router, there were random errors.
// And we want to migrate soon from `react-router-dom` to `react-router`,
// so the exports are centralized here.
import * as reactRouterDOM from 'react-router-dom';

export const {
  useSearchParams,

  // This actually is the only thing that works.
  // It looks crazy, but it works.
  // - reactRouterDOM.default works for Vite SSR build
  // - reactRouterDOM works for Vite frontend build
  // @ts-ignore
} = reactRouterDOM.default || reactRouterDOM;
