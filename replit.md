# Behavioral Health Job Tracker

## Overview
An AI-powered job search tool that searches for open roles across behavioral health and mental health EHR companies using Claude's web search capabilities.

## Tech Stack
- **Backend:** Node.js + Express (server in `replit-job-tracker/`)
- **Frontend:** Vanilla JavaScript, HTML, CSS (`replit-job-tracker/public/index.html`)
- **AI:** Anthropic API (`claude-sonnet-4-20250514`) with `web_search_20250305` tool

## Architecture
- Single Express server serves static files and proxies Anthropic API calls
- The backend keeps the `ANTHROPIC_API_KEY` secure (never exposed to client)
- Frontend is a single-page app with no build step required

## Running the App
- Workflow: `Start application` — runs `cd replit-job-tracker && PORT=5000 node index.js`
- Serves on port 5000 (webview)

## Environment Variables
- `ANTHROPIC_API_KEY` — required for job search functionality

## Companies Tracked
Three groups: Original targets (Lyra, Headspace, Talkspace, etc.), Mental health platforms (Brightline, Charlie Health, etc.), and EHR/practice management (Osmind, Valant, Blueprint).

## Features
- Toggle companies on/off per search
- Add custom companies
- Keyword search with OR logic (comma-separated)
- Optional location filter
- Edit default company selections
- Results show job title, location, company badge, days-ago badge, and snippet
