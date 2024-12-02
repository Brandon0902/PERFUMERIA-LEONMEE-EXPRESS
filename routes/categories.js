const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const { check, validationResult } = require('express-validator');
const upload = require ('../libs/container');
const Category = mongoose.model("Category");

let auth = require("../middleware/autentificajwt");

const validateCategoryInput = [
  check('categoryName').notEmpty().withMessage('El nombre de la categoría es requerido').isLength({ max: 30 }).withMessage('El nombre de la categoría no puede exceder 30 caracteres'),
  check('description').notEmpty().withMessage('La descripción es requerida')
];

// Ruta para crear una nueva categoría
router.post('/', auth, upload.single('image'), validateCategoryInput, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let imagePath = req.file ? `/image/${req.file.filename}` : 'default.jpg'; // Usa la imagen predeterminada si no se sube ninguna

  const category = new Category({
    categoryName: req.body.categoryName,
    description: req.body.description,
    image: imagePath
  });

  category.setImgUrl(imagePath); // Establece la URL completa de la imagen

  try {
    const savedCategory = await category.save();
    res.status(201).json({ message: 'Categoría creada exitosamente', category: savedCategory });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la categoría', error: err.toString() });
  }
});

// Ruta para obtener todas las categorías
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (err) {
    res.status(500).send('Error al obtener las categorías');
  }
});

// Ruta para actualizar una categoría existente
router.patch('/:id', auth, upload.single('image'), validateCategoryInput, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let imagePath = req.file ? `/image/${req.file.filename}` : req.body.image; 

  try {
    const updateFields = {
      categoryName: req.body.categoryName,
      description: req.body.description,
      image: imagePath
    };

    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true });
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.status(200).json({ message: 'Categoría actualizada exitosamente', category: updatedCategory });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar la categoría', error: err.toString() });
  }
});

// Ruta para eliminar una categoría
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.status(200).json({ message: 'Categoría eliminada exitosamente', category: deletedCategory });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar la categoría', error: err.toString() });
  }
});

module.exports = router;
