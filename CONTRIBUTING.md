# Contributing

Thanks for helping. Issues and pull requests are welcome.

## How this repository works

The libraries are developed inside a private source repository and copied here.
That affects how changes land:

- **Commits named `sync: <date>`** are snapshots from the source repository: one commit per
  sync, no history behind them. They're made by a script, never by hand.
- **Pull requests merged here** are carried back into the source repository with their
  author and message kept, so your commit stays yours. They're squash-merged, one commit per
  pull request.
- A sync waits until every merged pull request has been carried back, so nothing merged here
  is overwritten by a snapshot.

## Making a change

Node 26 and Yarn 1.

```bash
yarn install
yarn boundary     # the folder stands alone: MIT, no outside imports or site-specific names
yarn lint
yarn build
yarn test
yarn build-storybook
yarn build-kit     # core's brand kit (the theme picker)
```

CI runs the same steps on every pull request, and they must pass before it's merged.

- Keep components the same across libraries: every library exports `@rnine/core`'s names
  with the same props. A library-only piece goes in that library's package.
- Style core components with the shared mixins (`corner`, `card-corner`, `ornament`,
  `corner-ornament`, `card-ornament`, `texture`) and tokens, never one library's look. The same goes for the static pages'
  styles (`core/src/pages/page.scss`): no color values, only tokens (a test checks).
- Add or update the story and the tests for what you change.

## Releasing (maintainers)

The packages share one version. A release is one commit that sets the same `version` in
every `packages/*/package.json` and in each library's `@rnine/core` dependency:
`yarn release:version 0.2.0` does both. While it's 0.x, a minor bump (0.2.0) may break
things and a patch (0.1.1) only fixes them. A version with a hyphen (`0.3.0-beta.1`) goes
out under the npm tag `next`.

When that commit reaches `main`, the [Publish](.github/workflows/publish.yml) workflow
builds, tests and runs `yarn smoke`, which installs the packed tarballs in a new app and
type-checks and builds it. Then it publishes core first and the libraries after it
(`scripts/publish.mjs`), and tags each version (`core@0.2.0`, `nineos@0.2.0`, `ninefold@0.2.0`) with a
GitHub Release. Publishing uses npm Trusted Publishing: there's no npm token anywhere,
and every version carries provenance (the commit and workflow that built it). If a run
stops halfway, run Publish again (Actions → Publish → Run workflow): it skips what's on
npm already and tags whatever isn't tagged yet.

**A new package's first version is published by hand**, because npm can only trust a
workflow for a package that already exists. Any terminal works, including a GitHub
Codespace on this repository:

```bash
git clone https://github.com/rNineTheFirst/rnine-ui.git && cd rnine-ui
yarn install --frozen-lockfile && yarn build && yarn test && yarn smoke
npm login
npm publish -w @rnine/core --provenance=false      # provenance only comes from CI
npm publish -w @rnine/nineos --provenance=false
```

Publish only the package that's new (its dependencies first, if they're new too), and
add it to `ORDER` in `scripts/publish.mjs`, after the packages it depends on. Until its
first version is on npm, the Publish workflow skips it with a notice.

If npm stages it instead (it shows a `0.0.0-stage` placeholder), approve it on npmjs.com
(account settings → Staged Packages). Then, on npmjs.com, for each package: **Settings →
Trusted Publisher → GitHub Actions** (user `rNineTheFirst`, repository `rnine-ui`,
workflow `publish.yml`, *Allow npm publish* checked), and under **Publishing access** pick
*Require two-factor authentication and disallow tokens*. Run Publish once by hand to tag
the version.

**Approving each release instead (optional).** With *Allow npm publish* unchecked, the
workflow may only stage. Run the script with `--stage` in `publish.yml`: each version then
waits on npm until a maintainer approves it with 2FA, core first, on npmjs.com or with
`npm stage approve <stage-id>` (the Publish run's summary lists the ids). Run Publish
again afterwards to tag them.

## License

By contributing you agree that your contribution is licensed under the MIT license (see
[LICENSE](LICENSE)).
