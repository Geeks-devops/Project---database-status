FROM node:alpine3.23

WORKDIR /app

ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_NAME=postgres
ENV DB_USER=postgres
ENV DB_PASSWORD=mobile_535
ENV PORT=3001

COPY backend/package.json backend/package-lock.json ./

RUN npm ci --omit=dev

COPY backend/. ./

COPY frontend/ /frontend

CMD ["npm", "start"]
