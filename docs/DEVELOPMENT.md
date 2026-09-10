# Development notes

## Application structure

The website is a client-side React application with static assets. Vite uses the root `index.html` as its production entry. `tests/fixtures.html` is a development-only visual fixture and is not part of the production build.

Routes use query parameters:

- `/?view=work`
- `/?view=work&project=hiyala-handball-2025`
- `/?view=about`
- `/?view=broadcasts`
- `/?view=live`

Keep the query string when sharing an individual page. Assets use `/assets/...` paths, so the application expects hosting at the origin root.

## Content updates

`src/content.json` contains the shared business identity, contact information, six recorded broadcasts and 38 social archive entries. The archive entries are individual photographs/posts, not 38 separate projects. Preserve each record's original source URL, title, publication date, dimensions and alt text.

`src/projects.ts` groups existing archive and broadcast records into three project stories. Use existing valid IDs for covers, galleries and replays. The hero photograph and its mobile alternate are maintained in `src/Hero.tsx`.

Social publication dates are not event dates. A source image or title that says LIVE does not establish current live status. A live entry needs current verification, a valid future `liveVerifiedUntil`, and no end timestamp. The state tests enforce these distinctions.

## Motion and accessibility

Use the shared `--ease` token. Scroll reveals are finite and attached to `data-reveal` targets. The reveal hook prepares only enrolled offscreen elements and clears temporary states on entry, focus, preference changes and cleanup. Avoid nested parent/child reveals and exclude dialogs from scroll animation.

Keep frequently used controls immediate. Fine-pointer hover effects must not carry essential information or move the clickable region. Respect `prefers-reduced-motion` for CSS and JavaScript effects, and test a preference change while motion is active.

Page identities deliberately ignore filters, individual gallery photos and in-page anchors. Preserve the page-transition sequence guard and Back/Forward scroll restoration when changing navigation.

## Verification

Run `npm test` and `npm run build`. For UI changes, also check desktop and mobile widths, keyboard focus, menu/dialog closing, fast navigation, image failures and reduced motion. Test gallery filters and arrow-key navigation without replaying page transitions.

The existing `tests/fixtures.html` can be opened through the development server for media/title stress cases. It complements the automated state tests.

## Hosting

Build with `npm run build`, then deploy the contents of `dist/` to a static host. Do not upload the repository, `node_modules`, source-only fixtures or development configuration as the web root.

The current Cloudflare Pages project uses manual Direct Upload. This Git repository has no deployment workflow or hosting integration, so commits and pushes do not update the published website. Connecting Git-based deployments would be a separate configuration decision.

## Enquiries and embeds

The enquiry form prepares a summary and opens a draft in the visitor's email application, or copies the summary. There is no server-side sending endpoint and no automatic message submission.

YouTube, Facebook and Instagram embeds load when requested. Platforms may restrict them; keep source links usable independently of embeds.
