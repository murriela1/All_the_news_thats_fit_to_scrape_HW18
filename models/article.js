var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Note = require("./note.js");

var ArticleSchema = new Schema({
  title:{
    type:String
  },
  img_url:{
    type:String
  },
  link:{
    type:String
  },
  author:{
    type:String
  },
  author_url:{
    type:String
  },
  date:{
    type: Date,
    default: Date.now
  },
  note:[{
    type: Schema.Types.ObjectId,
    ref: 'Note'
  }]
});

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;