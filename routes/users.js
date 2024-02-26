var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
const lodash= require('lodash');
const { body, validationResult } = require("express-validator")
const article = require("../models/article")
const User = require("../models/users")
const Like = require("../models/like")
const bcrypt= require('bcrypt')
const paginate = require("express-paginate");
const fs = require('fs')
const path = require('path')



/* GET users listing. */
router.get("/", async(req,res)=>{
  try{
    const objectId = req.session.userId
    await mongoose.connect("mongodb+srv://Akhil-Babu:akhildevika12345@cluster0.ggjjyjw.mongodb.net/Blog", {useNewUrlParser: true}) 
    const user = await User.findOne({_id:objectId})

    var resultsPromise= await article.find({})
      .sort({ publishedOn: -1 })
      .limit(req.query.limit)
      .skip(req.skip);

      const countPromise = article.countDocuments({});

      const [results, itemCount] = await Promise.all([
        resultsPromise,
        countPromise,
      ]);
  
      const pageCount = Math.ceil(itemCount / req.query.limit);
  
      const pages = paginate.getArrayPages(req)(5, pageCount, req.query.page);
  
      // Check if there are previous pages
      const hasPreviousPages = req.query.page > 1;
  
      // Check if there are next pages
      const hasNextPages = req.query.page < pageCount;
  
      const currentPage = req.query.page || 1;
      resultsPromise.forEach((article) => {
        const options = { day: "numeric", month: "short", year: "numeric" };
        article.publishedOnFormatted = article.publishedOn.toLocaleDateString(
          "en-IN",
          options
        );
      });
      pages.forEach(page => {
        if (page.number === req.query.page) {
            page.active = true;
        } else {
            page.active = false;
        }
    });
    res.render("user", {
      layout : "userlayout" , 
      name: user.name, 
      cards: results,
      pageCount,
      itemCount,
      pages,
      hasPreviousPages,
      hasNextPages,
      req,
      successMessage: req.flash("success"),
      currentPage,
    })
   }catch(err){
    console.error(err.message);
    res.status(500).send("Error user not found");
   }

})
router.get("/myblog", async(req,res)=>{
  try{
    const objectId = req.session.userId
    console.log(objectId)
    await mongoose.connect("mongodb+srv://Akhil-Babu:akhildevika12345@cluster0.ggjjyjw.mongodb.net/Blog", {useNewUrlParser: true})
    const user = await User.findOne({_id:objectId})
    var resultsPromise= await article.find({user: objectId})
      .sort({ publishedOn: -1 })
      .limit(req.query.limit)
      .skip(req.skip);

      const countPromise = article.countDocuments({});

      const [results, itemCount] = await Promise.all([
        resultsPromise,
        countPromise,
      ]);
  
      const pageCount = Math.ceil(itemCount / req.query.limit);
  
      const pages = paginate.getArrayPages(req)(5, pageCount, req.query.page);
  
      // Check if there are previous pages
      const hasPreviousPages = req.query.page > 1;
  
      // Check if there are next pages
      const hasNextPages = req.query.page < pageCount;
  
      const currentPage = req.query.page || 1;
      resultsPromise.forEach((article) => {
        const options = { day: "numeric", month: "short", year: "numeric" };
        article.publishedOnFormatted = article.publishedOn.toLocaleDateString(
          "en-IN",
          options
        );
      });
      pages.forEach(page => {
        if (page.number === req.query.page) {
            page.active = true;
        } else {
            page.active = false;
        }
    });
    console.log(user)
  res.render("user", {
    layout : "userlayout" ,
     name: user.name, 
     cards: results,
     pageCount,
     itemCount,
     pages,
     hasPreviousPages,
     hasNextPages,
     req,
     successMessage: req.flash("success"),
     currentPage,
    })
  }catch(err){
    console.error(err.message);
    res.status(500).send("Error user not found");
  }
})
router.get("/addblog", (req,res)=>{
  res.render("addblog", {title: "Add Blog", action: "/user", layout: "loginlayout"})
})
router.post("/addblog", [
  body("title")
  .notEmpty()
  .withMessage("Title is required")
  .isLength({min:5},{max: 100})
  .withMessage("Title must be between 5 to 100 characters long"),
  body("content")
  .notEmpty()
  .withMessage("Content is required")
  .isLength({min:5},{max: 1000})
  .withMessage("Title must be between 5 to 1000 characters long")
] , async(req,res)=>{
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('danger', 'Please correct the following errors:')
    res.render("addblog", {
      title: "Add Blog",
      action: "/user",
      errors: errors.array(),
      values: req.body,
    })
  }else{
  const objectId = req.session.userId
  const title= req.body.title
  const content= req.body.content
  try{
    await mongoose.connect("mongodb+srv://Akhil-Babu:akhildevika12345@cluster0.ggjjyjw.mongodb.net/Blog", {useNewUrlParser: true})
    const user = objectId
    const data = await User.findOne({_id:objectId})
    const author = data.name
    console.log(author)
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
  
    const file = req.files.avatar;
    if (!file) {
      return res.status(400).send('No avatar file was uploaded.');
    }
    let newPath = file.name + Date.now()
    // file is stored in req.files.avatar
    const filePath = `${__dirname}/../uploads/${newPath}`;
    file.mv(filePath, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      // res.send(`File uploaded successfully: ${file.name}`); // remove this line
      const newBlog = new article({
        title,
        content,
        user,
        author: author,
        image: newPath,
      })
      newBlog.save()
      req.flash('success', 'Blog added successfully')
      res.redirect("/user")
    });
  }catch(err){
    console.error(err.message);
      res.status(500).send("Error while adding blog");
  }
  }
})
router.get("/view/:id", async(req,res)=>{
  const objectId = req.session.userId
  let id = req.params.id;
  try{
   await mongoose.connect("mongodb+srv://Akhil-Babu:akhildevika12345@cluster0.ggjjyjw.mongodb.net/Blog", {useNewUrlParser: true})
   const data= await article.find({_id: id})
   data.forEach((article) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    article.publishedOnFormatted = article.publishedOn.toLocaleDateString(
      "en-IN",
      options
    );
  });
   console.log(data[0].user)
   console.log(objectId)
   if(data[0].user==objectId){
    res.render("userview", {layout: "loginlayout", data: data, action: "/user"})
   }else{
    res.render("view", {layout: "loginlayout", data: data, action: "/user"})
   }
  }catch(err){
      console.error(err.message);
      res.status(500).send("Error user not found");
  }
})
router.get("/view/:id/delete", async(req,res)=>{
  let id = req.params.id;
  try{
   await mongoose.connect("mongodb+srv://Akhil-Babu:akhildevika12345@cluster0.ggjjyjw.mongodb.net/Blog", {useNewUrlParser: true})
   const pic = await article.findOne({_id: id})
   if (pic.image) {
     // Delete the image file
     const imagePath = `${__dirname}/../uploads/${pic.image}`;
     fs.unlinkSync(imagePath);
   }
   const data= await article.deleteOne({_id: id})
   if (!data) {
    res.status(404).json({ error: "Article not found" });
  } else {
    req.flash('success', 'Blog deleted successfully')
    res.redirect("/user/myblog")
  }
} catch (err) {
  console.error(err);
  res.status(500).send("Error deleting article");
}
})
router.get("/view/:id/update", async(req,res)=>{
  let id= req.params.id
  console.log(id)
  try{
    await mongoose.connect("mongodb+srv://Akhil-Babu:akhildevika12345@cluster0.ggjjyjw.mongodb.net/Blog", {useNewUrlParser: true})
    const data= await article.findOne({_id: id})
  res.render("update", {heading: "Update Form", layout: "loginlayout", action: "/user", _id: id, title: data.title, content: data.content, image: data.image})
  }catch(err){
    console.error(err);
    res.status(500).send("Error fetching article");
  }
})
router.post("/view/:id/update", async (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  let articleId = req.params.id;
  let image = req.body.existingImage || ""; // get the existing image name from the request body

  try {
    await mongoose.connect("mongodb+srv://Akhil-Babu:akhildevika12345@cluster0.ggjjyjw.mongodb.net/Blog", {
      useNewUrlParser: true,
    });

    if (req.files && req.files.avatar) {
      // if a new image is uploaded, delete the old image file and save the new one
      const file = req.files.avatar;
      let newPath= file.name + Date.now()
      const filePath = `${__dirname}/../uploads/${newPath}`;
      const pic = await article.findOne({_id: articleId}); // fetch the article object again
      if (pic.image && pic.image !== image) {
        // only delete the old image file if it's different from the existing image name
        const imagePath = `${__dirname}/../uploads/${pic.image}`;
        fs.unlinkSync(imagePath);
      }
      file.mv(filePath, async (err) => {
        if (err) {
          return res.status(500).send(err);
        }
        image = newPath;
        // Update the title, content, and image fields
        const updatedDocument = await article.findOneAndUpdate(
          { _id: articleId },
          { $set: { title, content, image } },
          { new: true }
        );
        if (updatedDocument) {
          req.flash('success', 'Blog updated successfully')
          res.redirect(`/user/view/${articleId}`);
        } else {
          res.status(500).send("Error updating article");
        }
      });
    } else {
      // if no new image is uploaded, just update the title and content fields
      const updatedDocument = await article.findOneAndUpdate(
        { _id: articleId },
        { $set: { title, content } },
        { new: true }
      );
      if (updatedDocument) {
        req.flash('success', 'Blog updated successfully')
        res.redirect(`/user/view/${articleId}`);
      } else {
        res.status(500).send("Error updating article");
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating article");
  }
});
router.get('/like/:id', async (req, res) => {
  try{
    const articleId  = req.params.id;
    const  userId  = req.session.userId

    const Article = await article.findById(articleId);
    const user = await User.findById(userId);

    // Check if the user has already liked the article
    const like = await Like.findOne({ article: articleId, user: userId});
    if (like){
      await Like.deleteOne({ article: articleId, user: userId});
      await article.findByIdAndUpdate(articleId, { $inc: { likes: -1 } }, { new: true });
      await User.findByIdAndUpdate(userId, { $pull: { likedArticles: articleId } }, { new: true });
      res.redirect('/user');
    }else{
    const newLike = new Like({ article: articleId, user: userId});
    await newLike.save()
    Article.likes += 1;
    await Article.save()
    user.likedArticles.push(articleId);
    await user.save()
    res.redirect('/user');
    }
  } catch (error) {
    console.log(error)
  }
  
});

router.get("/search", async(req,res)=>{
  const searchTerm = req.query.search;
  const regex = new RegExp(searchTerm, 'i')
  
  try{
    const result = await article.find({ $or: [{ title: regex }, { content: regex }] });
    console.log(result)
    if(result){
      
    res.render("user", {
      layout: "loginlayout",
      action: "/user",
      cards:result,
      //successMessage: req.flash("success", "Search results according to title and content")
    })
   
  }else{
    req.flash("danger", "No search results found")
    res.redirect("/user")
  }
  }catch(err){
    console.log(err)
  }
})
router.get("/setting", async(req,res)=>{
  const objectId= req.session.userId
  try{
    const user = await User.findById(objectId);
    res.render("setting", {
      layout: "loginlayout",
       action: "/user",
        title: "Settings",
        name: user.name,
        email: user.email
      })
  }catch(err){
    console.log(err)
  }
  
})
router.post("/setting",[
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
  body("oldPassword")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 characters long"),
  body("newPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
] , async(req,res)=>{
  const objectId= req.session.userId
  let name= req.body.name
  let email= req.body.email
  let oldPassword= req.body.oldPassword
  let newPassword= req.body.newPassword
  try{
  let user = await User.findById(objectId)
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds)
  const isPasswordMatch = await bcrypt.compare( oldPassword, user.password)
  if(isPasswordMatch){
     user.name= name,
     user.email= email,
     user.password= hashedPassword
    await user.save()
    req.flash('success', 'Settings updated successfully')
    res.redirect("/user")
  }else{
    req.flash('danger', 'Current password is incorrect')
     res.send("Enter write password")
  }
  }catch(err){
  console.log(err)
  req.flash('danger', 'Error updating settings')
  res.redirect("/user/setting")
}
})
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error logging out');
    } else {
      res.clearCookie('connect.sid');
      res.redirect('/login');
    }
  });
});


module.exports = router;
