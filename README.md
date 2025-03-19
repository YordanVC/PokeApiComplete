# Proyecto Eco- Servicio de Eccomerce

Este proyecto es un microservicio de gestión de e-commerce, desarrollado con Spring Boot. El servicio permite enviar correos electrónicos para notificaciones de carrito abandonado y nuevas órdenes utilizando plantillas HTML personalizables.


# Características
-   Gestión de productos (creación, actualización, eliminación)
-   Procesamiento de órdenes
-   Plantillas HTML personalizables con Thymeleaf
-   Configuración de colores y estilos
-   Soporte para múltiples entornos (desarrollo, QA, producción)

# Requisitos previos

-   Java 17 o superior
-   Maven 3.6 o superior
-   Base de datos PostgreSQL
-   IDE de desarrollo (recomendado: IntelliJ IDEA, Eclipse o VS Code)

# Configuración de Entornos

El proyecto utiliza perfiles de Spring para gestionar diferentes entornos de ejecución. Hay tres perfiles disponibles:

1.  **dev**: Configuración para desarrollo local
2.  **qa**: Configuración para entorno de pruebas
3.  **prod**: Configuración para producción


### Archivo base  `application.properties`
Este archivo contiene la configuración común para todos los entornos, incluyendo:

-   Nombre de la aplicación
-   Puerto del servidor
-   Configuración del servidor de correo
-   Configuración de Swagger
-   Paths para la lista blanca de seguridad

### Archivos específicos por entorno

#### `application-dev.properties`

Configuración específica para el entorno de desarrollo, incluyendo:

-   Conexión a bases de datos de desarrollo
-   Configuración de esquemas
-   Parámetros de JPA específicos para desarrollo

#### `application-qa.properties`
Configuración específica para el entorno de pruebas (QA), incluyendo:

-   Conexión a bases de datos de QA
-   Configuración de esquemas
-   Parámetros de JPA específicos para pruebas

#### `application-prod.properties`
Configuración específica para el entorno de producción, incluyendo:

-   Conexión a bases de datos de producción
-   Configuración de esquemas
-   Parámetros de JPA específicos para producción

## Cómo levantar el proyecto

Existen dos formas de ejecutar este proyecto: directamente con Java o utilizando Docker.

### Opción 1: Ejecutar con Java
