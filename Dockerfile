# Usar una imagen base de Java
FROM openjdk:21-jdk

# Copiar el archivo .jar al contenedor
COPY deploy/movies-0.0.1-SNAPSHOT.jar /app/mi-app.jar

# Establecer el directorio de trabajo
WORKDIR /app

# Comando para ejecutar el archivo .jar
CMD ["java", "-jar", "mi-app.jar"]
