const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const { check, validationResult } = require('express-validator');
const upload = require ('../libs/container');

const Shipper = mongoose.model("Shipper");

let auth = require("../middleware/autentificajwt");

// Ruta para crear un nuevo shipper
router.post('/', auth, upload.single('image'), [
    check('companyname').notEmpty().withMessage('El nombre de la compañía es requerido'),
    check('phone').isNumeric().withMessage('El teléfono debe ser numérico')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let imagePath = req.file? `/image/${req.file.filename}` : 'default.jpg';

    const shipper = new Shipper({
      companyname: req.body.companyname,
      phone: req.body.phone,
      image: imagePath
    });

    shipper.setImgUrl(imagePath);

    try {
      const savedShipper = await shipper.save();
      res.status(201).json({ message: 'Shipper creado exitosamente', shipper: savedShipper });
    } catch (err) {
      res.status(500).json({ message: 'Error al crear el shipper', error: err.toString() });
    }
});

// Ruta para obtener todos los shippers
router.get('/', auth, async (req, res) => {
  try {
    const shippers = await Shipper.find({});
    res.json(shippers);
  } catch (err) {
    res.status(500).send('Error al obtener los shippers');
  }
});


// Ruta para actualizar un shipper existente
router.patch('/:id', auth, upload.single('image'), [
  check('companyname').optional().isString().withMessage('El nombre de la compañía debe ser una cadena'),
  check('phone').optional().isNumeric().withMessage('El teléfono debe ser numérico')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let imagePath = req.file ? `/image/${req.file.filename}` : req.body.image;

  try {
    const updateFields = {
      companyname: req.body.companyname,
      phone: req.body.phone,
      image: imagePath
    };

    const updatedShipper = await Shipper.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true });
    if (!updatedShipper) {
      return res.status(404).json({ message: 'Shipper no encontrado' });
    }
    res.status(200).json({ message: 'Shipper actualizado exitosamente', shipper: updatedShipper });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el shipper', error: err.toString() });
  }
});


// Ruta para eliminar un shipper
router.delete('/:id', auth, async (req, res) => {
    try {
      const deletedShipper = await Shipper.findByIdAndDelete(req.params.id);
      if (!deletedShipper) {
        return res.status(404).json({ message: 'Shipper no encontrado' });
      }
      res.status(200).json({ message: 'Shipper eliminado exitosamente', shipper: deletedShipper });
    } catch (err) {
      res.status(500).json({ message: 'Error al eliminar el shipper', error: err.toString() });
    }
});

module.exports = router;
