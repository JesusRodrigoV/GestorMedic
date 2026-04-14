FROM oven/bun:1.2-slim 
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . . 
EXPOSE 4200
CMD ["bun", "run", "start", "--host", "0.0.0.0"]