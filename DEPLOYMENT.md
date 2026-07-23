# Deployment Documentation

This application is a full-stack React application with an Express backend, bundled using Vite and esbuild.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Environment Variables

Ensure the following environment variables are set in your production environment:

- `STRIPE_SECRET_KEY`: Your Stripe secret key for processing payments.
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key (prefix with `VITE_` if used on the client: `VITE_STRIPE_PUBLISHABLE_KEY`).
- `ADMIN_PASSWORD`: Password for the admin portal.
- `EMAIL_USER`: Email address for sending order notifications.
- `EMAIL_PASS`: App password or password for the email account.

## Local Build & Execution

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build the Application**:
   This command compiles the frontend assets and bundles the backend server into `dist/server.cjs`.
   ```bash
   npm run build
   ```

3. **Start the Production Server**:
   ```bash
   npm run start
   ```
   The application will be accessible at `http://localhost:3000`.

## Cloud Deployment (e.g., Cloud Run, Heroku)

1. **Build Artifacts**: Ensure `npm run build` is executed during the build phase of your CI/CD pipeline.
2. **Execution**: Set the start command to `npm run start`.
3. **Port**: The application binds to port `3000` by default. Ensure your cloud provider routes traffic to this port.
4. **Static Assets**: The Express server automatically serves static files from the `dist/` directory in production mode.
