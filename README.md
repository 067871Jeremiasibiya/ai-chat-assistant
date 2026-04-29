# Job Search Copilot

A React and TypeScript dashboard plus a small Node CLI for starting a junior frontend/backend developer job search.

## What it does

- Builds a starter resume from your name, links, skills, and projects.
- Tracks a focused list of junior frontend, backend, and full stack roles.
- Generates a tailored application pitch for the selected job.
- Saves web dashboard profile and job changes in browser storage.
- Adds real job leads from the dashboard without editing code.
- Provides local CLI commands for resume generation and application tracking.

## Tech stack

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Node.js CLI scripts

## Getting started

Install dependencies:

```bash
npm ci
```

Start the web dashboard:

```bash
npm run dev
```

Open http://localhost:3001 in your browser.

The dashboard stores profile edits, job status changes, and added job leads in browser `localStorage`.

## CLI workflow

Create a resume starter and print the job plan:

```bash
npm run job:init
```

Add an application lead:

```bash
npm run job:add -- "Company" "Junior Frontend Developer" "Source or notes"
```

List tracked applications:

```bash
npm run job:list
```

Print the focused junior developer application plan:

```bash
npm run job:plan
```

CLI data is written to `job-copilot-data/applications.json`, and the generated starter resume is written to `junior-dev-resume-starter.md`.

## Build

```bash
npm run build
```
