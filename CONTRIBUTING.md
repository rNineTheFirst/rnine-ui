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

## License

By contributing you agree that your contribution is licensed under the MIT license (see
[LICENSE](LICENSE)).
