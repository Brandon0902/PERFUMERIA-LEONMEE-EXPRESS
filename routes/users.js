var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

let auth = require("../middleware/autentificajwt");

const User = mongoose.model("User");

// GET /users
router.get('/', auth, async(req, res, next)=> {
  try {
    let users = await User.find({});
    res.send(users);
  } catch (err) {
    next(err);
  }
});


// Validaciones para el cuerpo de la solicitud
const validations = [
  body("username", "El campo nombre esta vacio").not().isEmpty().isString(),
  body("email").isEmail().withMessage("Tiene que ser un email"),
  body("password").isStrongPassword().withMessage("Se requiere minimo 8 caracteres 1 sea  miniscula, 1 mayuscula, un simbolo")
];

router.post('/',validations, async (req, res, next) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    salt = await bcrypt.genSalt(10);
    encrypted = await bcrypt.hash(req.body.password, salt);

    let newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: encrypted,
    });


    await newUser.save();
    res.status(201).send({ newUser });
  } catch (err) {
    next(err);
  }
});

//Inicio de sesión
router.post("/login", async (req,res)=>{

  let user = await User.findOne({email:req.body.email});

  if(!user){
    return res.status(400).send("Usuario o contraseña incorrectos");
  }

  //if(req.body.password != usu.password){
  if(!await bcrypt.compare(req.body.password,user.password)){
    return res.status(400).send("Usuario o contraseña incorrectos");
  }

  //let jwtoken = usu.generadorJWT();
  let usuarioAutenticado={
    message:"Bienvenido",
    email: user.email,
    jwtoken: user.generateJWT()
  };

  res.send({usuarioAutenticado});

});

// PUT /users/pass
router.put("/pass", auth, [
  body("email").isEmail(),
  body("password").isStrongPassword({minLength:8,
                                   minLowercase:1,
                                   minNumber:1,
                                   minSymbols:1,
                                   minUppercase:1       
})
], async (req,res)=>{

  let error = validationResult(req);

  if(!error.isEmpty()){
    return res.status(400).send({errores: error.array()})
  }  

  let user= await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).send("Usuario no encontrado"); 
  }

  salt = await bcrypt.genSalt(10);
  encrypted = await bcrypt.hash(req.body.password, salt);

  let userUpdate = await User.findOneAndUpdate(
    { email: req.body.email },
    {
      password: encrypted,
      role: req.body.role
    },
    { new: true }, // Esta opción devuelve el documento modificado
  );

  res.send({ userUpdate })
});

router.patch('/update/email', auth, [
  body("email").isEmail().withMessage("Debe ser un correo electrónico válido"),
  body("username").optional().isString().withMessage("Debe ser una cadena de texto"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send("Usuario no encontrado");
    }

    // Actualizar solo los campos que han sido enviados en la solicitud
    const updatedFields = {};
    Object.keys(req.body).forEach(key => {
      if (key!== 'email') { // Excluir el campo email ya que se usa para buscar
        updatedFields[key] = req.body[key];
      }
    });

    // Aplicar los cambios solo a los campos actualizados
    const updatedUser = await User.findOneAndUpdate(
      { email: req.body.email },
      { $set: updatedFields },
      { new: true }
    );

    res.send({ updatedUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});



// DELETE /users/delete/:email
router.delete('/delete/:email', auth, async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(400).send("User not found");
    }

    let deletedUser = await User.findOneAndDelete({ email: req.params.email });
    res.send({ deletedUser });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
