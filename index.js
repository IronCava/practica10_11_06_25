/*
Creo el servidor con Express.

Configuro las sesiones.

Defino el motor de plantillas (EJS).

Preparo los middlewares.

Creo las rutas básicas de inicio.
*/

// Importo las librerías necesarias
const express = require("express");
const session = require("express-session");
const path = require("path");
const bcrypt = require("bcryptjs");
const db = require("./database/db");

// ✅ Cargo las variables de entorno desde /env/.env como en el proyecto del profesor
const dotenv = require("dotenv");
require("dotenv").config(); // busca directamente el archivo en la raíz
console.log("🎯 Verificación .env → DB_USER:", process.env.DB_USER);

// Inicializo la aplicación
const app = express();

// Configuro el puerto (desde .env o 4000 por defecto)
const PORT = process.env.PORT || 4000;

// Middlewares para procesar formularios y JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configuración de sesiones
app.use(
  session({
    secret: "miclavesupersecreta", // Puedes mejorar esto en producción
    resave: false,
    saveUninitialized: false,
  })
);

// Importo las rutas de autenticación
const authRoutes = require("./routes/auth");
// Uso las rutas de autenticación
app.use("/", authRoutes);

// Carpeta de archivos estáticos (CSS, imágenes, etc.)
app.use("/resources", express.static(path.join(__dirname, "public")));

// Motor de plantillas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// Ruta principal
app.get("/", (req, res) => {
  res.render("index", {
    login: req.session.loggedin || false,
    name: req.session.name || "Invitado",
  });
});

// Ruta para mostrar el formulario de registro
app.get("/registro", (req, res) => {
  res.render("register");
});

// Ruta que procesa los datos del formulario de registro
app.post("/register", async (req, res) => {
  const user = req.body.user;
  const name = req.body.name;
  const rol = req.body.rol;
  const pass = req.body.pass;
  const apellidos = req.body.apellidos;

  let passwordHash = await bcrypt.hash(pass, 8);

  db.query(
    "INSERT INTO usuarios SET ?",
    { email: user,
    nombre: name,
    apellidos: apellidos,
    rol: rol,
    pass: passwordHash },
    (error, results) => {
      if (error) {
        console.log("❌ Error al registrar usuario:", error);
        res.send("Hubo un error al registrar el usuario");
      } else {
        res.render("register", {
          alert: true,
          alertTitle: "Registro exitoso",
          alertMessage: "¡El usuario ha sido registrado!",
          alertIcon: "success",
          showConfirmButton: false,
          timer: 2000,
          ruta: ""
        });
      }
    }
  );
});

// Ruta para mostrar el formulario de login
app.get("/login", (req, res) => {
  res.render("login", { message: null }); // añadimos la variable "message"
});


// Ruta para mostrar todos los usuarios (formato JSON)
app.get("/usuarios", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, results) => {
    if (err) {
      console.error("❌ Error al obtener los usuarios:", err);
      return res.status(500).send("Error al obtener los usuarios");
    }
    res.json(results);
  });
});

// Ruta solo para administradores
app.get("/admin", (req, res) => {
  if (req.session.loggedin && req.session.rol === "admin") {
    res.send(`<h1>Bienvenida, administradora ${req.session.name}</h1><a href="/logout">Cerrar sesión</a>`);
  } else {
    res.redirect("/login");
  }
});

// Ruta solo para editores
app.get("/editor", (req, res) => {
  if (req.session.loggedin && req.session.rol === "editor") {
    res.send(`<h1>Bienvenid@, editor@ ${req.session.name}</h1><a href="/logout">Cerrar sesión</a>`);
  } else {
    res.redirect("/login");
  }
});

// Arranco el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
