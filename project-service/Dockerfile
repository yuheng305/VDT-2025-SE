FROM node:20
WORKDIR /app
RUN apt-get update && apt-get install -y wait-for-it
COPY package*.json ./
RUN npm install --include=dev
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["sh", "-c", "wait-for-it rabbitmq:5672 -- wait-for-it dev-db:5432 -- npx prisma migrate dev && npm run start:dev"]