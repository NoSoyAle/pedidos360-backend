# Backend Pedidos360 - Dockerfile genérico para microservicios
# Build: docker build --build-arg SERVICE=pedidos-service -t pedidos360/pedidos .
ARG SERVICE=pedidos-service

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
COPY common-sec common-sec
COPY clientes-service clientes-service
COPY productos-service productos-service
COPY pedidos-service pedidos-service
RUN mvn -q -pl clientes-service,productos-service,pedidos-service -am package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
ARG SERVICE=pedidos-service
COPY --from=build /build/${SERVICE}/target/${SERVICE}-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]