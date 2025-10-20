# CI/CD Setup Guide

This project uses GitHub Actions for automated deployment to Firebase Hosting.

## Workflows

### 1. Deploy to Firebase Hosting (`deploy.yml`)
- **Trigger:** Push to `main` branch
- **Actions:**
  - Install dependencies
  - Run TypeScript type checking
  - Build the project
  - Deploy to Firebase Hosting (live channel)

### 2. PR Build Check (`pr-check.yml`)
- **Trigger:** Pull request to `main` branch
- **Actions:**
  - Install dependencies
  - Run TypeScript type checking
  - Build the project
  - Verify build output

## Setup Instructions

### Step 1: Generate Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `quote-swipe`
3. Navigate to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file securely

### Step 2: Add GitHub Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `FIREBASE_SERVICE_ACCOUNT`
5. Value: Paste the entire content of the JSON file from Step 1
6. Click **Add secret**

### Step 3: Enable GitHub Actions

1. Go to your repository's **Actions** tab
2. If prompted, click **I understand my workflows, go ahead and enable them**

## Automatic Deployment Flow

```
Developer pushes to main
         ↓
GitHub Actions triggered
         ↓
Install dependencies (npm ci)
         ↓
Type checking (tsc --noEmit)
         ↓
Build project (npm run build)
         ↓
Deploy to Firebase Hosting
         ↓
Live at https://quote-swipe.web.app
```

## Manual Deployment (Fallback)

If you need to deploy manually:

```bash
npm run build
firebase deploy --only hosting
```

## Troubleshooting

### Issue: Deployment fails with permission error

**Solution:** Verify that the `FIREBASE_SERVICE_ACCOUNT` secret is correctly set with the full JSON content.

### Issue: Type checking fails

**Solution:** Run `npx tsc --noEmit` locally to see the type errors and fix them before pushing.

### Issue: Build fails

**Solution:** Run `npm run build` locally to debug the issue.

## Security Notes

- Never commit the Firebase service account JSON file to the repository
- The service account key should only be stored in GitHub Secrets
- The `GITHUB_TOKEN` is automatically provided by GitHub Actions and doesn't need manual setup

## CI/CD Status Badge

Add this badge to your README.md to show CI/CD status:

```markdown
![Deploy Status](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Deploy%20to%20Firebase%20Hosting/badge.svg)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name.
