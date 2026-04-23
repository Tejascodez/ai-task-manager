FROM openjdk:17-jdk-slim

WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

EXPOSE 8080

CMD ["sh", "-c", "java -jar target/*.jar"]cd backend
mvn -N io.takari:maven:wrapper
git add .
git commit -m "add maven wrapper"
git push