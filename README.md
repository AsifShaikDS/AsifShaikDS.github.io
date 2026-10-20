# asifshaikds.github.io

Personal site. Astro, static output, no client-side framework. The deployed site is plain HTML and
CSS, so it keeps working whether or not this repo is ever touched again.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # -> dist/
npm run preview  # serve dist/
npm run check    # TypeScript + Astro diagnostics
```

Node 22.

## Where everything lives

```
src/
  content/work/*.md      case studies — one file per case study, filename = URL slug
  content.config.ts      the frontmatter schema for those files
  data/site.ts           name, role, intro, links, the dated "Now" line, proof strip
  data/focus.ts          the four "What I work on" paragraphs
  data/projects.ts       public repos, including the two that do not exist yet
  pages/about.md         the About page, as plain markdown
  pages/index.astro      home page (layout only — all copy comes from src/data)
  layouts/, components/, styles/global.css
public/                  favicon, robots.txt, and resume.pdf once there is one
.github/workflows/       build + deploy to GitHub Pages on push to main
```

## How to change things

**Add a case study.** Copy any file in `src/content/work/`, rename it — the filename becomes the
URL — and edit. `featured: true` puts it on the home page; `order` sorts it. Nothing else to touch.

**Fix a sentence on the home page.** It is in `src/data/site.ts` or `src/data/focus.ts`. No
component work, and both files are editable from github.com in a browser.

**Update the "Now" line.** `src/data/site.ts`, the `now` object. Change the date every time you
touch the site. That visible date is the only thing on here that will embarrass you into fixing a
stale claim, which is exactly what the previous version of this site lacked for three years.

**Add the résumé.** Drop the PDF at `public/resume.pdf` and set `links.resume = '/resume.pdf'` in
`src/data/site.ts`. Until then the link hides itself rather than 404ing.

**Publish one of the planned repos.** In `src/data/projects.ts`, set `status: 'live'` and add
`href`. The "Not published yet" tag disappears on its own.

## Rules this repo is built around

1. **Never name the client.** Always "a U.S. state department of transportation". No internal
   system, product or repo names either. This is a contractual constraint, not a stylistic one, and
   it applies to URL slugs as much as to prose.
2. **Every number on this site has to be defensible out loud.** If it cannot survive a follow-up
   question in an interview, cut it rather than soften it.
3. **No skill bars, badge walls, logo grids, or a contribution graph.** Especially not a
   contribution graph — the previous site published an empty one to every visitor.
4. **Content is markdown and typed data, never hardcoded in a component.** The last site rotted
   because changing one sentence meant rebuilding a React app.

## Open items

Things deliberately left for a human to decide or verify:

- **Dates.** `period` in each case study's frontmatter is a best guess (`2024 – present`,
  `2025 – present`, `2025`). Check them.
- **Résumé PDF.** Not included. See above.
- **The two public repos** in `src/data/projects.ts` do not exist yet. They render as honest
  placeholders. Nothing links to a repo that is not there.
- **Team size / duration** is not stated on any case study, because it was not verified. Add it to
  the frontmatter and the header if you want it.
- **Custom domain.** Not configured. Add a `CNAME` in `public/` and change `site` in
  `astro.config.mjs` if that changes.
- **OG image.** There is no `og:image`. A simple one would help link previews.
