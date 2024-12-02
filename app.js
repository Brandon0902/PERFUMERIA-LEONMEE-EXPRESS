var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const upload = require('./libs/container');
const cors = require("cors");

const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Listado de modelos
require("./models/user");
require("./models/category");
require("./models/order");
require("./models/product");
require("./models/shipper");
require("./models/supplier");

var usersRouter = require('./routes/users');
var categoriesRoutes = require('./routes/categories');
var ordersRoutes = require('./routes/orders');
var productsRoutes = require('./routes/products');
var shippersRoutes = require('./routes/shippers');
var suppliersRoutes = require('./routes/suppliers');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/image',express.static(__dirname + '/container/img'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: ["http://localhost:4200", "http://localhost:8000"], // Asegúrate de usar comillas dobles para las claves del objeto
  methods: ["GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"], // Usa un array para los métodos y asegúrate de que PATCH esté incluido correctamente
  preflightContinue: false, // Cambia esto a true para manejar adecuadamente las solicitudes preflight
  optionsSuccessStatus: 204
}));


app.use('/users', usersRouter);
app.use('/categories', categoriesRoutes);
app.use('/orders', ordersRoutes);
app.use('/products', productsRoutes);
app.use('/shippers', shippersRoutes);
app.use('/suppliers', suppliersRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
