# 🏦 KinRural API Documentation

![Build Status](https://img.shields.io/badge/build-v1.0.0-brightgreen)
![Node](https://img.shields.io/badge/node-v16+-green)
![Express](https://img.shields.io/badge/express-v5.2.1-blue)
![Sequelize](https://img.shields.io/badge/sequelize-v6.37.7-blue)
![PostgreSQL](https://img.shields.io/badge/postgresql-v8.18.0-blue)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![License](https://img.shields.io/badge/license-MIT-yellow)

> Sistema bancario rural de panel administrativo, desplegado con Docker.

---

## 📋 Tabla de Contenidos

- [Instalación y Configuración](#-instalación-y-configuración)
- [Panel Administrativo (Admin API)](#️-panel-administrativo-admin-api)
  - [Usuarios](#-usuarios)
  - [Cuentas](#-cuentas)
  - [Solicitudes de Cuenta](#-solicitudes-de-cuenta)
  - [Préstamos](#-préstamos)
  - [Tarjetas](#-tarjetas)
  - [Transacciones](#-transacciones)
- [Reglas de Negocio](#️-reglas-de-negocio)

---

## Configuración

Antes de ejecutar el proyecto, completa los siguientes valores:

## `kinRural-server-admin/.env`

- **EXCHANGE_API_KEY**
- **JWT_SECRET**

---

## 🛠️ Panel Administrativo (Admin API)

**Base URL:**

```
http://localhost:3005/kinrural/v1
```

---

### 👥 Usuarios

| Método   | Endpoint     | Descripción        | Auth  | Body                                                                                                  |
| -------- | ------------ | ------------------ | ----- | ----------------------------------------------------------------------------------------------------- |
| `POST`   | `/users`     | Crear usuario      | Admin | `{ "nombre", "apellido", "dpi", "correo", "telefono", "direccion", "ingresos_mensuales", "role_id" }` |
| `GET`    | `/users`     | Listar usuarios    | Admin | —                                                                                                     |
| `GET`    | `/users/:id` | Usuario por ID     | Admin | —                                                                                                     |
| `PUT`    | `/users/:id` | Actualizar usuario | Admin | `{ "nombre", "correo" }` _(campos opcionales)_                                                        |
| `DELETE` | `/users/:id` | Eliminar usuario   | Admin | —                                                                                                     |

**Ejemplo — Crear usuario (`POST /users`):**

```json
{
  "nombre": "Kenneth",
  "apellido": "Mazariegos",
  "dpi": "9485760101",
  "correo": "km@gmail.com",
  "telefono": "98764532",
  "direccion": "Zona 5",
  "ingresos_mensuales": 8000,
  "role": "ADMIN"
}
```

**Ejemplo — Actualizar usuario (`PUT /users/:id`):**

```json
{
  "nombre": "Andy",
  "correo": "am@gmail.com"
}
```

---

### 💰 Cuentas

| Método   | Endpoint        | Descripción     | Auth  | Body                             |
| -------- | --------------- | --------------- | ----- | -------------------------------- |
| `POST`   | `/accounts`     | Crear cuenta    | Admin | `{ "tipo", "saldo", "user_id" }` |
| `GET`    | `/accounts`     | Listar cuentas  | Admin | —                                |
| `GET`    | `/accounts/:id` | Cuenta por ID   | Admin | —                                |
| `DELETE` | `/accounts/:id` | Eliminar cuenta | Admin | —                                |

**Ejemplo — Crear cuenta (`POST /accounts`):**

```json
{
  "tipo": "AHORRO",
  "saldo": 1500,
  "user_id": 1
}
```

> 💡 El campo `tipo` acepta los valores: `AHORRO` o `MONETARIA`.

---

### 📩 Solicitudes de Cuenta

| Método  | Endpoint                        | Descripción        | Auth  | Body |
| ------- | ------------------------------- | ------------------ | ----- | ---- |
| `GET`   | `/account-requests`             | Listar solicitudes | Admin | —    |
| `PATCH` | `/account-requests/:id/approve` | Aprobar solicitud  | Admin | —    |
| `PATCH` | `/account-requests/:id/reject`  | Rechazar solicitud | Admin | —    |

---

### 📝 Préstamos

| Método | Endpoint             | Descripción       | Auth  | Body |
| ------ | -------------------- | ----------------- | ----- | ---- |
| `GET`  | `/loans`             | Listar préstamos  | Admin | —    |
| `GET`  | `/loans/:id`         | Préstamo por ID   | Admin | —    |
| `PUT`  | `/loans/approve/:id` | Aprobar préstamo  | Admin | —    |
| `PUT`  | `/loans/reject/:id`  | Rechazar préstamo | Admin | —    |
| `PUT`  | `/loans/pay/:id`     | Pagar cuota       | Admin | —    |
| `POST` | `/loans/check-mora`  | Revisar mora      | Admin | —    |

---

### 💳 Tarjetas

| Método | Endpoint              | Descripción              | Auth  | Body           |
| ------ | --------------------- | ------------------------ | ----- | -------------- |
| `GET`  | `/cards`              | Listar tarjetas          | Admin | —              |
| `GET`  | `/cards/:id`          | Tarjetas por cuenta      | Admin | —              |
| `POST` | `/cards/:id`          | Aprobar/Rechazar tarjeta | Admin | `{ "accion" }` |
| `POST` | `/cards/:id/activate` | Activar tarjeta          | Admin | —              |
| `POST` | `/cards/:id/block`    | Bloquear tarjeta         | Admin | `{ "accion" }` |

**Ejemplo — Aprobar tarjeta (`POST /cards/:id`):**

```json
{
  "accion": "APROBADA"
}
```

**Ejemplo — Rechazar tarjeta (`POST /cards/:id`):**

```json
{
  "accion": "RECHAZADA"
}
```

**Ejemplo — Bloquear tarjeta (`POST /cards/:id/block`):**

```json
{
  "accion": "BLOQUEADA"
}
```

> 💡 El campo `accion` acepta: `APROBADA`, `RECHAZADA` o `BLOQUEADA`.

---

### 💸 Transacciones

| Método | Endpoint            | Descripción              | Auth  | Body                                                   |
| ------ | ------------------- | ------------------------ | ----- | ------------------------------------------------------ |
| `GET`  | `/transactions`     | Historial global         | Admin | —                                                      |
| `POST` | `/transactions`     | Transferencia admin      | Admin | `{ "cuenta_origen_id", "cuenta_destino_id", "monto" }` |
| `GET`  | `/transactions/:id` | Transacciones por cuenta | Admin | —                                                      |

**Ejemplo — Transferencia (`POST /transactions`):**

```json
{
  "cuenta_origen_id": 1,
  "cuenta_destino_id": 2,
  "monto": 100.0
}
```

---

## ⚙️ Reglas de Negocio

| Regla                    | Detalle                                                    |
| ------------------------ | ---------------------------------------------------------- |
| 📈 **Interés anual**     | 5% sobre cuentas de ahorro                                 |
| ⚠️ **Mora**              | Después de 30 días → estado `EN_MORA` + 3% de recargo      |
| 🏦 **Límite de cuentas** | Máx. **2 cuentas de ahorro** y **1 monetaria** por usuario |
| 💸 **Transferencias**    | Límite de **Q10,000 diarios**                              |

> ⚠️ **Importante:** El estado `EN_MORA` se activa automáticamente. Ejecute `POST /loans/check-mora` periódicamente para mantener los estados actualizados.

---

Documentación generada para el proyecto **KinRural** — Sistema Bancario Rural
