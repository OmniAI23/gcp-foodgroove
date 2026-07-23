# Deployment Documentation

This application is a full-stack React application with an Express backend, bundled using Vite and esbuild.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Environment Variables

Ensure the following environment variables are set in your production environment:

- `STRIPE_SECRET_KEY`: Your Stripe secret key for processing payments.
- `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key for the frontend.
- `ADMIN_PASSWORD`: Password for the admin portal.
- `ADMIN_EMAIL`: Email address that will receive order notifications.
- `SMTP_HOST`: The SMTP server host (e.g., smtp.gmail.com).
- `SMTP_PORT`: The SMTP server port (e.g., 587 or 465).
- `SMTP_USER`: The username for your SMTP server.
- `SMTP_PASS`: The password or app password for your SMTP server.

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

### Option 1: Docker (Cloud Run via GitHub)

A `Dockerfile` has been provided to simplify deployment to Google Cloud Run. When you connect your GitHub repository to Cloud Run, it will automatically detect the `Dockerfile` and build your container.

1. **GitHub Connection**: In the Google Cloud Console, create a new Cloud Run service and select "Continuously deploy from a repository".
2. **Configuration**: Select your GitHub repository and branch.
3. **Build Type**: Choose "Dockerfile".
4. **Port**: Cloud Run will automatically inject a `PORT` environment variable. The application is configured to listen on this port.

### Option 2: Manual Deployment

1. **Build Artifacts**: Ensure `npm run build` is executed during the build phase of your CI/CD pipeline.
2. **Execution**: Set the start command to `npm run start`.
3. **Port**: The application binds to the port specified in the `PORT` environment variable (defaults to `3000`).
4. **Static Assets**: The Express server automatically serves static files from the `dist/` directory in production mode.
