var mongoose = require("mongoose")
const userSchema= mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    likedArticles: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'article'
        }
      ]
})
module.exports= mongoose.model('Users', userSchema)