# EventCast Maldives

A photography-led website for EventCast Maldives: live streaming, video production, event coverage and enquiries from Thinadhoo, Maldives.

Built with React, TypeScript and Vite. This repository includes the latest motion refinements: a framed hero entrance, editorial scroll reveals, a second Hiyala photograph on hover, responsive action arrows and a staggered mobile menu. Keyboard navigation and reduced-motion preferences are supported.

**Website:** [eventcast-maldives.pages.dev](https://eventcast-maldives.pages.dev/)

The deployed Cloudflare Pages website is updated separately through Direct Upload. Pushing to this repository does not publish a new website version.

## Run locally

Use Node.js 24 LTS and npm. No environment variables, API keys or backend services are needed to run the site.

```sh
npm ci
npm run dev -- --port 4173
```

Open [http://127.0.0.1:4173/](http://127.0.0.1:4173/). The development server binds to this computer only and updates as files change.

## Build and check

```sh
npm test
npm run build
npm run preview -- --port 4174
```

The build includes TypeScript checking and writes the static website to `dist/`. The state tests cover verified live, replay, scheduled and unavailable broadcast states. Browser checks should accompany changes to layouts, motion, focus or embedded media.

## Pages and features

- **Home:** authentic EventCast photography, selected project stories, services and broadcasts.
- **Our work:** three editorial project stories and a searchable archive of 38 sourced Facebook/Instagram entries, with photo navigation and optional original-post embeds.
- **About:** the team, production services, photographs and enquiry process.
- **Watch:** recorded broadcasts, filtering and on-demand YouTube players.
- **Enquiries:** a reviewable email draft, copyable summary and phone contact. The website does not send messages automatically.

The social collection is manually curated. It does not automatically sync channels or claim to contain every historical post. External embeds depend on the source platform; original links remain available.

## Maintaining the project

| Area | Files |
| --- | --- |
| Contacts, broadcasts and social records | `src/content.json` |
| Editorial project stories | `src/projects.ts`, `src/ProjectStories.tsx` |
| Hero and responsive photo composition | `src/Hero.tsx`, `src/Hero.css` |
| Shared styles and navigation | `src/style.css`, `src/main.tsx` |
| Scroll entrances and page transitions | `src/useEditorialMotion.ts`, `src/usePageTransition.ts` |
| Enquiry flow | `src/Booking.tsx` |
| Original imagery and self-hosted fonts | `public/assets/` |

See [development notes](docs/DEVELOPMENT.md) for route, content and deployment details, and [asset sources](docs/ASSETS.md) for media attribution and font licenses.

## Collaboration

This repository is public and can be viewed through its GitHub link. Its owner can invite collaborators through GitHub's repository access settings to grant write access. Make changes on a branch, verify the build and open a pull request for review. Website deployment is a separate action.
