# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Fly.io deployment configuration

The GitHub Actions workflow deploys the app on pushes to `main`. In the GitHub
repository's **Settings → Secrets and variables → Actions**, configure:

- The `FLY_PRODUCTION_TOKEN` secret, with access to the `contador-lt` Fly app.
- These twelve repository variables, using the Firebase web app's configuration values:
    - `PUBLIC_FIREBASE_API_KEY`
    - `PUBLIC_FIREBASE_AUTH_DOMAIN`
    - `PUBLIC_FIREBASE_PROJECT_ID`
    - `PUBLIC_FIREBASE_STORAGE_BUCKET`
    - `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    - `PUBLIC_FIREBASE_APP_ID`
    - `VITE_FIREBASE_API_KEY`
    - `VITE_FIREBASE_AUTH_DOMAIN`
    - `VITE_FIREBASE_PROJECT_ID`
    - `VITE_FIREBASE_STORAGE_BUCKET`
    - `VITE_FIREBASE_MESSAGING_SENDER_ID`
    - `VITE_FIREBASE_APP_ID`

All twelve variables must be nonempty and single-line. The workflow stages them as
Fly secrets before deploying, so the new release receives them as runtime
environment variables. Each `VITE_` value corresponds to the `PUBLIC_` value
with the same suffix. The current application reads the `PUBLIC_` values at
runtime and does not use the `VITE_` values. Firebase's public web
configuration is sent to the browser and must not contain private credentials.
Fly stores these values as secrets for runtime delivery, but that does not make
the browser configuration private from users of the app.

When adding an application secret, create it as a GitHub Actions secret and
explicitly add it to the staging step in `.github/workflows/fly.yml`. Do not
copy `FLY_PRODUCTION_TOKEN` into the app; it is only used to authenticate deployment.
Changes to GitHub variables or secrets take effect on the next deployment.

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv@0.16.1 create --template minimal --types ts --add tailwindcss="plugins:typography" --install pnpm frontend
```

## Developing

Install dependencies with `pnpm install`, then start a development server:

```sh
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev --open
```

## Building

To create a production version of your app:

```sh
pnpm run build
```

You can preview the production build with `pnpm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target
> environment.
