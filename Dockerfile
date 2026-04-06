FROM node:20

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
RUN pnpm install

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["pnpm", "dev"]