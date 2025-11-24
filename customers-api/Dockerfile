FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm tsx


COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]