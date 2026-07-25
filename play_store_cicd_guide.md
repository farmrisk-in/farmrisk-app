# Google Play Store CI/CD Setup Guide for Expo (Android Only)

Since you already have a Google Developer Account, GitHub, and Expo setup, this guide shows you how to automate your Android builds (`.aab` app bundles) and distribute them directly to the Google Play Store (e.g., Internal Testing or Production tracks).

---

## Step 1: Generate the Google Service Account Key (One-time Setup)

Google Play Store APIs require a Service Account token to upload builds programmatically.

1. **Google Cloud Console**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Select the project associated with your Google Play Developer Console (or create one).
   - Go to **APIs & Services > Library** and search for **Google Play Android Developer API**. Click **Enable**.
   - Go to **IAM & Admin > Service Accounts**.
   - Click **Create Service Account**. Name it (e.g., `expo-eas-publisher`) and click **Create and Continue**.
   - Grant it the role: **Service Account User** (or just click Continue if managing access directly from Google Play Console).
   - Click **Done**.

2. **Generate the JSON Key File**:
   - Find your newly created Service Account in the list, click the three dots under **Actions**, and select **Manage keys**.
   - Click **Add Key > Create new key**, select **JSON**, and click **Create**.
   - This downloads a `.json` file. **Keep this file secure! Do not commit it to your GitHub repository.**

3. **Link to Google Play Console**:
   - Go to the [Google Play Console](https://play.google.com/console/).
   - Navigate to **Users and permissions** (or **API access**).
   - You should see your service account listed there. Click **Manage Play Console permissions** or **Invite user**.
   - Grant the service account the following permissions:
     - **View app information and download bulk reports (read-only)**
     - **Release to testing tracks**
     - **Manage testing tracks**
     - **Release to production, exclude devices, and use app sign-in** (if you want it to publish to production)
   - Click **Invite User**.

---

## Step 2: Configure EAS Credentials (Recommended)

The easiest and most secure way to handle Play Store uploads is to upload your Service Account Key directly to Expo. EAS will store it securely and automatically use it during builds/submissions.

Run this command in your terminal:
```bash
eas credentials
```
1. Select **Android** and follow the prompts.
2. When asked, upload the Google Service Account Key `.json` file that you downloaded in Step 1.
3. EAS will now store this key under your project credentials.

---

## Step 3: First Manual Upload (Required by Google)

> [!IMPORTANT]
> Google Play Console requires the **very first build** (`.aab`) of a new app to be uploaded **manually** via the Play Console web UI to initialize the application and configure App Signing. You cannot automate the first-ever release.

1. Generate your production build locally or using EAS:
   ```bash
   eas build --platform android --profile production --local
   ```
   *(Note: Production builds generate an `.aab` file instead of an `.apk` file).*
2. Go to the [Google Play Console](https://play.google.com/console/), create your app, and set up an **Internal Testing** track.
3. Manually upload the `.aab` file you just built.
4. Once this first release is created, you can automate all subsequent builds and submissions!

---

## Step 4: Update Configuration Files

Below, we've updated `eas.json` to structure production releases and submission settings, and provided a GitHub Actions workflow to run the CI/CD pipeline automatically.

### 1. Updated `eas.json`
We define a submit profile for Google Play Store under `submit.production`.

```json
{
  "cli": {
    "version": ">= 21.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "track": "internal" 
      }
    }
  }
}
```
*Note: `"track": "internal"` submits your app to the Internal Testing track. You can change this to `"alpha"`, `"beta"`, or `"production"` once you are ready.*

### 2. GitHub Actions Workflow (`.github/workflows/play-store-release.yml`)
Create a workflow that triggers whenever you push a tag starting with `v*` (e.g., `v1.0.1`) to build and submit the app.
