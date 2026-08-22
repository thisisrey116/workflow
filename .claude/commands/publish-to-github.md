---
description: Security-scan, then push project to GitHub with a full README, repo About/tags, and GitHub Pages via Actions
argument-hint: [github-repo-url] (optional — will ask if omitted)
---

You are running the **publish-to-github** workflow for this project. Follow the phases in order. Do not skip the security scan or run it after the first push — it must gate everything else. Stop and report to the user (do not proceed) if any phase fails or finds something risky; do not silently work around a blocker.

Repo URL argument (may be empty): $ARGUMENTS

## Phase 0 — Preconditions

1. Check `git --version` and `gh --version` are available. If `gh` is missing, tell the user it's required for repo About/topics/Pages steps and pause.
2. Check `gh auth status`. If not authenticated, stop and ask the user to run `gh auth login` first.
3. Determine the target repo:
   - If `$ARGUMENTS` contains a GitHub URL, use it.
   - Otherwise ask the user to paste the GitHub repo link (per their workflow: they create the empty repo on GitHub first, then paste the link here).
   - Parse `owner/repo` out of the URL.
4. Run `git status`. If this directory is not yet a git repo, `git init`. If it already has commits/remotes, show the user what's there before changing anything — do not overwrite unrelated history.

## Phase 1 — Security scan (hard gate, runs BEFORE any commit/push)

Scan the **entire working tree** (not just staged files) for anything that must never leave the machine:

1. Secrets/credentials patterns — grep for things like:
   - `AKIA[0-9A-Z]{16}` (AWS access key), `-----BEGIN.*PRIVATE KEY-----`, `xox[baprs]-` (Slack tokens), `ghp_`/`gho_`/`github_pat_` (GitHub tokens), `sk-[A-Za-z0-9]{20,}` (API-key-shaped secrets), `mongodb(\+srv)?://.*:.*@`, `postgres(ql)?://.*:.*@`, generic `password\s*=`, `secret\s*=`, `api[_-]?key\s*=` assignments with real-looking values.
2. Sensitive filenames anywhere in the tree (tracked or not): `.env`, `.env.*` (except `.env.example`/`.env.sample`), `*.pem`, `*.key`, `id_rsa`, `id_ed25519`, `credentials.json`, `service-account*.json`, `*.pfx`, `*.p12`, `.npmrc` with tokens, `.pypirc`, `terraform.tfstate*`.
3. Confirm `.gitignore` exists and excludes: `.env*` (except examples), `node_modules/`, `dist/`, `build/`, `.venv/`, `__pycache__/`, `*.log`, `.DS_Store`, credential/key files above, local IDE folders. Create/extend `.gitignore` if missing pieces are found.
4. If the repo already has git history, also check what's already been committed (`git log --all --diff-filter=A --name-only` or similar) for any of the above — a `.gitignore` entry doesn't remove something already committed.
5. Report findings to the user as a clear list: **clean to proceed**, or **blockers found** (file + why). If there are blockers:
   - Do NOT commit or push.
   - Suggest fixes (remove file, rotate the exposed credential, add to `.gitignore`, use `git filter-repo`/`BFG` if it's already in history).
   - Wait for the user to resolve or explicitly confirm they want to proceed anyway before continuing.

## Phase 2 — Push code to GitHub

1. Add the remote if not already set: `git remote add origin <url>` (or `git remote set-url origin <url>` if it exists but differs).
2. Stage and review: `git add -A` then `git status` — scan the file list once more for anything unexpected (matches Phase 1 concerns) before committing.
3. Commit with a clear message describing the project state being published.
4. Push: `git push -u origin <default-branch>`.
5. Confirm with the user before this push if this is the first time content leaves the machine for this repo — state what's about to be pushed (file count, branch, remote URL) and proceed only on confirmation.

## Phase 3 — README

Inspect the project to figure out what it actually is (language/framework via `package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`, `Cargo.toml`, etc.) before writing anything — don't guess generically.

Create or edit `README.md` with:
- **Title** and a one-line description.
- **Tech badges** (shields.io) matching the real stack detected — language, framework, license, build/CI status if a workflow exists.
- **About** — what the project does and why, based on actual code, not filler.
- **Installation** — real setup steps derived from the actual dependency/build files (e.g. `npm install`, `pip install -r requirements.txt`).
- **Usage** — how to run it.
- **GitHub Pages** — a placeholder line/section (`🔗 Live demo: _(added after Pages deploy)_`) to be filled in during Phase 5.
- **Credits** — author attribution using the user's info (ask if unclear; do not guess a name).

Commit and push this file.

## Phase 4 — GitHub repo About + topics

Using `gh repo edit owner/repo`:
1. Set `--description` to a concise one-liner matching the README's About section.
2. Add relevant `--add-topic` tags (language, framework, project category — 5-10 sensible tags, not a wall of noise).

## Phase 5 — GitHub Pages via GitHub Actions

1. Determine what should be published: a static `index.html`/`docs/` folder as-is, or a build step (e.g. Vite/Next static export, Jekyll, mkdocs) if the project has one.
2. Create `.github/workflows/pages.yml` using the official `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages` actions, triggered on push to the default branch, with correct `permissions: pages: write / id-token: write`.
3. Commit and push the workflow.
4. Enable Pages with the "GitHub Actions" build source via `gh api -X POST repos/{owner}/{repo}/pages -f build_type=workflow` (or `gh api -X PUT` if Pages already exists but source needs changing).
5. Trigger/watch the workflow run (`gh run watch` or `gh run list --workflow=pages.yml`) and confirm it succeeds. If it fails, read the logs (`gh run view --log-failed`) and fix the workflow rather than leaving it broken.
6. Once live, get the Pages URL (`gh api repos/{owner}/{repo}/pages --jq .html_url`).

## Phase 6 — Wire the Pages link back in

1. Update `README.md`'s placeholder from Phase 3 with the real Pages URL.
2. `gh repo edit owner/repo --homepage <pages-url>` so it shows in the repo About sidebar.
3. Commit and push the README update.

## Final report

Summarize to the user: what was pushed, the security-scan outcome, the README/About/topics set, and the live Pages URL.
