const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required:true,
        unique:true,
    },
    password:{
        type: String,
        required : true,
    },
    role:{
        type: String,
        require:true,
        enum : ["admin", "user"],
    },
},
{
    timestamps: true, 
}
);

module.exports = mongoose.model("User", userSchema);