# Frontend

React 18 + Vite frontend for Mupporul 369.

## Run

1. Copy `.env.example` to `.env`.
2. Set `VITE_API_BASE_URL` for the deployed backend, or leave it empty to use relative `/api` paths.
3. Optionally set `VITE_DEV_API_PROXY_TARGET` for local API proxying.
4. Install dependencies with `npm install`.
5. Start the dev server with `npm run dev`.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run test`
- `npm run test:watch`

## GitHub Pages Deploy

1. Set `VITE_BASE_PATH` to your repository subpath, for example `/mupporul369/`.
2. Set `VITE_API_BASE_URL` to the deployed backend URL.
3. Run `npm run build`.
4. Publish the `dist/` directory to GitHub Pages.

If you deploy with GitHub Actions, ensure the workflow uses the same `VITE_BASE_PATH` value during the build step.
