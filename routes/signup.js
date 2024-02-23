var express= require('express')
var router= express.Router()
const bcrypt= require('bcrypt')
const { body, validationResult } = require("express-validator")
const User = require("../models/users")
var mongoose = require("mongoose")

router.get("/", (req,res)=>{
    res.render("signup",{title:"Sign Up", layout : "signuplayout"})
})
router.post("/", [
    body("name")
    .notEmpty()
    .withMessage("Name is required")
    .custom((value) => {
      if (!/^[a-zA-Z ]+$/.test(value)) {
        throw new Error("Name should only contain letters and spaces");
      }
      return true;
    }),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is not in correct format"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password should be at least 6 characters long"),
] , async (req,res)=>{
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('danger', errors.array())
     return res.render("signup", {
        title: "Sign Up",
        errors: req.flash('danger'),
        values: req.body,
      });
    } else {
      const name = req.body.name
      const email = req.body.email
      const password = req.body.password
      try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await mongoose.connect("mongodb+srv://Akhil-Babu:akhildevika12345@cluster0.ggjjyjw.mongodb.net/Blog", {useNewUrlParser: true})
        const data= await User.findOne({email})
        if(data){
          req.flash("danger", "Email already exists")
          res.render("signup", {title: "Sign Up", errors: [{ msg: "Email already exists" }], values: req.body})
          
        }else{
          const user = new User({
            name,
            email,
            password: hashedPassword,
          });
        
          await user.save();
          res.redirect("/");
        }
       
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Error while registering user");
    }
  }
})
module.exports = router