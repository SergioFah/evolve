# Build: compile the PWA into static files
FROM node:24-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Optional cloud sync. Vite bakes these into the bundle at build time,
# so in Dokploy set them as Build Args (not runtime env). Empty = local-only mode.
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_KEY=""
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_KEY=$VITE_SUPABASE_KEY

COPY . .
RUN npm run build

# Serve: plain nginx with the static build
FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
