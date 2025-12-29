# API Integration Setup Guide

## Environment Configuration

This project uses environment variables to configure the API base URL for different environments.

### Setting Up Environment Variables

1. **Create a `.env` file** in the root of the project (same level as `package.json`)

2. **Add the following variable:**

```env
# Development (default: http://localhost:8000/api)
VITE_API_BASE_URL=http://localhost:8000/api

# Production example
# VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Environment Files

- `.env` - Default environment variables (committed to git)
- `.env.local` - Local development overrides (gitignored)
- `.env.production` - Production environment variables (gitignored)

### How It Works

The API configuration is managed in `src/config/api.ts`:

- **Development**: Uses `VITE_API_BASE_URL` if set, otherwise defaults to `http://localhost:8000/api`
- **Production**: Uses `VITE_API_BASE_URL` if set, otherwise uses the current origin + `/api`

### Example Configurations

#### Local Development
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

#### Staging
```env
VITE_API_BASE_URL=https://staging-api.yourdomain.com/api
```

#### Production
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Important Notes

1. **Vite Environment Variables**: All environment variables must be prefixed with `VITE_` to be accessible in the frontend code.

2. **Restart Required**: After changing environment variables, you must restart the Vite dev server.

3. **Build Time**: Environment variables are embedded at build time, not runtime.

### Verifying Configuration

The API base URL is logged to the console in development mode. Check your browser console to verify the correct URL is being used.

