# Proyecto Práctica 10 - Gestión de Usuarios y Productos con Node.js + Express + MySQL

Este proyecto forma parte del certificado Ironhack. Consiste en una aplicación web con autenticación de usuarios, gestión de sesiones, diferentes roles (Administrador y Editor) y un CRUD de productos conectado a MySQL.

## 🚀 Tecnologías usadas
- Node.js + Express (backend)
- EJS (motor de plantillas)
- express-session (sesiones)
- bcryptjs (hash de contraseñas)
- MySQL (base de datos)
- dotenv (variables de entorno)
- express-validator (validaciones de formularios)

## 🗂️ Estructura del proyecto
```
practica10_11_06_25/
│
├── database/
│   └── db.js              # Conexión a MySQL
├── middlewares/
│   └── validators.js      # Validaciones para registro
├── routes/
│   ├── auth.js            # Rutas de autenticación
│   └── productos.js       # Rutas CRUD de productos
├── views/
│   ├── partials/          # Reutilización de cabecera y pie
│   │   ├── _head.ejs
│   │   ├── _foot.ejs
│   │   └── header.ejs
│   ├── index.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── admin.ejs
│   ├── editor.ejs
│   └── productos.ejs
├── public/
│   └── styles.css         # Estilos brutalistas
├── .env                   # Variables (DB_HOST, DB_USER, DB_PASS, DB_NAME)
├── index.js               # Servidor principal
└── package.json
```

## 🎨 Vistas y Layouts
- Usamos partials (`_head.ejs` y `_foot.ejs`) para no repetir cabeceras y pies en cada vista.
- `header.ejs` detecta si el usuario está logueado y muestra botones dinámicos (login/logout, nombre, rol).
- Cada vista (`admin.ejs`, `editor.ejs`, `productos.ejs`) incluye estos partials.
- Así conseguimos un layout común sin repetir HTML en cada archivo.

## 👤 Roles
**Admin:**
- Puede ver y editar productos (CRUD completo).
- Accede a `/admin`.

**Editor:**
- Solo puede ver productos en modo lectura.
- Accede a `/editor`.

**Invitado:**
- Debe registrarse o iniciar sesión para ver `/productos`.

## 🛠️ Problemas encontrados y soluciones aplicadas
- **Error 404 en /productos**  
  Causa: middleware `requireLogin` y orden de rutas.  
  ✅ Solución: movimos `app.use('/productos', ...)` después de auth.

- **Duplicidad en index.js**  
  Causa: `authRoutes` y `productosRoutes` importados dos veces.  
  ✅ Solución: dejamos una importación y un solo `app.use()`.

- **Botón de login sin estilos**  
  Causa: `<button>` sin clase.  
  ✅ Solución: añadimos `class='btn'`.

- **Problema con /productos/ping**  
  Causa: orden incorrecto de rutas.  
  ✅ Solución: ruta temporal en `index.js` para depuración.

- **Variables undefined en vistas**  
  Causa: `errors`, `old`, `message` no pasaban siempre.  
  ✅ Solución: middleware global inicializando `res.locals`.

## ▶️ Cómo ejecutar el proyecto
1. Clona el repositorio:
   ```bash
   git clone <URL>
   cd practica10_11_06_25
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Configura `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=tu_contraseña
   DB_NAME=curso
   PORT=4000
   ```

4. Arranca MySQL y crea base de datos `curso` con tablas `usuarios` y `productos`.

5. Inicia el servidor:
   ```bash
   node index.js
   ```

6. Accede en navegador:
   - [http://localhost:4000/](http://localhost:4000/)
   - [http://localhost:4000/registro](http://localhost:4000/registro)
   - [http://localhost:4000/login](http://localhost:4000/login)
   - [http://localhost:4000/admin](http://localhost:4000/admin)
   - [http://localhost:4000/editor](http://localhost:4000/editor)
   - [http://localhost:4000/productos](http://localhost:4000/productos)

## 📌 Estado actual
✅ Autenticación y registro funcionando  
✅ Roles implementados (admin/editor)  
✅ CRUD de productos conectado a MySQL  
✅ Partials y layout en todas las vistas  
✅ Estilos brutalistas aplicados  

🚀 **Listo para entrega**

## ✨ Autor
Desarrollado por **Casandra Cava López** como práctica de Node.js en entorno servidor.

## 🎥 Enlace al video de la aplicación
👉 [Ver en YouTube](https://www.youtube.com/watch?v=jdmSbPzSYws)
