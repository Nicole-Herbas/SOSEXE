# SOS.exe — Plataforma de Coordinación de Emergencias y Ayuda Humanitaria

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-22.1.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**SOS.exe** es un sistema web colaborativo diseñado para optimizar la respuesta ciudadana e institucional ante desastres, emergencias y situaciones de vulnerabilidad en Bolivia. Centraliza la información georreferenciada de puntos de ayuda, gestión de centros de acopio y albergues, canalización de voluntariado, registro de donaciones y difusión de alertas comunitarias en tiempo real.

Proyecto desarrollado para la materia de **Taller de Sistemas de Información** en la **Universidad Católica Boliviana "San Pablo" (UCB)**.

---

## Tabla de Contenidos

- [Módulos y Características](#-módulos-y-características)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Requisitos Previos](#-requisitos-previos)
- [Guía de Instalación y Ejecución Conjunta](#-guía-de-instalación-y-ejecución-conjunta)
  - [1. Configuración de la Base de Datos](#1-configuración-de-la-base-de-datos)
  - [2. Configuración y Ejecución del Backend (Spring Boot)](#2-configuración-y-ejecución-del-backend-spring-boot)
  - [3. Configuración y Ejecución del Frontend (Angular)](#3-configuración-y-ejecución-del-frontend-angular)
- [Funcionamiento del Proxy de Desarrollo](#-funcionamiento-del-proxy-de-desarrollo)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Pruebas Automatizadas](#-pruebas-automatizadas)
- [Políticas de Seguridad y Credenciales](#-políticas-de-seguridad-y-credenciales)

---

## Módulos y Características

| Módulo                            | Descripción                                                                                                                               |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **Mapa Interactivo**              | Visualización georreferenciada con **Leaflet** de centros de acopio, albergues, puntos de auxilio y zonas críticas en tiempo real.        |
| **Centros de Ayuda**              | Administración y verificación de centros de acopio y albergues con su respectiva capacidad, responsable y necesidades.                    |
| **Voluntariado y Postulaciones**  | Publicación de convocatorias de voluntariado, postulación de ciudadanos y gestión del estado de solicitudes.                              |
| **Donaciones**                    | Registro, categorización y trazabilidad de aportes materiales y monetarios para damnificados y centros.                                   |
| **Alertas y Noticias**            | Emisión de avisos urgentes y comunicados oficiales para mantener a la población y brigadas informadas.                                    |
| **Seguridad y Control de Acceso** | Autenticación basada en **JWT** (con _Access Token_ de corta duración y _Refresh Token_ rotativo) y control por roles (`ADMIN` y `USER`). |

---

## Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas en tu equipo:

1. **Java Development Kit (JDK)**: Versión **17** o superior.
2. **Node.js**: Versión **20.x** o superior y gestor de paquetes **npm** (v10+ o v11+).
3. **MySQL Server**: Versión **8.0** o superior (en ejecución local en el puerto `3306`).
4. **Git**: Para el control de versiones.

---

## Guía de Instalación y Ejecución Conjunta

Sigue estos pasos en orden para poner en marcha tanto el backend como el frontend de manera integrada.

### 1. Configuración y Ejecución del Backend (Spring Boot)

#### A. Navegar al directorio del backend

```bash
cd sos-backend
```

#### B. Configurar las credenciales locales

Copia el archivo de plantilla `application-local.properties.example` y renómbralo a `application-local.properties`:

- **En Windows (PowerShell):**
  ```powershell
  Copy-Item src/main/resources/application-local.properties.example src/main/resources/application-local.properties
  ```
- **En Linux / macOS:**
  ```bash
  cp src/main/resources/application-local.properties.example src/main/resources/application-local.properties
  ```

Abre `src/main/resources/application-local.properties` y coloca tu contraseña y usuario local de MySQL:

```properties
DB_URL=jdbc:mysql://localhost:3306/sos_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=tu_password_local_aqui
JWT_SECRET=sos-exe-desarrollo-local-secret-key-super-segura-2026-minimo-32-caracteres
```

> [!IMPORTANT]
> El archivo `application-local.properties` está explícitamente excluido en el `.gitignore`. Tus contraseñas locales nunca se subirán a GitHub.

#### C. Iniciar el servidor Spring Boot

- **En terminal:**
  ```bash
  ./mvnw spring-boot:run
  ```

El backend iniciará en el puerto **`8080`**. Puedes comprobar que está operativo visitando la documentación interactiva de Swagger:

- **Swagger UI**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **OpenAPI JSON**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

### 2. Configuración y Ejecución del Frontend (Angular)

En una **nueva terminal**, navega a la carpeta del frontend:

```bash
cd sos-frontend
```

#### A. Instalar dependencias

```bash
npm install
```

#### B. Iniciar el servidor de desarrollo

```bash
npm start
```

_(Este comando ejecuta internamente `ng serve`, el cual ya incluye la configuración del proxy de desarrollo)._

Una vez compilado, abre tu navegador web en:
**[http://localhost:4200](http://localhost:4200)**

---

## Funcionamiento del Proxy de Desarrollo

Para evitar problemas de **CORS** (_Cross-Origin Resource Sharing_) durante el desarrollo local, el frontend cuenta con el archivo `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

Cada vez que Angular realiza una petición a `/api/...` (por ejemplo, `/api/auth/login`, `/api/mapa/puntos`), el servidor de desarrollo de Angular en el puerto `4200` reenvía transparentemente la solicitud al backend en `http://localhost:8080`.

---

## Estructura del Proyecto

```text
ProyectoSos/
├── .env.example                                      # Plantilla de variables de entorno para contenedores/shell
├── .gitignore                                         # Reglas globales de exclusión Git
├── README.md                                          # Documentación principal del sistema
│
├── sos-backend/                                       # Módulo Backend (Spring Boot 4 / Java 17)
│   ├── src/main/java/bo/edu/sos/backend/
│   │   ├── config/                                    # Seguridad Web y Filtros JWT
│   │   ├── constants/                                 # Rutas y Roles del sistema
│   │   ├── controller/                                # Endpoints REST (Auth, Mapa, Donaciones, etc.)
│   │   ├── dto/                                       # Objetos de transferencia de datos
│   │   ├── entity/                                    # Entidades JPA (Usuario, Centro, etc.)
│   │   ├── repository/                                # Repositorios Spring Data JPA
│   │   ├── security/                                  # Filtros y generadores de tokens JWT
│   │   └── service/                                   # Lógica de negocio
│   ├── src/main/resources/
│   │   ├── application.properties                     # Configuración base del backend
│   │   ├── application-local.properties.example       # Plantilla de configuración privada local
│   │   └── db/migration/                              # Scripts de migración Flyway (V1, V2)
│   ├── pom.xml                                        # Dependencias Maven
│   └── mvnw / mvnw.cmd                                # Wrapper de Maven
│
└── sos-frontend/                                      # Módulo Frontend (Angular 22 / TypeScript)
    ├── proxy.conf.json                                # Configuración de reenvío de API al backend
    ├── package.json                                   # Dependencias npm y scripts de ejecución
    └── src/app/
        ├── features/                                  # Módulos funcionales (mapa, auth, centros, donar, etc.)
        └── shared/                                    # Modelos, guardias, navbar y componentes comunes
```

---

## Pruebas Automatizadas

### Backend

Para ejecutar la suite de pruebas unitarias y de integración del backend:

```bash
cd sos-backend
./mvnw test        # En terminal
```

### Frontend

Para ejecutar las pruebas unitarias del frontend con **Vitest**:

```bash
cd sos-frontend
npm test
```

---

## Políticas de Seguridad y Credenciales

- **No exponer contraseñas en Git**: Ningún desarrollador debe realizar commits de archivos `application.properties` con credenciales de producción o personales.
- **Uso de `application-local.properties`**: Utiliza siempre el archivo local o variables de entorno del sistema (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`) para tus pruebas locales.
- **Rotación de Credenciales**: Si alguna credencial personal fue expuesta con anterioridad, cámbiala inmediatamente en tu servidor local de base de datos.
- **Formato de Commits**: Todo commit debe seguir el formato estándar del proyecto con su identificador de tarea:
  `git commit -m "SOS-XX: tipo: descripción"`
