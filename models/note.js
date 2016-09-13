var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
	author:{
		type: String
	},
	content: {
		type: String
	}
});

var Note = mongoose.model('Note', commentSchema);

module.exports = Note;