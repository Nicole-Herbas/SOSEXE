# SOS.exe — Plataforma de Coordinación de Emergencias y Ayuda Humanitaria

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-22.1.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**SOS.exe** es un sistema web colaborativo diseñado para optimizar la respuesta ciudadana e institucional ante desastres, emergencias y situaciones de vulnerabilidad en Bolivia. Centraliza la información georreferenciada de puntos de ayuda, gestión de centros de acopio y albergues, canalización de voluntariado, registro de donaciones y difusión de alertas comunitarias en tiempo real.

Proyecto desarrollado para la materia de **Taller de Sistemas de Información** en la **Universidad Católica Boliviana "San Pablo" (UCB)**.

---

## Tabla de contenidos

- [Módulos y características](#módulos-y-características)
- [Arquitectura y fuentes de configuración](#arquitectura-y-fuentes-de-configuración)
- [Requisitos previos](#requisitos-previos)
- [Preparar el repositorio](#preparar-el-repositorio)
- [Configurar la base de datos](#configurar-la-base-de-datos)
  - [Opción A: MySQL con Docker Compose](#opción-a-mysql-con-docker-compose)
  - [Opción B: MySQL instalado localmente](#opción-b-mysql-instalado-localmente)
- [Configurar y ejecutar el backend](#configurar-y-ejecutar-el-backend)
- [Configurar y ejecutar el frontend](#configurar-y-ejecutar-el-frontend)
- [Comprobar la ejecución conjunta](#comprobar-la-ejecución-conjunta)
- [Pruebas y compilación](#pruebas-y-compilación)
- [Problemas frecuentes](#problemas-frecuentes)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Contribuir al repositorio](#contribuir-al-repositorio)
- [Seguridad y configuración opcional](#seguridad-y-configuración-opcional)

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

## Arquitectura y fuentes de configuración

El frontend Angular se ejecuta en `localhost:4200`. Su servidor de desarrollo
reenvía `/api/...` al backend Spring Boot en `localhost:8080`, que consulta MySQL
en `localhost:3306`. Flyway crea y actualiza las tablas al iniciar el backend;
Hibernate valida que el esquema coincida con las entidades.

Las versiones y opciones del código son la fuente de referencia al actualizar esta guía:

| Archivo | Qué define |
| --- | --- |
| [sos-backend/pom.xml](sos-backend/pom.xml) | Spring Boot, dependencias Java y compilación para Java 17. |
| [Maven Wrapper](sos-backend/.mvn/wrapper/maven-wrapper.properties) | Maven 3.9.16; no es necesario instalar Maven globalmente. |
| [sos-frontend/package.json](sos-frontend/package.json) y [package-lock.json](sos-frontend/package-lock.json) | npm 11.12.1, scripts y versiones exactas de dependencias. |
| [application.properties](sos-backend/src/main/resources/application.properties) y [plantilla local](sos-backend/src/main/resources/application-local.properties.example) | Conexión, importación de configuración privada y Flyway. |
| [angular.json](sos-frontend/angular.json) y [proxy.conf.json](sos-frontend/proxy.conf.json) | Compilación, pruebas y proxy de desarrollo. |

## Requisitos previos

| Herramienta | Requisito |
| --- | --- |
| Git | Para clonar y crear ramas. |
| JDK | Java 17 o superior, con `java` y `javac` disponibles. El entorno comprobado usa Temurin 21. |
| Node.js | Según el lockfile: `^22.22.3`, `^24.15.0` o `>=26.0.0`. Node 20 no cumple los requisitos actuales de Angular. |
| npm | 11.12.1, declarado en `package.json`. |
| Base de datos | MySQL 8.4 para la ruta documentada; mediante Docker Compose o una instalación local. |
| Docker y Compose | Solo para la opción A, con el daemon accesible por tu usuario. |
| OpenSSL | Para generar secretos en los ejemplos Bash de esta guía. |

Comprueba las herramientas antes de continuar:

```bash
java -version
javac -version
node --version
npm --version
```

La instalación local se verificó con Java 21, Node 26.11.1, npm 11.12.1 y MySQL
8.4.11. Las otras versiones compatibles no se probaron en ese entorno.
Si usas un gestor como `mise`, selecciona un JDK instalado para el proyecto o la
terminal y repite `java -version`: la existencia del shim no garantiza un JDK activo.

Si tienes otra versión de npm, puedes ejecutar los comandos de esta guía con
`npx --yes npm@11.12.1`, por ejemplo `npx --yes npm@11.12.1 ci`, sin cambiar tu
instalación global. No necesitas Angular CLI global: `npm start`, `npm test` y
`npm run build` usan el CLI del proyecto.

## Preparar el repositorio

```bash
git clone https://github.com/Nicole-Herbas/SOSEXE.git
cd SOSEXE
```

Si trabajas desde un fork, clona la URL de tu fork. Los comandos siguientes parten
de la raíz `SOSEXE`, salvo cuando se indica entrar en un módulo.
Necesitarás conexión a Internet para la primera descarga de Maven, paquetes npm
y, si usas Docker, la imagen MySQL. Comprueba que los puertos `3306`, `8080` y
`4200` estén libres antes de arrancar los servicios.

## Configurar la base de datos

Elige una de las dos opciones. Usa una base exclusiva de desarrollo:
Flyway aplicará cambios de esquema y datos de demostración sobre ella.

### Opción A: MySQL con Docker Compose

Los comandos de creación de archivos usan Bash (Linux/macOS o Git Bash en Windows)
y OpenSSL. Comprueba primero:

```bash
docker version
docker compose version
openssl version
```

El archivo existente `sos-backend/compose.yaml` utiliza otra base, una imagen
`latest` y un puerto asignado dinámicamente. Además, el backend tiene
`spring.docker.compose.enabled=false`: iniciar Spring Boot no inicia MySQL.
Para usar `sos_db` en un puerto conocido, crea esta configuración privada desde
la raíz del repositorio.

Genera el archivo de credenciales **una sola vez**. Este bloque evita sobrescribir
un archivo existente y guarda los valores sin mostrarlos en la terminal:

```bash
(
  umask 077
  set -C
  mkdir -p .dev.local
  {
    printf 'MYSQL_DATABASE=sos_db\nMYSQL_USER=sos_dev\n'
    printf 'MYSQL_PASSWORD=%s\n' "$(openssl rand -hex 24)"
    printf 'MYSQL_ROOT_PASSWORD=%s\n' "$(openssl rand -hex 24)"
  } > .dev.local/mysql.env
)
```

Crea `.dev.local/compose.yaml` con este contenido:

```yaml
services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_DATABASE: ${MYSQL_DATABASE:?}
      MYSQL_USER: ${MYSQL_USER:?}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:?}
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:?}
    ports:
      - "127.0.0.1:3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test:
        - CMD-SHELL
        - >-
          MYSQL_PWD="$${MYSQL_PASSWORD}" mysql -h127.0.0.1
          -u"$${MYSQL_USER}" -D"$${MYSQL_DATABASE}" -e 'SELECT 1' >/dev/null
      interval: 5s
      timeout: 5s
      retries: 30
      start_period: 30s
volumes:
  mysql-data:
```

Arranca la base y espera a que pueda aceptar consultas:

```bash
docker compose --env-file .dev.local/mysql.env -f .dev.local/compose.yaml -p sosexe-dev up -d --wait --wait-timeout 180
docker compose --env-file .dev.local/mysql.env -f .dev.local/compose.yaml -p sosexe-dev ps
```

MySQL queda accesible solo desde esta máquina. El volumen `sosexe-dev_mysql-data`
conserva los datos al detener o recrear el contenedor. Mantén el archivo de
credenciales: cambiar sus valores después de inicializar el volumen no cambia
las contraseñas de MySQL.

Para detenerlo, después de detener el backend:

```bash
docker compose --env-file .dev.local/mysql.env -f .dev.local/compose.yaml -p sosexe-dev stop
```

Vuelve a usar `up -d --wait` para arrancarlo. No uses `down -v` como parte del
reinicio habitual: elimina el volumen y los datos de desarrollo.
La carpeta `.dev.local/` está excluida por la regla `*.local` del `.gitignore`.

### Opción B: MySQL instalado localmente

Inicia MySQL y entra con una cuenta que pueda crear bases y usuarios:

```bash
mysql -u root -p
```

En la sesión MySQL, reemplaza el marcador de contraseña antes de ejecutar:

```sql
CREATE DATABASE sos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'sos_dev'@'localhost' IDENTIFIED BY '<CONTRASEÑA_LOCAL_ALEATORIA>';
GRANT ALL PRIVILEGES ON sos_db.* TO 'sos_dev'@'localhost';
```

El backend necesita permisos para las migraciones, limitados a `sos_db`.
Si ya existe una base de desarrollo o un usuario apropiado, utiliza sus datos
en la configuración local; no recrees ni reemplaces una base existente.

## Configurar y ejecutar el backend

### Configuración privada

Con la **opción A**, desde la raíz, genera la configuración del backend utilizando
el archivo de credenciales creado antes. El bloque también evita sobrescribir
una configuración existente:

```bash
(
  umask 077
  set -C
  . .dev.local/mysql.env
  {
    printf 'DB_URL=jdbc:mysql://127.0.0.1:3306/sos_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true\n'
    printf 'DB_USERNAME=%s\nDB_PASSWORD=%s\n' "$MYSQL_USER" "$MYSQL_PASSWORD"
    printf 'JWT_SECRET=%s\n' "$(openssl rand -hex 32)"
    printf 'server.address=127.0.0.1\n'
    printf 'newsdata.apikey=${NEWSDATA_API_KEY:}\n'
  } > sos-backend/src/main/resources/application-local.properties
)
```

Con la **opción B**, entra en `sos-backend` y copia la plantilla, si todavía no
existe tu configuración local:

```bash
cd sos-backend
cp -n src/main/resources/application-local.properties.example src/main/resources/application-local.properties
chmod 600 src/main/resources/application-local.properties
```

En PowerShell, la copia equivalente es:

```powershell
cd sos-backend
if (-not (Test-Path src/main/resources/application-local.properties)) {
  Copy-Item src/main/resources/application-local.properties.example src/main/resources/application-local.properties
}
```

Edita el archivo privado para configurar estos valores:

```properties
DB_URL=jdbc:mysql://localhost:3306/sos_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=sos_dev
DB_PASSWORD=<CONTRASEÑA_DEL_USUARIO_MYSQL>
JWT_SECRET=<SECRETO_LOCAL_ALEATORIO_DE_AL_MENOS_32_BYTES>
server.address=127.0.0.1
newsdata.apikey=${NEWSDATA_API_KEY:}
```

Los marcadores deben sustituirse; no son credenciales válidas. Para generar un
secreto JWT sin imprimirlo, desde la raíz puedes guardarlo en un archivo privado
con `(umask 077; set -C; mkdir -p .dev.local; openssl rand -hex 32 > .dev.local/jwt-secret)`
y copiar su contenido al campo `JWT_SECRET` mediante tu editor.

`application.properties` importa `application-local.properties` automáticamente:
no necesitas activar un perfil `local`. El archivo privado ya está excluido de Git.
También puedes proporcionar `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` y `JWT_SECRET`
como variables de entorno. La plantilla `.env.example` no se carga automáticamente;
un archivo `.env` por sí solo no configura Spring Boot.

### Arranque

Con la base en ejecución, abre una terminal en `sos-backend` y ejecuta:

```bash
bash ./mvnw spring-boot:run
```

En PowerShell usa `.\mvnw.cmd spring-boot:run`. En Linux/macOS se usa `bash ./mvnw`
porque el wrapper del repositorio no tiene el permiso de ejecución en un clon nuevo;
esto evita necesitar un cambio de permisos versionado para arrancar.

El primer inicio descarga Maven y sus dependencias. Flyway ejecuta las migraciones
V1–V8 y V10 (no hay V9 en el árbol actual), incluyendo datos de demostración.
No es necesario ejecutar manualmente `db/seed_datos_prueba.sql` para este onboarding.
Mantén la terminal abierta; `Ctrl+C` detiene el servidor.

## Configurar y ejecutar el frontend

En otra terminal, desde la raíz:

```bash
cd sos-frontend
npm ci
npm start -- --host 127.0.0.1
```

`npm ci` instala las versiones del lockfile sin actualizarlo. Abre
[http://localhost:4200](http://localhost:4200) cuando termine la compilación.
El servidor observa los cambios del frontend; `Ctrl+C` lo detiene.

## Comprobar la ejecución conjunta

| Comprobación | URL | Resultado esperado |
| --- | --- | --- |
| Frontend | [localhost:4200](http://localhost:4200) | La aplicación carga. |
| Swagger | [localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) | Documentación interactiva de la API. |
| OpenAPI | [localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs) | Documento JSON con las rutas. |
| Base y backend | [localhost:8080/api/departamentos](http://localhost:8080/api/departamentos) | Respuesta JSON con `success: true` y los nueve departamentos. |
| Proxy | [localhost:4200/api/departamentos](http://localhost:4200/api/departamentos) | Los mismos datos consultados desde el frontend. |

El proxy está configurado en `angular.json` mediante `proxy.conf.json`; no necesitas
cambiar las URLs `/api/...` del código Angular. Si cambias el puerto del backend,
ajusta también el destino del proxy localmente. Las respuestas incluyen un
`timestamp` generado por petición, por lo que dos respuestas válidas no serán
idénticas byte a byte.

El listado `/api/mapa/puntos` permite comprobar los puntos de demostración.
`/api/voluntariados` puede devolver una lista vacía en una base recién creada.
El proxy se utiliza con `npm start`; los archivos de `dist/` necesitan que el
servidor de despliegue resuelva `/api` por separado.

## Pruebas y compilación

Mantén la base de desarrollo encendida para ejecutar la suite completa del backend:
`SosBackendApplicationTests` y `PuntoAyudaSecurityTest` cargan el contexto Spring
con datasource y Flyway. Los tests pueden aplicar migraciones sobre esa base.

Desde `sos-backend`:

```bash
bash ./mvnw test
bash ./mvnw package
```

En PowerShell usa `.\mvnw.cmd test` y `.\mvnw.cmd package`.
`package` vuelve a ejecutar las pruebas y genera el JAR en `target/`.

Desde `sos-frontend`:

```bash
npm test -- --watch=false
npm run build
```

`npm test` sin `--watch=false` mantiene las pruebas en modo observación.
Con **Node 26**, ejecuta las pruebas con esta opción para que jsdom proporcione
`localStorage` en lugar del almacenamiento nativo de Node:

```bash
NODE_OPTIONS=--no-experimental-webstorage npm test -- --watch=false
```

En PowerShell establece `$env:NODE_OPTIONS='--no-experimental-webstorage'` antes de
`npm test -- --watch=false`. No hace falta esta opción para el navegador.
Si ya tienes otras opciones de Node, conserva las que necesites al añadir esta.

En el onboarding se verificaron **129 pruebas de backend y 162 de frontend**,
además de la compilación del frontend y las consultas a través del proxy.
La compilación actual avisa sobre el tamaño del bundle, un estilo de componente
y el formato CommonJS de Leaflet; estas advertencias no impiden compilar.
La integración con noticias externas y el flujo manual de registro/login no se
validaron durante esa comprobación.

## Problemas frecuentes

| Síntoma | Qué revisar |
| --- | --- |
| `No version is set for shim: java` o `JAVA_HOME` incorrecto | Activa un JDK en tu gestor de versiones y comprueba `java -version` y `javac -version` en la misma terminal. |
| `Permission denied` al ejecutar `./mvnw` | Usa `bash ./mvnw ...` o `mvnw.cmd` en Windows. |
| Node no compatible con Angular | Compara `node --version` con los requisitos de la tabla; Node 20 no es suficiente. |
| `Communications link failure` o conexión rechazada a MySQL | Comprueba que MySQL esté listo, el puerto de `DB_URL` y `docker compose ... ps`. Spring Boot no inicia el Compose automáticamente. |
| `Access denied for user` | Comprueba el usuario y contraseña en los archivos privados. Un volumen inicializado conserva las credenciales originales. |
| Puerto ocupado | Detén tu instancia previa o configura otro puerto. No detengas servicios de otros proyectos; si cambias `8080`, actualiza el proxy. |
| Error de Flyway o validación del esquema | Revisa la primera causa del log y confirma que estás usando la base correcta. No borres el volumen ni edites migraciones ya aplicadas para ocultar el fallo. |
| Frontend carga, pero `/api` falla | Comprueba primero la API directa en `8080` y después el proxy en `4200`. Mantén ambos servidores abiertos. |
| Tests fallan con `localStorage` indefinido o `getItem` | En Node 26, usa el comando de pruebas con `--no-experimental-webstorage`. |
| Noticias externas vacías o no disponibles | Configura tu propia clave como se explica abajo; el resto del entorno puede funcionar sin esa integración. |

## Estructura del proyecto

```text
SOSEXE/
├── .env.example                         # Plantilla de variables; no se carga sola
├── README.md
├── sos-backend/
│   ├── src/main/java/bo/edu/sos/backend/
│   │   ├── config/                      # Seguridad y configuración web
│   │   ├── constants/
│   │   ├── controller/                  # Endpoints REST
│   │   ├── dto/
│   │   ├── entity/                      # Entidades JPA
│   │   ├── repository/
│   │   ├── security/                    # JWT
│   │   └── service/                     # Lógica de negocio
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── application-local.properties.example
│   │   └── db/migration/                # Flyway: V1–V8 y V10
│   ├── src/test/
│   ├── docs/                           # Contexto de tareas específicas
│   ├── compose.yaml                    # Compose existente; ver opción A
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
└── sos-frontend/
    ├── angular.json
    ├── proxy.conf.json
    ├── package.json / package-lock.json
    └── src/app/
        ├── features/
        └── shared/
```

Los archivos de `.dev.local/` y `application-local.properties` se generan en tu
máquina siguiendo esta guía; no vienen incluidos en el clon.

## Contribuir al repositorio

Crea una rama para la tarea desde la raíz, por ejemplo:

```bash
git switch -c docs/SOS-112-onboarding
```

Antes de preparar el PR, ejecuta las comprobaciones relevantes al cambio y revisa
`git diff`, `git diff --check` y `git status --short`. Añade explícitamente los
archivos de la tarea para evitar mezclar cambios locales o de otro issue.

El formato de commit del proyecto incluye el identificador de Jira:

```text
SOS-XX: tipo: descripción
```

Para una revisión de documentación, por ejemplo:
`SOS-112: docs: completar guía de desarrollo y onboarding`.
Describe en el PR el problema resuelto, los cambios y las comprobaciones realizadas.

## Seguridad y configuración opcional

- Guarda contraseñas y secretos solo en `application-local.properties` o variables
  de entorno. No incluyas credenciales personales o de producción en archivos versionados.
- El archivo local es un recurso Maven y puede quedar incluido en un JAR generado
  en tu máquina. Para distribuir artefactos, usa variables de entorno y comprueba
  que no contengan configuración privada.
- Usa una cuenta MySQL limitada a la base de desarrollo. Las opciones JDBC sin TLS
  de esta guía corresponden al servicio local.
- Si una credencial personal fue expuesta previamente, cámbiala en el servicio correspondiente.
- Para noticias externas, conserva `newsdata.apikey=${NEWSDATA_API_KEY:}` en el archivo
  local y proporciona una clave propia mediante `NEWSDATA_API_KEY` al iniciar el backend.
  Así la configuración local no utiliza el valor de respaldo del archivo base.
- `UPLOADS_DIR` permite cambiar la carpeta de documentos; por defecto es `uploads/`
  dentro del directorio de ejecución del backend y está excluida de Git.
- `PORT` cambia el puerto del backend, y `CORS_ALLOWED_ORIGINS` sus orígenes permitidos.
  El valor local predeterminado de CORS es `http://localhost:4200`; abre el frontend
  con esa dirección para mantenerlo alineado.
