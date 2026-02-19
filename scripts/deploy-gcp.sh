#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== ArchiFlow AI - Google Cloud Deployment Script ===${NC}"
echo "This script will deploy ArchiFlow AI to Google Cloud Run."
echo ""

# 1. Configuration
read -p "Enter your Google Cloud Project ID: " PROJECT_ID
read -p "Enter the Region (default: us-central1): " REGION
REGION=${REGION:-us-central1}
SERVICE_NAME="archiflow-service"
REPO_NAME="archiflow-repo"

echo -e "\n${BLUE}Setting project to $PROJECT_ID...${NC}"
gcloud config set project $PROJECT_ID

# 2. Enable APIs
echo -e "\n${BLUE}Enabling required Google Cloud APIs...${NC}"
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com

# 3. Create Artifact Registry (if not exists)
echo -e "\n${BLUE}Checking Artifact Registry repository...${NC}"
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION >/dev/null 2>&1; then
    echo "Creating repository '$REPO_NAME' in $REGION..."
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="ArchiFlow AI Docker Repository"
else
    echo "Repository '$REPO_NAME' already exists."
fi

# 4. Build and Push Image
IMAGE_TAG="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/archiflow-app:latest"
echo -e "\n${BLUE}Building and pushing Docker image to Cloud Build...${NC}"
echo "Image Tag: $IMAGE_TAG"
gcloud builds submit --tag $IMAGE_TAG

# 5. Collect Environment Variables
echo -e "\n${YELLOW}Configuration Required:${NC}"
echo "You need to provide your Gemini API Key. If you leave it blank, the app will run in Mock Mode."
read -p "Enter Gemini API Key (hidden): " -s API_KEY
echo ""

echo -e "\n${YELLOW}Database Configuration:${NC}"
echo "For a production deployment, you should use a managed database like Cloud SQL."
echo "For this demo script, we will ask for connection details."
read -p "DB Host (e.g., /cloudsql/project:region:instance or IP): " DB_HOST
read -p "DB Name: " DB_NAME
read -p "DB User: " DB_USER
read -p "DB Password (hidden): " -s DB_PASS
echo ""

# 6. Deploy to Cloud Run
echo -e "\n${BLUE}Deploying to Cloud Run...${NC}"

# Construct env vars string
ENV_VARS="NODE_ENV=production"
if [ ! -z "$API_KEY" ]; then ENV_VARS="$ENV_VARS,API_KEY=$API_KEY"; fi
if [ ! -z "$DB_HOST" ]; then ENV_VARS="$ENV_VARS,DB_HOST=$DB_HOST"; fi
if [ ! -z "$DB_NAME" ]; then ENV_VARS="$ENV_VARS,DB_NAME=$DB_NAME"; fi
if [ ! -z "$DB_USER" ]; then ENV_VARS="$ENV_VARS,DB_USER=$DB_USER"; fi
if [ ! -z "$DB_PASS" ]; then ENV_VARS="$ENV_VARS,DB_PASS=$DB_PASS"; fi

# Add Cloud SQL connection if host looks like a connection name
CLOUDSQL_FLAG=""
if [[ "$DB_HOST" == *":"*":"* ]] && [[ "$DB_HOST" != *"."* ]]; then
   # Heuristic: if it has colons and no dots, it might be a connection name (project:region:instance)
   # Or if user explicitly entered /cloudsql/...
   INSTANCE_NAME=$(echo $DB_HOST | sed 's|/cloudsql/||')
   CLOUDSQL_FLAG="--add-cloudsql-instances=$INSTANCE_NAME"
   echo "Detected Cloud SQL instance. Adding connection: $INSTANCE_NAME"
fi

gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_TAG \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars "$ENV_VARS" \
    $CLOUDSQL_FLAG

echo -e "\n${GREEN}Deployment Complete!${NC}"
echo "Your service URL should be listed above."
echo "Check health status at: https://<YOUR-SERVICE-URL>/api/health"
