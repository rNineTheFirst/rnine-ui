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
```

CI runs the same steps on every pull request, and they must pass before it's merged.

- Keep components the same across libraries: every library exports `@rnine/core`'s names
  with the same props. A library-only piece goes in that library's package.
- Style core components with the shared mixins (`corner`, `ornament`, `corner-ornament`,
  `texture`) and tokens, never one library's look.
- Add or update the story and the tests for what you change.

## Releasing (maintainers)

The packages share one version. A release is one commit that sets the same `version` in
every `packages/*/package.json` and in each library's `@rnine/core` dependency. While
it's 0.x, a minor bump (0.2.0) may break things and a patch (0.1.1) only fixes them.
A version with a hyphen (`0.3.0-beta.1`) goes out under the npm tag `next`.

When that commit reaches `main`, the [Publish](.github/workflows/publish.yml) workflow
builds, tests and runs `yarn smoke`, which installs the packed tarballs in a new app and
type-checks and builds it. Then it publishes core first and the libraries after it
(`scripts/publish.mjs`), and tags each version (`core@0.2.0`, `nineos@0.2.0`) with a
GitHub Release. Publishing uses npm Trusted Publishing: there's no npm token anywhere,
and every version carries provenance (the commit and workflow that built it).

**A new package's first version is published by hand**, because npm can only trust a
workflow for a package that already exists:

```bash
git clone https://github.com/rNineTheFirst/rnine-ui.git && cd rnine-ui
yarn install --frozen-lockfile && yarn build && yarn test && yarn smoke
npm login
npm publish -w @rnine/core --provenance=false      # provenance only comes from CI
npm publish -w @rnine/nineos --provenance=false
```

Then, on npmjs.com, for each package: **Settings → Trusted Publisher → GitHub Actions**
(user `rNineTheFirst`, repository `rnine-ui`, workflow `publish.yml`), and under
**Publishing access** pick *Require two-factor authentication and disallow tokens*. Run
the Publish workflow once by hand (Actions → Publish → Run workflow) to tag the version.

## License

By contributing you agree that your contribution is licensed under the MIT license (see
[LICENSE](LICENSE)).
