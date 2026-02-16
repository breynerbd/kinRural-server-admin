# BancoKinRural
🏦 KinRural API

API REST para la gestión bancaria de usuarios, cuentas, transacciones, roles y movimientos financieros.
Diseñada bajo arquitectura separada:

🔐 Server-Admin → Gestión completa del sistema
👤 Server-User → Operaciones del usuario autenticado
🗄 PostgreSQL → Base de datos relacional

🚀 Tecnologías Utilizadas
Node.js
Express 5
Sequelize ORM
PostgreSQL
JWT Authentication
bcrypt
express-validator
Helmet
Morgan

Base de datos:
PostgreSQL

Cliente recomendado para pruebas:
Postman

⚙️ Configuración del Proyecto
1️⃣ Instalación de PostgreSQL
Instala PostgreSQL en tu máquina local o usa un servidor remoto.

Crear la base de datos:
CREATE DATABASE kinrural;

2️⃣ Configuración del archivo .env
Cada servidor debe tener su propio archivo .env.

PORT=3005
DB_NAME=kinrural
DB_USER=tuUsuario
DB_PASSWORD=tuContraseña
DB_HOST=localhost
DB_PORT=5432

Variables
Variable	Descripción
DB_HOST	Dirección del servidor PostgreSQL
DB_PORT	Puerto (por defecto 5432)
DB_USER	Usuario de la base de datos
DB_PASSWORD	Contraseña
DB_NAME	Nombre de la base
PORT	Puerto donde corre la API
📦 Instalación de Dependencias
🔹 Server-Admin
npm install axios@^1.13.5 bcrypt@^6.0.0 cors@^2.8.6 dotenv@^17.3.1 \
express@^5.2.1 express-rate-limit@^8.2.1 express-validator@^7.3.1 \
helmet@^8.1.0 jsonwebtoken@^9.0.3 morgan@^1.10.1 nanoid@^5.1.6 \
pg@^8.18.0 pghstore@^2.3.4 sequelize@^6.37.7 uuid@^13.0.0

🔹 Server-User
npm install cors@^2.8.6 dotenv@^17.3.1 express@^5.2.1 \
helmet@^8.1.0 morgan@^1.10.1 pg@^8.18.0 \
pg-hstore@^2.3.4 sequelize@^6.37.7

npm install -D nodemon@^3.1.11

🔐 SERVER ADMIN API
Base URL:
http://localhost:3005/kinrural/v1

👤 Usuarios
Método	Endpoint	Descripción
GET	/users	Listar todos
GET	/users/{id}	Buscar por ID
POST	/users	Crear usuario
PUT	/users/{id}	Actualizar
DELETE	/users/{id}	Eliminar
Ejemplo creación:
{
  "nombre": "Breyner",
  "apellido": "Perez",
  "dpi": "235689470101",
  "correo": "brey@mail.com",
  "telefono": "12345678",
  "direccion": "Calle 1",
  "ingresos_mensuales": 5000,
  "role_id": 1
}

💳 Cuentas
Método	Endpoint
GET	/accounts
GET	/accounts/{id}
POST	/accounts
DELETE	/accounts/{id}
Ejemplo:
{
  "tipo": "MONETARIA",
  "saldo": 500.00,
  "user_id": 2
}

💸 Transacciones
Método	Endpoint
GET	/transactions
GET	/transactions/{id}
POST	/transactions
Ejemplo transferencia:
{
  "cuenta_origen_id": 1,
  "cuenta_destino_id": 2,
  "tipo": "TRANSFERENCIA",
  "monto": 150.00
}

📑 Movimientos
Se generan automáticamente después de realizar una transacción.
Registran el historial financiero por cuenta.

🛡 Roles
Método	Endpoint
GET	/roles
POST	/roles
DELETE	/roles/{id}

🔄 Reversiones
Se generan automáticamente cuando se realiza una operación de reversión.
Registran auditoría del sistema.

👤 SERVER USER API
Base URL:
http://localhost:3005/kinrural/v1/user

👤 Usuario autenticado
Método	Endpoint
GET	/users
PUT	/users/user
💳 Cuentas del usuario
GET /accounts

💸 Transacciones del usuario
POST /transactions

Ejemplo:

{
  "tipo": "DEPOSITO",
  "monto": 100.00,
  "cuenta_destino_id": 1
}

📑 Movimientos del usuario
GET /movements

🏗 Arquitectura
El sistema está dividido en dos servicios:

🔐 Server-Admin
Gestión total del sistema
CRUD completo
Control de roles

👤 Server-User
Operaciones del usuario autenticado
Seguridad basada en JWT
Acceso restringido por token

🔒 Seguridad
Autenticación JWT
Encriptación de contraseñas con bcrypt
Rate limiting
Validaciones con express-validator
Helmet para protección HTTP

📌 Estado del Proyecto

✅ API funcional
✅ Separación por roles
✅ Arquitectura escalable
🔄 En constante mejora
