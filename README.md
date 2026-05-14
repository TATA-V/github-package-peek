# GitHub package.json Peek

<img src="public/icon128.png" alt="badge preview" width="90" height="90" />

> See live npm version badges directly inside GitHub's `package.json` view.

## What it does

When you open a `package.json` file on GitHub, the extension automatically fetches the latest version of each dependency from npm and injects a colored badge next to every version string — no clicking, no copy-pasting.

## Badge types

| Badge | Color | Meaning |
|---|---|---|
| `↑ 2.0.0 major` | Red | A breaking update is available |
| `↑ 1.2.0 minor` | Orange | New features are available |
| `↑ 1.0.1 patch` | Green | A bug-fix update is available |
| `✓ latest` | Green | Already up to date |


![badge preview](public/screenshot.png)  

