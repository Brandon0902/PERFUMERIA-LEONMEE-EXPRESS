const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");


const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true }, 
    password: { type: String, required: true }
});

// Método para generar un JWT (opcional)
UserSchema.methods.generateJWT = function() {
    return jwt.sign(
        {
            id: this._id,
            email: this.email
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
