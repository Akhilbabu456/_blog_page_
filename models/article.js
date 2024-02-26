var mongoose = require('mongoose')

var articleSchema= mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    publishedOn: {
        type: Date,
        default: Date.now
    },
    user:{
        type: String,
        required: true
    },
    author:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    likes:{
        type: Number,
        default:0
    }
})

module.exports = mongoose.model("Article", articleSchema)
