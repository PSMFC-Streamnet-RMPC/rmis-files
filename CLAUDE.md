# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a client-side web application for the RMIS (Regional Mark Information System) API. The architecture is a simple single-page application with vanilla JavaScript:

- **Static file structure**: No build process or package management - uses direct script includes
- **Authentication flow**: JWT tokens stored in localStorage, validated on page load
- **API integration**: RESTful calls to RMIS API using jQuery AJAX
- **File upload**: Uppy.js handles multi-file uploads with progress tracking
- **UI framework**: Bootstrap 4.1 for responsive design

## Key Files

- `index.html`: Single HTML file containing the entire UI structure
- `script.js`: Main application logic including auth, file operations, and Uppy integration
- `script_old.js`: Previous version kept for reference
- `styles.css`: Custom CSS overrides for Bootstrap
- `tools/`: Third-party libraries (no package manager used)

## API Configuration

The application connects to the RMIS API with configurable endpoints:
- Production: `https://phish.rmis.org`
- Development: `http://localhost:5001` (commented out in script.js)

## Development Notes

- No build system, linting, or test framework configured
- Files are served directly from filesystem
- jQuery is used instead of modern fetch API for API calls
- Bootstrap components are manually implemented without framework abstractions
- File uploads are restricted to PSC format CSV/TXT files with 250MB size limit

## Authentication Flow

1. User credentials sent to `/bauth` endpoint with `jwt=true` parameter
2. JWT token stored in localStorage under "RMIS" key
3. Token validated by calling `/files` endpoint on page load
4. Parsed JWT contains user email and API key for file operations