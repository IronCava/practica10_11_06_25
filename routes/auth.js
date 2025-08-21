// routes/auth.js
const express = require("express");
const router = express.Router();
const db = require("../database/db");
const bcrypt = require("bcryptjs");
const { validateLogin } = require("../middlewares/validators");

// 🔐 POST /auth — procesa login (validado por express-validator)
router.post("/auth", validateLogin, async (req, res) => {
  const { email, pass } = req.body;

  db.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {
    if (err) {
      // Error de BD → volvemos a login con mensaje genérico
      return res.status(500).render("login", {
        message: "Error interno, intenta más tarde",
        old: { email }
      });
    }

    // Usuario no existe o contraseña incorrecta
    const user = results[0];
    if (!user || !(await bcrypt.compare(pass, user.pass))) {
      return res.status(401).render("login", {
        message: "Correo o contraseña incorrectos",
        old: { email }
      });
    }

    // ✅ Autenticado → guardo sesión
    req.session.loggedin = true;
    req.session.name = user.nombre; // <- usaremos "name" en las vistas
    req.session.rol = user.rol;

    // Redirección por rol (las vistas /admin y /editor las controla index.js)
    return res.redirect(user.rol === "admin" ? "/admin" : "/editor");
  });
});

// 🔓 GET /logout — cierra sesión
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// ❌ IMPORTANTE: NO definir aquí /admin ni /editor para evitar duplicados y variables incoherentes
module.exports = router;
