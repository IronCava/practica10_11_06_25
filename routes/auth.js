const express = require("express");
const router = express.Router();
const db = require("../database/db");
const bcrypt = require("bcryptjs");

// 🔐 Ruta POST para procesar el inicio de sesión
router.post("/auth", async (req, res) => {
  // Desestructuramos el email y la contraseña desde el formulario
  const { email, pass } = req.body;


  // Verificamos que ambos campos estén presentes
  if (email && pass) {
    // Buscamos al usuario por su email
    db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          // Si hay un error con la base de datos, lo mostramos en consola
          console.log("❌ Error al buscar usuario:", err);
          // Mostramos un mensaje genérico de error al usuario
          return res.render("login", {
            message: "Error interno, intenta más tarde"
          });
        }

        // Verificamos si no hay resultados o si la contraseña es incorrecta
        if (
          results.length === 0 ||
          !(await bcrypt.compare(pass, results[0].pass))
        ) {
          // Si no coincide el usuario o contraseña, se muestra mensaje de error
          return res.render("login", {
            message: "Correo o contraseña incorrectos"
          });
        }

        // ✅ Si todo es correcto, guardamos los datos en la sesión
        req.session.loggedin = true;
        req.session.name = results[0].nombre;
        req.session.rol = results[0].rol;


        // Redirigimos a la página principal
        if (results[0].rol === "admin") {
          res.redirect("/admin");
        } else {
          res.redirect("/editor");
        }
      }
    );
  } else {
    res.render("login", {
      message: "Introduce un correo y una contraseña"
    });
  }
});


// 🔓 Ruta GET para cerrar sesión
router.get("/logout", (req, res) => {
  // Destruye la sesión activa
  req.session.destroy((err) => {
    if (err) {
      console.log("❌ Error al cerrar sesión:", err);
      // Si hay error, redirige igualmente al inicio
      return res.redirect("/");
    }
    // Redirige al login después de cerrar sesión
    res.redirect("/login");
  });
});
// Ruta para vista de administrador/editor
router.get("/admin", (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect("/login");
  }

  const nombre = req.session.name;
  const rol = req.session.rol;

  // Redirigimos según el rol
  if (rol === "admin") {
    res.render("admin", { nombre });
  } else {
    res.render("editor", { nombre });
  }
});

// Exportamos el router para poder usarlo en index.js
module.exports = router;
