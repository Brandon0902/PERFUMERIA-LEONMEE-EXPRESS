const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require("mongoose");

const Order = mongoose.model("Order");

let auth = require("../middleware/autentificajwt");

// Reglas de validación para la creación de una orden
const orderCreationRules = [
  body('userId').exists().withMessage('El campo userId es requerido'),
  body('orderDate').exists().withMessage('La fecha de la orden es requerida'),
  body('userCity').exists().withMessage('El campo ciudad del usuario es requerido'),
  body('userPostalCode').exists().withMessage('El campo código postal del usuario es requerido'),
  body('userColony').exists().withMessage('El campo colonia del usuario es requerido'),
  body('userAddress').exists().withMessage('El campo dirección del usuario es requerido'),
  body('shipVia').exists().withMessage('El campo de envío es requerido'),
  body('freight').exists().withMessage('El campo de envío es requerido').isNumeric().withMessage('El campo de envío debe ser numérico'),
  body('products').exists().withMessage('Los productos son requeridos').isArray().withMessage('Los productos deben ser enviados como un array').custom(products => {
    if (products.every(product => product.productId && product.quantity && product.price)) {
      return true;
    } else {
      throw new Error('Cada producto debe tener id, cantidad y precio');
    }
  }),
];

// Ruta para crear una nueva orden
router.post('/', auth, orderCreationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Crear la orden
  const order = new Order({
    userId: req.body.userId,
    orderDate: req.body.orderDate,
    userCity: req.body.userCity,
    userPostalCode: req.body.userPostalCode,
    userColony: req.body.userColony,
    userAddress: req.body.userAddress,
    shipVia: req.body.shipVia,
    freight: req.body.freight,
    products: req.body.products.map(product => ({
      productId: product.productId,
      quantity: product.quantity,
      price: product.price,
    })),
  });
  await order.save();

  // Preparar los datos para la respuesta JSON
  const responseData = {
    message: 'Orden creada exitosamente',
    order: order,
  };

  // Retornar los datos como JSON
  res.status(201).json(responseData);
});

router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:orderId', auth, orderCreationRules.slice(0, -1), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        userCity: req.body.userCity,
        userPostalCode: req.body.userPostalCode,
        userColony: req.body.userColony,
        userAddress: req.body.userAddress,
        shipVia: req.body.shipVia,
      },
      { new: true, runValidators: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    // Preparar los datos para la respuesta JSON
    const responseData = {
      message: 'Orden actualizada exitosamente',
      order: updatedOrder,
    };
    // Retornar los datos como JSON
    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:orderId', auth, async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.orderId);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    // Preparar los datos para la respuesta JSON
    const responseData = {
      message: 'Orden eliminada exitosamente',
    };
    // Retornar los datos como JSON
    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
