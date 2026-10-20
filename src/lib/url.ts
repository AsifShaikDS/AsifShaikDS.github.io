// Every internal href on the site goes through this, so moving the site to a
// sub-path (a project repo instead of a user site) is a one-line change in
// astro.config.mjs rather than a find-and-replace.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path: string): string {
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  return `${BASE}/${path.replace(/^\//, '')}`.replace(/\/$/, '') || '/';
}
