# Deploying ArchiFlow AI to Google Cloud Run

This guide will walk you through deploying the ArchiFlow AI application to Google Cloud Run, a fully managed serverless platform for containerized applications.

## Prerequisites

1.  **Google Cloud Project**: You need an active Google Cloud Platform (GCP) project.
2.  **Google Cloud CLI**: Install the `gcloud` CLI: [Install Instructions](https://cloud.google.com/sdk/docs/install)
3.  **Billing Enabled**: Ensure billing is enabled for your project.

## Step 1: Login and Configure

Authenticate with Google Cloud:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

Enable the necessary APIs:

```bash
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com
```

## Step 2: Create a Repository

Create an Artifact Registry repository to store your Docker images:

```bash
gcloud artifacts repositories create archiflow-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="ArchiFlow AI Docker Repository"
```

## Step 3: Build and Push the Image

Submit a build to Cloud Build. This command zips your code, uploads it to GCP, builds the Docker image remotely, and pushes it to Artifact Registry.

```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/archiflow-repo/archiflow-app:latest
```

*(Replace `YOUR_PROJECT_ID` with your actual project ID)*

## Step 4: Deploy to Cloud Run

Deploy the container to Cloud Run. This command creates a service that scales automatically.

**Important:** You need to pass your environment variables here.

```bash
gcloud run deploy archiflow-service \
    --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/archiflow-repo/archiflow-app:latest \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars API_KEY="your-real-google-gemini-api-key" \
    --set-env-vars DB_HOST="your-db-host",DB_USER="your-db-user",DB_PASS="your-db-pass",DB_NAME="your-db-name"
```

### Notes on Database:
- For a production database, consider using **Cloud SQL** (PostgreSQL).
- If using Cloud SQL, you'll need to add the `--add-cloudsql-instances` flag and use the Cloud SQL socket path or Auth Proxy.
- For a quick test (without persistence), you can use an in-memory SQLite if supported, but this app is configured for PostgreSQL.

## Step 5: Verification

After deployment, `gcloud` will output a Service URL (e.g., `https://archiflow-service-xyz-uc.a.run.app`).

1.  Visit the URL in your browser. You should see the application.
2.  Check the health endpoint: `https://YOUR_SERVICE_URL/api/health`
    - It should return `{"status":"ok", ...}`
3.  Test the AI generation.

## Troubleshooting

- **Logs**: View logs in the Google Cloud Console under "Cloud Run" -> "Logs".
- **Quota/Billing**: Ensure your quota allows for the requested CPU/Memory.
- **Environment Variables**: If the app crashes on start, double-check your `DB_` connection strings and `API_KEY`.
