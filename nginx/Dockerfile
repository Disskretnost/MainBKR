
FROM node:16-alpine AS build
WORKDIR /app
COPY client/package.json client/package-lock.json ./
RUN npm install
COPY client /app
RUN npm run build


FROM nginx:latest
COPY --from=build /app/build /var/www/static

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
