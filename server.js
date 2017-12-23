var express = require('express');
var app = express();                               
var morgan = require('morgan'); 
var bodyParser = require('body-parser'); 
var Twitter = require('twitter-node-client').Twitter;
var twitter = new Twitter();

app.use(express.static(__dirname));        
app.use(morgan('dev'));                                       
app.use(bodyParser.json());                                     

app.get('/', function (req, res) {
    res.send('Simple web server of files from ' + __dirname);
});

//fetches oembed HTML  to embed tweets in feed
app.get('/fetchEmbed:id', function (req, res) {
	twitter.getCustomApiCall('/statuses/oembed.json', {id: req.params.id},
		function (err, response, body) {
    		console.error('/fetchEmber error:', err);
    		res.status(400).send('/fetchEmbed error', err);
		}, 
		function (data) {
			console.log('/fetchEmbed success');
			res.send(data);
		}
	);
});

//fetches tweets data based on parameters 
app.post('/fetchTweets', function (req, res) {
	console.log('fetchin');
	var body = {};
	if (req.body.next){
		body = {
			"query": req.body.hashtag,
			"fromDate": req.body.fromDate,
			"toDate": req.body.toDate,
			"maxResults": 100,
			"next": req.body.next
		};
	} else {
		body = {
			"query": req.body.hashtag,
			"fromDate": req.body.fromDate,
			"toDate": req.body.toDate,
			"maxResults": 100
		};
	}
	twitter.getCustomApiCall('/tweets/search/30day/dev.json', body,
		function (err, response, body) {
    		console.error('/fetchTweets error:', err);
    		res.status(400).send('/fetchTweets error:', err);
		}, function (data) {
			console.log('/fetchTweets success');
			res.end(data);
		}
	);
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});
