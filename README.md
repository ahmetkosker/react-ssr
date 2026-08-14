# React SSR

This project provides a template for server-side rendering (SSR) with React.
It is designed to help you bootstrap a scalable React SSR setup quickly.
Use this repository as a clean starting point for both development and production workflows.

## Installation

To get started, clone this repository and navigate to its directory:

```bash
git clone https://github.com/ahmetkosker/react-ssr.git
cd react-ssr
```

Then, install the project dependencies using Yarn:

```bash
yarn install
```

## Usage

This project includes several commands to help you with development and production:

### Start Development Environment

To start the development environment, run:

```bash
yarn start:dev
```

This command compiles both client and server code, watches Tailwind CSS for changes, and restarts the server automatically whenever you make modifications.

### Compile for Production

For compiling the project for production, use the following command:

```bash
yarn build
```

This command compiles both client and server code optimized for production.

### Start the Server

To start the compiled server code, use:

```bash
yarn start
```

`yarn start` requires a previous `yarn build`; the build check fails with a
clear message otherwise.

## Scripts

| Command                  | Description                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| `yarn start:dev`         | Build, then watch client/server/Tailwind and restart the server     |
| `yarn build`             | Compile client pages, server and Tailwind CSS for production        |
| `yarn start`             | Run the compiled server (requires `yarn build` first)               |
| `yarn test`              | Run unit tests (node:test)                                          |
| `yarn lint`              | Prettier check + ESLint                                             |
| `yarn lint:fix`          | Auto-fix ESLint issues                                              |
| `yarn format`            | Format the codebase with Prettier                                   |
| `yarn typecheck`         | TypeScript check (`tsc --noEmit`)                                   |
| `yarn generate:page`     | Scaffold a new page, e.g. `yarn generate:page TodoList`             |
| `yarn ci`                | Full verification chain: lint → typecheck → test → build            |

## Environment Variables

The project does **not** use dotenv; export variables in your shell instead
(e.g. `PORT=3001 yarn start`). See `.env.example` for a complete annotated
list.

| Variable          | Default                  | Description                                   |
| ----------------- | ------------------------ | --------------------------------------------- |
| `PORT`            | `3000`                   | Server port (1-65535)                         |
| `NODE_ENV`        | `development`            | `development` or `production`                 |
| `PUBLIC_BASE_URL` | `http://localhost:3000`  | Base URL for canonical links and sitemap      |
| `FETCH_TIMEOUT_MS`| `8000`                   | Timeout (ms) for upstream fetches             |
| `COOKIE_MAX_AGE_MS`| `86400000`              | Max age (ms) of the `lang` cookie             |
| `SITE_NAME`       | `React SSR`              | Site name used in page titles                 |

Invalid values (e.g. `PORT=abc`) fail fast at server startup with a clear
error message.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add pages, work with i18n
and follow the project conventions.

## Contact

For any questions or feedback regarding the project, please feel free to reach out to [Ahmet Köşker](https://github.com/ahmetkosker) via email at exarons@gmail.com.
