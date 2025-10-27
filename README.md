# Pokémon Creator App

A modern, mobile-first web application for creating custom Pokémon using AI image generation. Built with TypeScript, Tailwind CSS v4, and Google OAuth authentication.

## Features

- **AI-Powered Generation**: Create unique Pokémon images using Stable Diffusion
- **Google OAuth**: Secure authentication with JWT tokens (24-hour expiration)
- **Internationalization**: Full support for English and Spanish with auto-detection
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Mobile-First Design**: Responsive layout optimized for all devices
- **Pokéball Landing Page**: Eye-catching design with red, black, and white theme

## Tech Stack

### Frontend
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework
- **i18next** - Internationalization library with browser language detection

### Backend
- **Express** - Node.js web framework
- **Passport.js** - Google OAuth 2.0 authentication
- **JWT** - Secure token-based authentication
- **TypeScript** - Type-safe backend

### DevOps
- **Docker & Docker Compose** - Containerized deployment
- **Nginx** - Frontend static file serving

## Prerequisites

- Node.js 22+
- Docker & Docker Compose
- Google OAuth credentials ([Get them here](https://console.cloud.google.com/))

## Quick Start

### 1. Clone the repository
```bash
git clone <repo-url>
cd pokeApi
```

### 2. Set up environment variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required variables:**
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret
- `JWT_SECRET` - Generate locally

### 3. Start with Docker
```bash
# Build and start containers
docker compose up -d

# Check logs
docker compose logs -f
```

### 4. Access the app
- **Frontend**: http://host:port
- **Backend API**: http://host:port/api

## Development

### Run locally without Docker

**Frontend:**
```bash
npm install
npm run dev
```

**Backend:**
```bash
cd backend
npm install
npm run dev
```

### Environment Files

- `.env` - Main secrets file (gitignored)
- `.env.development` - Frontend dev environment (safe to commit)
- `.env.production` - Frontend build environment (safe to commit)
- `.env.example` - Template for new developers (safe to commit)

## Language Support

The app automatically detects your browser language and supports:
- English (default)
- Spanish

Use the language switcher (EN/ES buttons) in the top-left corner to change languages manually.

## Security Features

- JWT tokens with 24-hour expiration
- HttpOnly cookies for token storage
- CORS protection with configured origins
- Environment variable validation
- Secure Google OAuth flow

## Project Structure

```
pokeApi/
├── src/
│   ├── main.ts              # Landing page & auth check
│   ├── pokemon-creator.ts   # Main app component
│   ├── style.css            # Tailwind CSS & custom styles
│   ├── i18n.ts              # i18next configuration
│   ├── locales/             # Translation files
│   │   ├── en/
│   │   └── es/
│   └── utils/
│       └── language.ts      # Language switching utility
├── backend/
│   ├── index.ts             # Express API & OAuth
│   ├── Dockerfile           # Backend container
│   └── package.json
├── .env                     # Secrets (gitignored)
├── .env.development         # Frontend dev config
├── .env.production          # Frontend build config
├── Dockerfile               # Frontend container
├── docker-compose.yml       # Multi-container setup
└── package.json             # Frontend dependencies
```

## Docker Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Rebuild after code changes
docker compose build

# View logs
docker compose logs -f

# Restart a specific service
docker compose restart frontend
docker compose restart backend
```

## License

This project is for educational purposes.

## Contributing

Feel free to open issues or submit pull requests!

## Important Notes

- Never commit the `.env` file - it contains secrets
- Regenerate JWT_SECRET if exposed
- Update Google OAuth redirect URIs in Google Console if deploying to production
- The Stable Diffusion API URL is hardcoded - update if needed

## TODO

- [ ] Add share button for generated Pokémon
- [ ] Support multiple image generation per Pokémon
- [ ] Add user galleries/profiles
- [ ] Export Pokémon data as JSON
