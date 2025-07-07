# 🐾 Gatos por el Mundo

**Gatos por el Mundo** es una aplicación web moderna desarrollada con **Laravel 12** (backend) y **Vue 3** (frontend), que permite a los usuarios explorar contenido felino alrededor del mundo. 
Incorpora autenticación estándar y con Google OAuth, un mapa interactivo donde puedes descubrir la raza de gato asociada a cada país, y la posibilidad de guardar tus razas favoritas.

---

## 🚀 Requisitos del sistema

- PHP >= 8.2
- Composer
- Node.js y npm
- MySQL / MariaDB
- Laravel CLI (opcional)
- Git

---

## ⚙️ Instalación del proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/mawisevi/gatos-por-el-mundo.git
cd gatos-por-el-mundo
```

---

### 2. Backend - Laravel 12

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Configurar .env con tu base de datos y credenciales de Google:

APP_URL=http://localhost:8000

DB_DATABASE=nombre_de_tu_bd
DB_USERNAME=usuario_bd
DB_PASSWORD=contraseña_bd

VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com

Finalmente:
```bash
php artisan migrate
php artisan serve
```

---

### 3. Frontend – Vue 3 + Vite
```bash
npm install
npm run dev

```

---

### 4. Acceso a la aplicación
Frontend Vue: http://localhost:5173

API Laravel: http://localhost:8000
