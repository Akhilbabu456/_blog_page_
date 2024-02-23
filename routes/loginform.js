var express = require('express')
var router= express.Router()
const bcrypt= require('bcrypt')
const User = require("../models/users")
var mongoose = require("mongoose")

router.get("/", (req,res,next)=>{
    res.render("loginform", {title: "Login Form", action: "/", layout : "loginlayout"})
})
router.post('/', async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const rememberMe = req.body.rememberMe;
  
    try {
      await mongoose.connect('mongodb+srv://Akhil-Babu:akhildevika12345@cluster0.ggjjyjw.mongodb.net/Blog', { useNewUrlParser: true });
      const data = await User.findOne({ email });
      if (!data) {
        req.flash('danger', 'Invalid credentials');
        return res.render('loginform', {
          layout: 'loginlayout',
          title: "Login Form",
          errors: [{ msg: 'Invalid credentials' }],
        });
      }
  
      const isPasswordMatch = await bcrypt.compare(password, data.password);
      if (isPasswordMatch) {
        req.session.userId = data._id.valueOf();
        if (rememberMe) {
          req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 day
        } else {
          req.session.cookie.expires = false;
        }
        req.flash('success', 'Login successful')
        res.redirect('/user');
        console.log('Redirected');
      } else {
        res.render('loginform', { title: 'Login Form', errors: [{ msg: 'Wrong Password' }], values: req.body });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error user not found');
    }
  });
  
module.exports = router