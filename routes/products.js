const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const { check, validationResult } = require('express-validator');
const upload = require('../libs/container');
const Product = mongoose.model("Product");
const Supplier = mongoose.model("Supplier");
const Category = mongoose.model("Category");

let auth = require("../middleware/autentificajwt");

const validateProductInput = [
  check('name').notEmpty().withMessage('El nombre del producto es requerido'),
  check('supplierName').notEmpty().withMessage('El nombre del proveedor es requerido'),
  check('categoryName').notEmpty().withMessage('El nombre de la categoría es requerido'),
  check('price').isNumeric().withMessage('El precio debe ser un número'),
  check('description').notEmpty().withMessage('La descripción del producto es requerida'),
  check('unitsInStock').isNumeric().withMessage('Las unidades en stock deben ser un número'),
  check('discontinued').isBoolean().withMessage('Estado de descontinuación debe ser booleano'),
];

// Ruta para crear un nuevo producto
router.post('/', auth, upload.single('image'), validateProductInput, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let imagePath = req.file ? `/image/${req.file.filename}` : 'default.jpg';

  try {
    // Buscar el proveedor por companyName
    const supplier = await Supplier.findOne({ companyName: req.body.supplierName });
    if (!supplier) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    // Buscar la categoría por categoryName
    const category = await Category.findOne({ categoryName: req.body.categoryName });
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    const product = new Product({
      name: req.body.name,
      supplierName: supplier.companyName,
      categoryName: category.categoryName,
      price: req.body.price,
      description: req.body.description,
      unitsInStock: req.body.unitsInStock,
      discontinued: req.body.discontinued,
      image: imagePath
    });

    product.setImgUrl(imagePath);

    const savedProduct = await product.save();
    res.status(201).json({ message: 'Producto creado exitosamente', product: savedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el producto', error: err.toString() });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).send('Error al obtener los productos');
  }
});

// Ruta para actualizar un producto existente
router.patch('/:id', auth, upload.single('image'), validateProductInput, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let imagePath = req.file ? `/image/${req.file.filename}` : req.body.image;

  try {
    // Buscar el proveedor por companyName
    const supplier = await Supplier.findOne({ companyName: req.body.supplierName });
    if (!supplier) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    // Buscar la categoría por categoryName
    const category = await Category.findOne({ categoryName: req.body.categoryName });
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    const updateFields = {
      name: req.body.name,
      supplierName: supplier.companyName,
      categoryName: category.categoryName,
      price: req.body.price,
      description: req.body.description,
      unitsInStock: req.body.unitsInStock,
      discontinued: req.body.discontinued,
      image: imagePath
    };

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Producto actualizado exitosamente', product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el producto', error: err.toString() });
  }
});

// Ruta para eliminar un producto
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Producto eliminado exitosamente', product: deletedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el producto', error: err.toString() });
  }
});

module.exports = router;
