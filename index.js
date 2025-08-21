/*
Creo el servidor con Express.
Configuro las sesiones.
Defino el motor de plantillas (EJS).
Preparo los middlewares.
Creo las rutas básicas de inicio.
*/

// ─────────────────────────────────────────────
// 1) IMPORTS
// ─────────────────────────────────────────────
const express = require("express");                  // Framework web
const session = require("express-session");          // Sesiones
const path = require("path");                        // Utilidades de rutas
const bcrypt = require("bcryptjs");                  // Hash de contraseñas
const db = require("./database/db");                 // Conexión MySQL
const { validateRegister } = require("./middlewares/validators"); // Validaciones de registro

// Variables de entorno (.env)
require("dotenv").config();
console.log("🎯 Verificación .env → DB_USER:", process.env.DB_USER);

// ─────────────────────────────────────────────
// 2) APP Y PUERTO
// ─────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 4000;

// ─────────────────────────────────────────────
// 3) MIDDLEWARES BÁSICOS
// ─────────────────────────────────────────────
app.use(express.urlencoded({ extended: false }));    // Parseo de formularios
app.use(express.json());                             // Parseo JSON

// Defaults para vistas (evita ReferenceError en EJS)
app.use((req, res, next) => {
  res.locals.errors = null;                          
  res.locals.old = null;                             
  res.locals.message = null;                         
  next();
});

// Archivos estáticos (CSS, imágenes, JS del front)
app.use("/resources", express.static(path.join(__dirname, "public")));

// ─────────────────────────────────────────────
// 4) SESIONES
// ─────────────────────────────────────────────
app.use(
  session({
    secret: "miclavesupersecreta",   // ⚠️ Cambiar en producción
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware global para exponer sesión en TODAS las vistas
app.use((req, res, next) => {
  res.locals.login = !!req.session.loggedin;
  res.locals.name  = req.session.name || "Invitado";
  res.locals.rol   = req.session.rol || null;
  next();
});

// Middleware para proteger rutas
const requireLogin = (req, res, next) => {
  if (!req.session.loggedin) return res.redirect("/login");
  next();
};

// Solo Admin
const requireAdmin = (req, res, next) => {
  if (!req.session.loggedin) return res.redirect("/login");    // sin sesión → login
  if (req.session.rol !== "admin") return res.status(403).send("Prohibido");
  next();
};

// ─────────────────────────────────────────────
// 5) MOTOR DE VISTAS
// ─────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ─────────────────────────────────────────────
// 6) RUTAS EXTERNAS
// ─────────────────────────────────────────────
const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

const productosRoutes = require("./routes/productos");
app.use("/productos", requireLogin, productosRoutes);
console.log("🔧 Router /productos montado");

// ─────────────────────────────────────────────
// 7) RUTAS PROPIAS
// ─────────────────────────────────────────────

// Home
app.get("/", (req, res) => {
  res.render("index", {
    title: "Inicio",
    login: req.session.loggedin || false,
    name: req.session.name || "Invitado",
    rol: req.session.rol || null,
  });
});

// GET /registro
app.get("/registro", (req, res) => {
  res.render("register", {
    title: "Registro",
    errors: null,
    old: null,
  });
});

// POST /register
app.post("/register", validateRegister, async (req, res) => {
  const { user, name, apellidos, rol, pass } = req.body;
  try {
    const passwordHash = await bcrypt.hash(pass, 8);

    db.query(
      "INSERT INTO usuarios SET ?",
      { email: user, nombre: name, apellidos, rol, pass: passwordHash },
      (error, results) => {
        if (error) {
          console.error("❌ Error al registrar usuario:", error);
          return res.status(400).render("register", {
            title: "Registro",
            errors: { user: { msg: "No se pudo registrar. ¿Ese email ya existe?" } },
            old: req.body,
          });
        }

        return res.render("register", {
          title: "Registro",
          alert: true,
          alertTitle: "Registro exitoso",
          alertMessage: "¡El usuario ha sido registrado!",
          alertIcon: "success",
          showConfirmButton: false,
          timer: 2000,
          ruta: "",
          errors: null,
          old: null,
        });
      }
    );
  } catch (err) {
    console.error("❌ Error en hash o proceso:", err);
    return res.status(500).render("register", {
      title: "Registro",
      errors: { pass: { msg: "Error interno. Intenta de nuevo." } },
      old: req.body,
    });
  }
});

// GET /login
app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    message: null,
    errors: null,
    old: null,
    login: req.session.loggedin || false,
    name: req.session.name || "Invitado",
    rol: req.session.rol || null,
  });
});

// GET /usuarios (JSON)
app.get("/usuarios", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, results) => {
    if (err) {
      console.error("❌ Error al obtener los usuarios:", err);
      return res.status(500).send("Error al obtener los usuarios");
    }
    res.json(results);
  });
});

// Panel ADMIN
app.get("/admin", (req, res) => {
  if (req.session.loggedin && req.session.rol === "admin") {
    return res.render("admin", {
      title: "Panel Admin",
      login: true,
      name: req.session.name,
      rol: req.session.rol,
    });
  }
  return res.redirect("/login");
});

// Panel EDITOR
app.get("/editor", (req, res) => {
  if (req.session.loggedin && req.session.rol === "editor") {
    return res.render("editor", {
      title: "Panel Editor",
      login: true,
      name: req.session.name,
      rol: req.session.rol,
    });
  }
  return res.redirect("/login");
});

// ─────────────────────────────────────────────
// 8) ARRANQUE DEL SERVIDOR
// ─────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
