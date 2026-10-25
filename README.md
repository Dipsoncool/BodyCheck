# Body Check

Secure visual review and documentation system for healthcare and youth safeguarding environments.

## Features

- **Side-by-Side Visual Comparison**: High-contrast, synchronized comparison between reference baseline photos and new review images.
- **7-Stage Assistive Diff-Engine**: Validates resolution, color space, landmark alignment, designated region boundaries, localized visual appearance changes, candidate findings, and observational drafts.
- **Assistive Delta Focus Reticle**: Algorithmically highlights surface coordinates with toggleable focus reticles.
- **Assessed Confidence Scoring**: High, Moderate, and Baseline certainty metrics reflecting image clarity and visual alignment.
- **Human Confirmation & Attestation**: Explicit safeguarding staff confirmation workflow with required reviewer credentials, audit notes, and timestamp attestation.
- **Comprehensive Audit Trail**: Tamper-evident chronological history of all baseline registrations, comparison runs, draft updates, and human confirmations.
- **Audit-Ready History & Search**: Search and filter past records by Record ID, body region, candidate finding, confirmation status, or reviewer.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Hosting / Deployment**: Vercel

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploy to Vercel

The application is pre-configured for Vercel deployment via `vercel.json`:

1. Import this repository into Vercel.
2. The framework preset will automatically detect **Vite**.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Click **Deploy**.
