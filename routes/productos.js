// routes/productos.js
const express = require("express");
const router = express.Router();
const db = require("../database/db");
const { validateProduct } = require("../middlewares/validateProduct");

// helper: solo admin (usamos req.session.rol aquí dentro del router)
const onlyAdmin = (req, res, next) => {
  if (req.session?.rol !== "admin") return res.status(403).send("Prohibido");
  next();
};

// LISTADO (GET /productos)
router.get("/", (req, res) => {
  db.query("SELECT * FROM productos ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).send("Error al obtener los productos");
    res.render("productos", { title: "Productos", productos: results });
  });
});

// NUEVO (GET /productos/nuevo) — formulario (solo admin)
router.get("/nuevo", onlyAdmin, (req, res) => {
  res.render("producto_form", { 
    title: "Nuevo producto",
    errors: null,
    old: { nombre: "", descripcion: "", precio: "", stock: "" }
  });
});

// CREAR (POST /productos) — solo admin
router.post("/", onlyAdmin, validateProduct, (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;
  db.query(
    "INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?,?,?,?)",
    [nombre, descripcion || null, precio, stock],
    (err) => {
      if (err) return res.status(500).send("Error al crear el producto");
      res.redirect("/productos");
    }
  );
});

// EDITAR (GET /productos/:id/editar) — form con datos (solo admin)
router.get("/:id/editar", onlyAdmin, (req, res) => {
  db.query("SELECT * FROM productos WHERE id = ?", [req.params.id], (err, rows) => {
    if (err) return res.status(500).send("Error al cargar el producto");
    if (!rows.length) return res.status(404).send("Producto no encontrado");
    const p = rows[0];
    res.render("producto_form", {
      title: "Editar producto",
      errors: null,
      old: { id: p.id, nombre: p.nombre, descripcion: p.descripcion || "", precio: p.precio, stock: p.stock }
    });
  });
});

// ACTUALIZAR (POST /productos/:id/editar) — solo admin
router.post("/:id/editar", onlyAdmin, validateProduct, (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;
  db.query(
    "UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=? WHERE id=?",
    [nombre, descripcion || null, precio, stock, req.params.id],
    (err) => {
      if (err) return res.status(500).send("Error al actualizar el producto");
      res.redirect("/productos");
    }
  );
});

// ELIMINAR (POST /productos/:id/borrar) — solo admin
router.post("/:id/borrar", onlyAdmin, (req, res) => {
  db.query("DELETE FROM productos WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send("Error al eliminar el producto");
    res.redirect("/productos");
  });
});

module.exports = router;
