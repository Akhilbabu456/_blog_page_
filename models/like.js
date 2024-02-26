const mongoose = require('mongoose');
const { Schema } = mongoose;

const likeSchema = new Schema({
  article: { type: Schema.Types.ObjectId, ref: 'Article' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Like', likeSchema);