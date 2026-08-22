# =========================================================
# Stage 1 - Build Ionic / Angular frontend
# =========================================================
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ ./

RUN npm run build


# =========================================================
# Stage 2 - Build Spring Boot backend
# =========================================================
FROM eclipse-temurin:21-jdk-alpine AS backend-build

WORKDIR /app/backend

COPY backend/.mvn .mvn
COPY backend/mvnw .
COPY backend/pom.xml .

RUN chmod +x mvnw

RUN ./mvnw dependency:go-offline

COPY backend/src src

# Put Angular production files inside Spring Boot.
COPY --from=frontend-build \
    /app/frontend/www/ \
    src/main/resources/static/

RUN ./mvnw clean package -DskipTests


# =========================================================
# Stage 3 - Production runtime
# =========================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=backend-build \
    /app/backend/target/*.jar \
    app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]