FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./

RUN chmod +x mvnw
RUN ./mvnw -DskipTests dependency:go-offline

COPY src src

RUN ./mvnw -DskipTests clean package


FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=build \
    /app/target/sos-backend-0.0.1-SNAPSHOT.jar \
    app.jar

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "app.jar"]