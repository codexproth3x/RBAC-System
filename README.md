# RBAC System

A zero-backend role-based access control (RBAC) playground that runs entirely in the browser. It lets you create users, roles, and permissions, link them together, and quickly evaluate whether a user can perform a given action. State is saved to `localStorage`, so you can refresh or reopen the page without losing your model.

## Features
- Manage permissions and roles, then attach permissions to roles.
- Add users and assign one or many roles to each user.
- Evaluate access with a one-click "Check access" form.
- Reset to a set of sensible defaults if you want to start over.
- Works offline and is deployable as static files to GitHub Pages.

## Getting started
1. Open `index.html` in any modern browser to start using the tool.
2. Add or remove permissions, roles, and users as needed.
3. Use the **Check access** panel to quickly confirm whether a user inherits a specific permission.

## Deploying to GitHub Pages
This repository includes a GitHub Actions workflow that publishes the static site to GitHub Pages. After pushing to the `main` (or `master`) branch:

1. Navigate to your repository's **Settings → Pages** and choose **Source: GitHub Actions**.
2. The `Deploy to GitHub Pages` workflow uploads the site as an artifact and deploys it automatically.
3. The Pages URL is reported in the workflow summary once deployment completes.

## Development notes
- Everything lives in `index.html`, `styles.css`, and `script.js`—no build step required.
- Data is persisted locally in the browser. Use **Reset to defaults** to clear and restore the seeded example users, roles, and permissions.
