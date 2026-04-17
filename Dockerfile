# Multi-stage build: compile with Maven, run with Corretto 17.

FROM maven:3.9-amazoncorretto-17 AS build
WORKDIR /app

COPY pom.xml ./
RUN mvn -B -q -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests package

FROM amazoncorretto:17-alpine
WORKDIR /app
COPY --from=build /app/target/hope-0.0.1-SNAPSHOT.jar app.jar

# Render injects PORT at runtime. Fall back to 5000 for local use.
ENV PORT=5000
EXPOSE 5000

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
