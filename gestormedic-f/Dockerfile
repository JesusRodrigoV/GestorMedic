FROM node:20-slim
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund --loglevel=verbose

# Copy source
COPY . .

EXPOSE 4200

# Start dev server (expose on 0.0.0.0 for container)
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]