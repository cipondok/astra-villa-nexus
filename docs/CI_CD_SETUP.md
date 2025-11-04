# CI/CD Setup Guide

Complete guide for setting up and customizing the CI/CD pipeline.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Workflow Details](#workflow-details)
- [Customization](#customization)
- [Secrets Management](#secrets-management)
- [Deployment Options](#deployment-options)
- [Troubleshooting](#troubleshooting)

## Overview

The CI/CD pipeline uses GitHub Actions to automatically test and deploy your application. It includes:

- **Continuous Integration**: Automated testing on every PR and push
- **Continuous Deployment**: Automatic deployment to production on successful tests
- **Visual Regression**: Screenshot comparison to catch unintended UI changes
- **Security Scanning**: Daily dependency audits

## Quick Start

### 1. Connect to GitHub

In your Lovable project:
1. Click **GitHub** → **Connect to GitHub**
2. Authorize the Lovable GitHub App
3. Click **Create Repository**

The CI/CD workflows will be automatically enabled once you push to GitHub.

### 2. First Push

```bash
# If working locally, commit and push
git add .
git commit -m "Initial commit with CI/CD"
git push origin main
```

GitHub Actions will automatically:
- Run all tests
- Generate coverage reports
- Deploy to Lovable (if on main branch)

### 3. Verify Setup

1. Go to your GitHub repo → **Actions** tab
2. You should see workflows running
3. Click on a workflow to view detailed logs

## Workflow Details

### CI Workflow (Pull Requests)

**Trigger**: Pull requests to `main` or `develop`

**Jobs**:
1. **Unit Tests**
   - Runs Vitest tests
   - Generates coverage report
   - Uploads to Codecov (optional)
   - Duration: ~2-3 minutes

2. **E2E Tests** (parallel)
   - Tests on Chromium, Firefox, WebKit
   - Captures screenshots on failure
   - Saves trace files for debugging
   - Duration: ~5-8 minutes per browser

3. **Visual Regression**
   - Compares screenshots against baselines
   - Creates diff images for changes
   - Comments on PR if differences found
   - Duration: ~3-5 minutes

4. **Lint & Type Check**
   - TypeScript type checking
   - ESLint (if configured)
   - Duration: ~1-2 minutes

5. **Build Check**
   - Verifies production build succeeds
   - Reports build size
   - Duration: ~2-3 minutes

**Total Duration**: ~10-15 minutes (parallel execution)

### CD Workflow (Production Deployment)

**Trigger**: Push to `main` branch

**Jobs**:
1. **Tests** - Full test suite
2. **Build** - Production build
3. **Deploy** - Automatic deployment via Lovable
4. **Notify** - Status updates and notifications

**Duration**: ~15-20 minutes

### Visual Baseline Update

**Trigger**: Manual (GitHub Actions UI)

**Purpose**: Update screenshot baselines when UI changes are intentional

**Usage**:
1. Go to Actions → **Update Visual Baselines**
2. Click **Run workflow**
3. Select branch
4. Add commit message
5. Click **Run workflow**

### Scheduled Tests

**Trigger**: Daily at 2 AM UTC

**Purpose**: Catch issues that may not appear in regular development

**Includes**:
- Full test suite
- Tests on multiple Node versions (18, 20, 21)
- Security audit
- Dependency updates check

## Customization

### Adjust Test Coverage Threshold

Edit `.github/workflows/ci.yml`:

```yaml
- name: Run unit tests with threshold
  run: npm test -- --run --coverage.lines=80 --coverage.branches=80
```

### Change Deployment Branch

Edit `.github/workflows/cd.yml`:

```yaml
on:
  push:
    branches: [production]  # Change from 'main' to your branch
```

### Add Custom Build Steps

Edit `.github/workflows/cd.yml`:

```yaml
- name: Custom build step
  run: |
    npm run custom-build-script
    npm run generate-sitemap
```

### Modify Browser Matrix

Edit `.github/workflows/ci.yml`:

```yaml
strategy:
  matrix:
    browser: [chromium, firefox]  # Remove webkit if not needed
```

### Add Custom Hosting Provider

Edit `.github/workflows/cd.yml`:

```yaml
deploy-vercel:
  name: Deploy to Vercel
  runs-on: ubuntu-latest
  needs: [build]
  
  steps:
    - name: Deploy
      run: vercel deploy --prod
      env:
        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## Secrets Management

### Adding Secrets

1. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add name and value
4. Click **Add secret**

### Required Secrets (Optional)

#### For Codecov (Coverage Reporting)
```
CODECOV_TOKEN=your_codecov_token
```

#### For Vercel Deployment
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

#### For Netlify Deployment
```
NETLIFY_AUTH_TOKEN=your_auth_token
NETLIFY_SITE_ID=your_site_id
```

#### For AWS S3 Deployment
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your_bucket_name
CLOUDFRONT_DISTRIBUTION_ID=your_distribution_id
```

### Using Secrets in Workflows

```yaml
- name: Use secret
  run: echo "Deploying..."
  env:
    API_KEY: ${{ secrets.MY_API_KEY }}
```

## Deployment Options

### Lovable (Default)

Lovable automatically deploys when changes are pushed to main:
- Uses GitHub integration's two-way sync
- No additional configuration needed
- Deployment tracked in GitHub

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Get deployment token from Vercel dashboard
3. Add `VERCEL_TOKEN` secret to GitHub
4. Enable in `.github/workflows/cd.yml`:

```yaml
deploy-vercel:
  if: true  # Change from false to true
```

### Netlify

1. Get auth token from Netlify dashboard
2. Add `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` secrets
3. Enable in `.github/workflows/cd.yml`:

```yaml
deploy-netlify:
  if: true  # Change from false to true
```

### AWS S3 + CloudFront

1. Create S3 bucket and CloudFront distribution
2. Create IAM user with S3 and CloudFront permissions
3. Add AWS credentials as secrets
4. Enable in `.github/workflows/cd.yml`:

```yaml
deploy-aws:
  if: true  # Change from false to true
```

### Custom Hosting

Add your own deployment job:

```yaml
deploy-custom:
  name: Deploy to Custom Host
  runs-on: ubuntu-latest
  needs: [build]
  
  steps:
    - name: Download build
      uses: actions/download-artifact@v4
      with:
        name: production-build
        path: dist/
    
    - name: Deploy
      run: |
        # Your deployment commands here
        scp -r dist/* user@host:/var/www/html/
```

## Troubleshooting

### Tests Fail Locally but Pass in CI

**Cause**: Environment differences

**Solutions**:
- Run tests with `CI=true npm test`
- Check Node version matches CI (use nvm)
- Clear npm cache: `npm cache clean --force`

### Visual Regression Tests Always Fail

**Cause**: Baseline screenshots missing or outdated

**Solutions**:
1. Update baselines locally:
   ```bash
   bash scripts/update-screenshots.sh
   git add e2e/**/*-snapshots/
   git commit -m "Update visual baselines"
   git push
   ```

2. Or update via GitHub Actions:
   - Actions → Update Visual Baselines → Run workflow

### E2E Tests Timeout

**Cause**: Tests taking too long or hanging

**Solutions**:
- Increase timeout in `playwright.config.ts`:
  ```typescript
  timeout: 60 * 1000, // 60 seconds per test
  ```
- Check for infinite loops in test code
- Reduce number of tests running in parallel

### Build Fails with Memory Error

**Cause**: Not enough memory allocated

**Solutions**:
- Increase Node memory in workflow:
  ```yaml
  - name: Build
    run: NODE_OPTIONS="--max-old-space-size=4096" npm run build
  ```

### Deployment Not Triggered

**Cause**: Workflow conditions not met

**Solutions**:
- Check branch name matches workflow config
- Verify tests passed successfully
- Check workflow file syntax is valid
- Review GitHub Actions logs

### Codecov Upload Fails

**Cause**: Missing token or network issue

**Solutions**:
- Add `CODECOV_TOKEN` secret
- Use `continue-on-error: true` to make it optional:
  ```yaml
  - name: Upload coverage
    continue-on-error: true
  ```

### Secrets Not Available

**Cause**: Secret not properly configured or wrong context

**Solutions**:
- Verify secret exists in repo settings
- Check secret name matches exactly (case-sensitive)
- Ensure using correct syntax: `${{ secrets.SECRET_NAME }}`

## 🔄 Automated Dependency Management

### Dependabot Setup

This project includes comprehensive Dependabot configuration for automated dependency updates and security vulnerability scanning.

#### Configuration Overview

**File**: `.github/dependabot.yml`

**Key Features:**
- Weekly update schedule (Mondays at 9 AM UTC)
- Grouped PRs by dependency type
- Security vulnerability scanning
- Automatic versioning strategy
- Support for npm packages and GitHub Actions

#### Dependency Groups

Dependencies are automatically grouped into logical categories:

| Group | Packages | Purpose |
|-------|----------|---------|
| `react` | react, react-dom, @types/react | React core packages |
| `ui-components` | @radix-ui/* | UI component libraries |
| `testing` | @playwright/*, @testing-library/* | Testing frameworks |
| `build-tools` | vite, typescript, @vitejs/* | Build and compilation tools |
| `backend` | @supabase/*, @tanstack/react-query | Backend and data fetching |
| `styling` | tailwindcss, tailwind-* | Styling utilities |
| `forms` | react-hook-form, zod | Form handling |
| `ci-tools` | @lhci/cli, axe-core | CI/CD tools |
| `github-actions` | actions/* | GitHub Actions workflows |

#### Update Strategy

**Versioning Rules:**
- **Patch updates**: Auto-grouped, safe to merge
- **Minor updates**: Grouped by dependency type
- **Major updates**: Individual PRs for review
- **Security updates**: Highest priority, separate PRs

**PR Limits:**
- npm dependencies: 10 open PRs maximum
- GitHub Actions: 5 open PRs maximum

#### Customization

**Add Reviewers/Assignees:**
```yaml
reviewers:
  - "your-team-name"
assignees:
  - "maintainer-username"
```

**Ignore Specific Updates:**
```yaml
ignore:
  - dependency-name: "react"
    update-types: ["version-update:semver-major"]
  - dependency-name: "typescript"
    versions: ["5.0.0"]
```

**Add Custom Groups:**
```yaml
groups:
  custom-group:
    patterns:
      - "package-prefix-*"
      - "specific-package"
    update-types:
      - "minor"
      - "patch"
```

#### Security Scanning

Dependabot automatically:
1. Scans for known vulnerabilities in dependencies
2. Creates PRs for security updates (labeled `security`)
3. Prioritizes security updates over regular updates
4. Provides detailed vulnerability information in PR descriptions

**View Security Alerts:**
- Go to GitHub → Security → Dependabot alerts
- Filter by severity, package, or status
- Review and merge security update PRs

#### Workflow Integration

Dependabot PRs automatically trigger:
- ✅ Unit tests
- ✅ E2E tests
- ✅ Accessibility audits
- ✅ Visual regression tests
- ✅ Lighthouse performance checks
- ✅ Build validation

**Auto-merge Requirements:**
1. All CI checks must pass
2. No merge conflicts
3. Approved by required reviewers (if configured)

#### Manual Trigger

**Trigger updates manually:**
1. Go to GitHub → Insights → Dependency graph
2. Click "Dependabot" tab
3. Click "Check for updates" button
4. Review and merge created PRs

**Or via GitHub CLI:**
```bash
gh api repos/{owner}/{repo}/dependabot/updates \
  -X POST \
  -F package_ecosystem=npm
```

#### Best Practices

1. **Review Grouped PRs**: Check all packages in a group before merging
2. **Test Locally**: For major updates, test locally before merging
3. **Monitor Dashboard**: Use test dashboard to track update impact
4. **Stagger Merges**: Don't merge all PRs at once
5. **Read Changelogs**: Review breaking changes in major updates

#### Commit Message Format

Dependabot uses consistent commit message formatting:

- Production dependencies: `chore(deps): update package-name to v1.2.3`
- Dev dependencies: `chore(deps-dev): update package-name to v1.2.3`
- GitHub Actions: `chore(ci): update actions/checkout to v4`

## Best Practices

1. **Keep workflows fast**
   - Use caching for dependencies
   - Run tests in parallel when possible
   - Only run necessary tests on each trigger

2. **Test locally first**
   - Use `bash scripts/ci-local.sh` before pushing
   - Saves CI minutes and faster feedback

3. **Update baselines carefully**
   - Review visual changes before updating
   - Document why baselines changed
   - Consider separate PR for baseline updates

4. **Monitor workflow usage**
   - GitHub provides limited free minutes
   - Review Actions usage in Settings → Billing
   - Optimize long-running jobs

5. **Use branch protection**
   - Require status checks before merging
   - Require approval from reviewers
   - Settings → Branches → Add rule

6. **Keep secrets secure**
   - Never commit secrets to code
   - Rotate secrets regularly
   - Use least-privilege access

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI Guide](https://playwright.dev/docs/ci)
- [Lovable GitHub Integration](https://docs.lovable.dev/features/github)
- [Visual Regression Testing Best Practices](https://playwright.dev/docs/test-snapshots)

## Support

If you encounter issues:

1. Check workflow logs in GitHub Actions
2. Review this troubleshooting guide
3. Test locally with debug scripts
4. Open an issue with logs and error messages
