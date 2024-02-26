var express = require('express');
var router = express.Router();
var mongoose= require('mongoose')
var article = require('../models/article');
const paginate = require("express-paginate");
var fs = require('fs');

/* GET home page. */
router.get('/', async(req, res, next)=> {
     try{
      await mongoose.connect("mongodb+srv://Akhil-Babu:akhildevika12345@cluster0.ggjjyjw.mongodb.net/Blog", {useNewUrlParser: true}) 
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
    if(req.query.search){
      req.flash('success', 'Search results for ' + req.query.search);
    }
      res.render('index', {
        cards: results,
        pageCount,
        itemCount,
        pages,
        hasPreviousPages,
        hasNextPages,
        req,
        successMessage: req.flash("success"),
        currentPage,
      });
     }catch(err){
      console.error(err.message);
      res.status(500).send("Error user not found");
     }
  
});
router.get("/view/:id", async(req,res)=>{
  let id = req.params.id;
  try{
   await mongoose.connect("mongodb+srv://Akhil-Babu:akhildevika12345@cluster0.ggjjyjw.mongodb.net/Blog", {useNewUrlParser: true})
   const data= await article.find({_id: new mongoose.Types.ObjectId(id)})
   data.forEach((article) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    article.publishedOnFormatted = article.publishedOn.toLocaleDateString(
      "en-IN",
      options
    );
  });
   console.log(id);
   if(data){
    res.render("view", {layout: "loginlayout", data: data, action: "/"})
   }else{
      console.error(err.message);
      res.status(500).send("card data not found");
   }
  }catch(err){
      console.error(err.message);
      res.status(500).send("Error user not found");
  }
});

router.get('/image/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await article.find({ _id: new mongoose.Types.ObjectId(id) });
    const imagePath = `${__dirname}/../uploads/${data[0].image}`;
    const image = fs.readFileSync(imagePath);
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(image, 'binary');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error getting image');
  }
});

router.get("/search", async(req,res)=>{
  const searchTerm = req.query.search;
  const regex = new RegExp(searchTerm, 'i')
  
  try{
    const result = await article.find({ $or: [{ title: regex }, { content: regex }] });
    if(result){
      req.flash('success', 'Search results for ' + searchTerm)
    res.render("index", {layout: "loginlayout", action: "/",cards:result})
  }else{
    req.flash("danger", "No search results found")
    res.send("No search result")
  }
  }catch(err){
    console.log(err)
  }
})

module.exports = router;
