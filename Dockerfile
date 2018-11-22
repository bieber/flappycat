FROM node:8-alpine AS builder
ENV NODE_ENV production
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build

FROM nginx:1.15.6-alpine
LABEL maintainer="docker@biebersprojects.com"
EXPOSE 80
COPY --from=builder /app/build /usr/share/nginx/html
