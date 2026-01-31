# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for Continuous Integration and Continuous Deployment to Google Cloud Run.

## Pipeline Architecture

```
Push to main → Run Tests → Deploy to Cloud Run
     ↓             ↓              ↓
  Checkout     npm test    Authenticate with GCP
               npm lint    Build & Deploy
                          Get Service URL
```

## Workflow Triggers

### Automatic Deployment
- **Trigger**: Push to `main` branch
- **Process**:
  1. Runs all tests
  2. Runs linter
  3. If tests pass, deploys to Cloud Run

### Manual Deployment
- **Trigger**: Workflow dispatch button in GitHub Actions UI
- **Location**: Actions tab → Deploy to Cloud Run → Run workflow
- **Use case**: Deploy without pushing to main

## Jobs

### Job 1: Test
- **Runs on**: ubuntu-latest
- **Steps**:
  1. Checkout code
  2. Setup Node.js 20
  3. Install dependencies (npm ci)
  4. Run tests (npm test)
  5. Run linter (npm run lint)

### Job 2: Deploy
- **Depends on**: Test job passing
- **Runs on**: ubuntu-latest
- **Steps**:
  1. Checkout code
  2. Authenticate to Google Cloud (Workload Identity Federation)
  3. Setup gcloud CLI
  4. Deploy to Cloud Run from source
  5. Display deployed service URL

## Google Cloud Configuration

### Project Details
- **Project ID**: robust-environs-409314
- **Project Number**: 988044283106
- **Region**: us-central1
- **Service Name**: stage-app

### Service Account
- **Name**: github-actions-deployer
- **Email**: github-actions-deployer@robust-environs-409314.iam.gserviceaccount.com
- **Roles**:
  - `roles/run.admin` - Deploy Cloud Run services
  - `roles/iam.serviceAccountUser` - Act as service accounts
  - `roles/artifactregistry.writer` - Push container images
  - `roles/cloudbuild.builds.editor` - Build containers

### Workload Identity Federation

**Why Workload Identity?**
- No service account keys to manage
- Automatic credential rotation
- Fine-grained access control
- More secure than long-lived keys

**Configuration**:
- **Pool**: github-actions-pool
- **Provider**: github-actions-provider
- **Full Resource Name**:
  ```
  projects/988044283106/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider
  ```
- **Repository Access**: Limited to `Sharrp/stage` only

## Security Features

1. **No Secrets Required**: Uses Workload Identity Federation instead of service account keys
2. **Repository-Specific**: Only the `Sharrp/stage` repository can deploy
3. **Minimal Permissions**: Service account has only necessary roles
4. **Short-Lived Tokens**: GitHub OIDC tokens expire automatically
5. **Audit Trail**: All deployments logged in GCP Cloud Logging

## GitHub Actions Permissions

The workflow requires these permissions (already configured in workflow file):
```yaml
permissions:
  contents: read      # Read repository code
  id-token: write     # Generate OIDC token for authentication
```

## Setup Status

✅ **Completed**:
- Service account created
- IAM roles assigned
- Workload Identity Pool created
- Workload Identity Provider configured
- Service account binding configured
- GitHub Actions workflow created

✅ **No GitHub Secrets Required!**

All authentication is handled through Workload Identity Federation. No manual secret configuration needed in GitHub Settings.

## Testing the Pipeline

### Test Automatic Deployment
1. Make a change to the code
2. Commit and push to main:
   ```bash
   git add .
   git commit -m "Test CI/CD pipeline"
   git push origin main
   ```
3. Go to GitHub → Actions tab
4. Watch the workflow run

### Test Manual Deployment
1. Go to GitHub → Actions tab
2. Select "Deploy to Cloud Run" workflow
3. Click "Run workflow" button
4. Select branch (main)
5. Click green "Run workflow" button

## Monitoring Deployments

### GitHub Actions
- Navigate to: `https://github.com/Sharrp/stage/actions`
- View workflow runs, logs, and deployment status

### Google Cloud Console
- **Cloud Run**: https://console.cloud.google.com/run?project=robust-environs-409314
- **Cloud Build**: https://console.cloud.google.com/cloud-build/builds?project=robust-environs-409314
- **Logs**: https://console.cloud.google.com/logs?project=robust-environs-409314

## Deployment Process

When the workflow runs, it:
1. ✅ Checks out the latest code
2. ✅ Installs dependencies
3. ✅ Runs all tests (9 tests)
4. ✅ Runs ESLint
5. ✅ Authenticates with GCP (no keys!)
6. ✅ Builds Docker image from source
7. ✅ Pushes to Artifact Registry
8. ✅ Deploys to Cloud Run
9. ✅ Outputs the service URL

## Rollback

If you need to rollback a deployment:

```bash
# List revisions
gcloud run revisions list \
  --service=stage-app \
  --region=us-central1 \
  --project=robust-environs-409314

# Rollback to specific revision
gcloud run services update-traffic stage-app \
  --to-revisions=REVISION_NAME=100 \
  --region=us-central1 \
  --project=robust-environs-409314
```

## Troubleshooting

### Deployment Fails
1. Check GitHub Actions logs
2. Verify GCP permissions
3. Check Cloud Build logs in GCP Console

### Tests Fail
- Fix the failing tests locally first
- Tests must pass before deployment proceeds

### Authentication Issues
- Verify Workload Identity Provider is active
- Check service account has correct IAM roles
- Ensure repository matches the configured pattern

## Cost Considerations

- **Cloud Run**: Pay per request (free tier available)
- **Cloud Build**: Free tier: 120 build-minutes/day
- **Artifact Registry**: Free tier: 0.5 GB storage
- **GitHub Actions**: 2,000 minutes/month for free (public repos get unlimited)

## Next Steps

1. ✅ Push to main to trigger first deployment
2. ✅ Monitor the GitHub Actions workflow
3. ✅ Verify deployment in Cloud Run
4. ✅ Set up custom domain (optional)
5. ✅ Configure Cloud Run service settings (optional)
