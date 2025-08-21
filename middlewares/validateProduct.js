// middlewares/validateProduct.js
const { body, validationResult } = require("express-validator");

const validateProduct = [
  body("nombre")
    .trim()
    .isLength({ min: 2 }).withMessage("El nombre debe tener al menos 2 caracteres"),
  body("descripcion")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage("La descripción no puede superar 500 caracteres"),
  body("precio")
    .isFloat({ min: 0 }).withMessage("El precio debe ser un número ≥ 0"),
  body("stock")
    .isInt({ min: 0 }).withMessage("El stock debe ser un entero ≥ 0"),

  // recojo errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // devolvemos la misma vista de formulario con errores + old
      return res.status(422).render("producto_form", {
        title: req.body.id ? "Editar producto" : "Nuevo producto",
        errors: errors.mapped(),
        old: req.body
      });
    }
    next();
  }
];

module.exports = { validateProduct };
