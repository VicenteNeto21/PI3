# Estágio 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Otimização de Cache: Copia o pom.xml primeiro para baixar as dependências
# Assim, se você mudar o código mas não mudar as dependências, o Docker pula essa parte
COPY pom.xml .
RUN mvn dependency:go-offline

# Agora copia o código fonte e compila
COPY src ./src
RUN mvn clean package -DskipTests

# Estágio 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Criamos um usuário não-root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copiamos apenas o necessário
COPY --from=build /app/target/*.jar app.jar

# Configurações de Memória para a JVM
ENV JAVA_OPTS="-Xms512m -Xmx512m"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --spring.profiles.active=prod"]