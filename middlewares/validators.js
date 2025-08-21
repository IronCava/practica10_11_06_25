const { body, validationResult } = require('express-validator');
const validator = require('validator'); //

// Login: email + pass
const validateLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Introduce un email válido')
    .normalizeEmail(),
  body('pass')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .trim(),

  // middleware final que recoge los errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('login', {
        message: null,
        errors: errors.mapped(),   // { campo: { msg, ... } }
        old: req.body              // para repoblar el formulario
      });
    }
    next();
  }
];

// ─────────────────────────────────────────────
// Registro: user(email), name, apellidos, rol, pass
// ─────────────────────────────────────────────
const validateRegister = [
  // Email en el campo "user"
  body('user')
    .customSanitizer(v => (typeof v === 'string' ? v.trim() : v)) // recorta
    .notEmpty().withMessage('El email es obligatorio')
    .bail()
    .custom((value) => {                          // ⬅️ comprobación explícita de '@'
      if (!value.includes('@')) {
        throw new Error('El email debe contener @');
      }
      return true;
    })
    .bail()
    .custom((value) => {                          // ⬅️ respaldo con validator.js
      if (!validator.isEmail(value, { require_tld: true })) {
        throw new Error('Introduce un email válido (ej: usuario@dominio.com)');
      }
      return true;
    }),

  // Nombre
  body('name')
    .trim()
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),

  // Apellidos
  body('apellidos')
    .trim()
    .isLength({ min: 2 }).withMessage('Los apellidos deben tener al menos 2 caracteres'),

  // Rol
  body('rol')
    .isIn(['admin', 'editor']).withMessage('Rol inválido'),

  // Password
  body('pass')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),

  // Middleware final: recoge errores y pinta la vista
  (req, res, next) => {
    console.log('✅ validateRegister ejecutado. Body recibido:', req.body); // ⬅️ DEBUG
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('register', {
        title: 'Registro',
        errors: errors.mapped(),
        old: req.body
      });
    }
    next();
  }
];

module.exports = { validateLogin, validateRegister };