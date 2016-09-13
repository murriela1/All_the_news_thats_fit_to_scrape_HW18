//initialize express app
var express = require('express');
var app = express();

//for scraping
var request = require('request');
var cheerio = require('cheerio');
var url = 'http://www.newyorker.com/popular?intcid=mod-most-popular'

var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
	extended: false
}));

//public static dir
app.use(express.static(process.cwd() + '/public'));
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//connect to db
mongoose.connect('mongodb://heroku_5wc69brr:7l2km9ri04vs2e8ml728ohu4ta@ds019926.mlab.com:19926/heroku_5wc69brr');
var db = mongoose.connection;

//show any errors
db.on('error', function(err){
	console.log('Mongoose Error: ' + err);
});

db.once('open', function(){
	console.log('Mongoose connection a success!');
});

var Article = require('./models/article.js');
var Note = require('./models/note.js');

//home
app.get('/', function(req,res){
	res.render('index');
});

app.get('/article', function(req,res){
	Article.find({})
		.sort({'date': -1})
		.limit(30)
		.exec(
			function(err, doc){
				// log any errors
				if (err){
					console.log(err);
				} 
				// or send the doc to the browser as a json object
				else {
					res.json(doc);
				}
			});
	});

app.get('/article/:id', function(req,res){
	Article.findOne({'_id': req.params.id})
		.populate('note')
		.exec(function(err,doc){
			if(err){
				console.log(err);
			}
			else{
				console.log("WOW YOU NOTER!",doc);
				res.render('note', doc);
				
			}
		});
});

app.post('/article/:id', function(req, res){
	// create a new note and pass the req.body to the entry.
	var newNote = new Note(req.body);

	// and save the new note the db
	newNote.save(function(err, doc){
		// log any errors
		if(err){
			console.log(err);
		} 
		// otherwise
		else {
	
			Article.findOneAndUpdate({'_id': req.params.id}, {$push: {'note':doc._id}}, {new: true, upsert: true})
				.populate('note')
				.exec(function(err, doc){
					console.log("NOTES", doc)
					// log any errors
					if (err){
						console.log(err);
					} else {
						res.render('note', doc);
					}
			});
		}
	});

});


app.get('/scrape', function(req,res){
	
	var scrapePage = function(error, response, html){
		if (error || response.statusCode != 200){
			console.log('We got a problem!');
		}
		else{
			var result = {};
			var $ = cheerio.load(html);

			$('.popular-page1').each(function(i, element){

				result.title = $(this).children('article').children('span').find('a').text();

				result.img_url = $(this).children('article').children('figure').children('a').children('img').attr('src');

				result.link = $(this).children('article').children('figure').children('a').attr('href');

				result.author = $(this).children('article').children('.text').children('h3').children('a').text();

				result.author_url = $(this).children('article').children('.text').children('h3').children('a').attr('href');;

				var entry = new Article(result);

					entry.save(function(err,doc){
						if(err){
							console.log(err);
						}
						else{
							console.log(doc);
						}
					});				
			});
		}
	}

	request(
		{
			url: url,
		}, scrapePage
	);

	res.redirect("/");
});

var PORT = process.env.PORT || 3000
app.listen(PORT, function(){
	console.log("Welcome to Port " + PORT)
});