# PLANET IT

A responsive marketing landing page for a managed IT support, cloud, and cybersecurity services company.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![No build step](https://img.shields.io/badge/build-none-lightgrey)
![License](https://img.shields.io/badge/license-Unlicensed-lightgrey)

![Screenshot](assets/screenshot.png)

## About

PLANET IT is a single-page site for a fictional managed IT services provider. It's built with plain HTML, CSS, and vanilla JavaScript — no framework, no bundler, no dependencies. The page covers:

- **Hero** section with an animated circuit-trace SVG, data center photography, and call-to-action buttons
- **Services** grid (managed support, cloud migration, cybersecurity, network infrastructure)
- **Stats bar** with scroll-triggered, animated count-up numbers
- **Gallery** ("Our Work") — real IT-environment photography with hover reveals
- **Security/trust strip** — defense-in-depth capabilities, framed honestly for a demo company
- **Testimonials** carousel (swipeable on mobile, static grid on desktop)
- **Lead magnet** — a gated "10-Point IT Security Checklist" download with its own email-capture form
- **Enquiry form** with client-side validation, a honeypot field for spam, and async submission via `fetch`
- SEO basics: canonical/Open Graph/Twitter meta, JSON-LD `LocalBusiness` schema, `robots.txt`, `sitemap.xml`
- A basic `Content-Security-Policy` + `Referrer-Policy` meta pair, and honest "submitted over HTTPS" trust microcopy on both forms
- Accessibility touches throughout: skip link, visible focus states, `prefers-reduced-motion` support (all animation is disabled/frozen for it), ARIA labeling

## Design

- **Color system** — deep signal-blue background with dual cyan/violet network accents and a warm coral call-to-action color, replacing the original navy/amber palette.
- **Type** — Space Grotesk for display headings, JetBrains Mono for eyebrows/labels/stat numbers (a nod to terminal/ops-dashboard aesthetics), Inter for body copy.
- **Photography** — sourced from [Unsplash](https://unsplash.com) under the [Unsplash License](https://unsplash.com/license) and stored locally in [assets/photos](assets/photos): server room ([Taylor Vick](https://unsplash.com/@tvick)), network patch panel, data-center monitoring, and terminal/code close-ups.

## Installation

No dependencies, no build tooling. Just clone the repo:

```bash
git clone https://github.com/thisisrey116/workflow.git
cd workflow
```

## Usage

Open [index.html](index.html) directly in a browser, or serve the folder locally:

```bash
npx serve .
```

To wire up the enquiry form and lead-magnet checklist form to a real backend, replace the placeholder endpoint in [script.js](script.js) (both forms POST to it):

```js
const FORM_ENDPOINT = 'https://example.com/api/enquiries';
```

If you do, also update the `connect-src`/`form-action` values in the `Content-Security-Policy` meta tag in [index.html](index.html) — the current policy only allow-lists `example.com`.

## Project tooling

This repo includes a [`.claude/agents/enquiry-form-tester.md`](.claude/agents/enquiry-form-tester.md) subagent that drives a real browser (via the Playwright MCP tools) to fill out and submit the live enquiry form for QA purposes. It reports honestly on the result — since `FORM_ENDPOINT` is still a placeholder, submissions correctly surface the form's error state rather than actually delivering email.

## GitHub Pages

🔗 Live demo: https://thisisrey116.github.io/workflow/

## Credits

Built by [thisisrey116](https://github.com/thisisrey116).
