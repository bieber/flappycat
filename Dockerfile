FROM node:10-alpine AS builder
WORKDIR /app
COPY . /app
RUN npm install
ENV NODE_ENV production
RUN npm run build

FROM nginx:1.15.6-alpine
LABEL maintainer="docker@biebersprojects.com"
EXPOSE 80
COPY --from=builder /app/build /usr/share/nginx/html
