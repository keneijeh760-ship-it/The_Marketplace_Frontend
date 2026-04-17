# Dockerfile for Spring Boot Application

# Use Amazon Corretto 17 as base image (optimized for AWS)
FROM amazoncorretto:17-alpine

# Set working directory
WORKDIR /app

# Copy the JAR file
COPY target/hope-0.0.1-SNAPSHOT.jar app.jar

# Expose port 5000
EXPOSE 5000

# Set environment variables (will be overridden by Elastic Beanstalk)
ENV SERVER_PORT=5000
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]