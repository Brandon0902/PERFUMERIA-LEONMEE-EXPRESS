const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const { check, validationResult } = require('express-validator');

const Supplier = mongoose.model("Supplier");

let auth = require("../middleware/autentificajwt");
// Middleware para validar los datos de entrada
const validateSupplierInput = [
  check('companyName').notEmpty().withMessage('El nombre de la compañía es requerido').isLength({ max: 20 }).withMessage('El nombre de la compañía no puede exceder 20 caracteres'),
  check('address').notEmpty().withMessage('La dirección es requerida'),
  check('city').notEmpty().withMessage('La ciudad es requerida'),
  check('region').notEmpty().withMessage('La región es requerida'),
  check('postalCode').notEmpty().withMessage('El código postal es requerido'),
  check('country').notEmpty().withMessage('El país es requerido'),
  check('phone').isLength({ min: 10 }).withMessage('El teléfono debe tener al menos 10 dígitos')
];

// Ruta para crear un nuevo supplier
router.post('/', auth, validateSupplierInput, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const supplier = new Supplier({
    companyName: req.body.companyName,
    address: req.body.address,
    city: req.body.city,
    region: req.body.region,
    postalCode: req.body.postalCode,
    country: req.body.country,
    phone: req.body.phone
  });

  try {
    const savedSupplier = await supplier.save();
    res.status(201).json({ message: 'Proveedor creado exitosamente', supplier: savedSupplier });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el proveedor', error: err.toString() });
  }
});

// Ruta para obtener todos los suppliers
router.get('/', auth, async (req, res) => {
  try {
    const suppliers = await Supplier.find({});
    res.json(suppliers);
  } catch (err) {
    res.status(500).send('Error al obtener los suppliers');
  }
});

// Ruta para actualizar un supplier existente
router.patch('/:id', auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updateFields = {
      companyName: req.body.companyName,
      address: req.body.address,
      city: req.body.city,
      region: req.body.region,
      postalCode: req.body.postalCode,
      country: req.body.country,
      phone: req.body.phone
    };

    const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true });
    if (!updatedSupplier) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    res.status(200).json({ message: 'Proveedor actualizado exitosamente', supplier: updatedSupplier });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el proveedor', error: err.toString() });
  }
});

// Ruta para eliminar un supplier
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!deletedSupplier) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    res.status(200).json({ message: 'Proveedor eliminado exitosamente', supplier: deletedSupplier });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el proveedor', error: err.toString() });
  }
});

module.exports = router;
