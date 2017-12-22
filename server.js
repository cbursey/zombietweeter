var express = require('express');
var app = express();                               // create our app w/ express
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)


app.use(express.static(__dirname));        
app.use(morgan('dev'));                                         // log every request to the console          // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
    // listen (start app with node server.js) ======================================

var Twitter = require('twitter-node-client').Twitter;


var twitter = new Twitter();


app.get('/', function (req, res) {
    res.send('Simple web server of files from ' + __dirname);
});

app.get('/fetchEmbed:url', function (req, res) {
	twitter.getCustomApiCall('/statuses/oembed.json', {id: req.params.url},
		function (err, response, body) {
    		console.log('/FETCHEMBED ERR:', req.params.url, err);
    		res.status(400).send('/FETCHEMBED ERR');
		}, 
		function (data) {
			console.log('heres the data');
			console.log(data);
			console.log('ok');
			res.send(data);
		}
	);
});

/*app.post('/fetchTweets', function (req, res) {
	console.log('fetchin');
	twitter.getUserTimeline({ screen_name: 'FiveThirtyEight', count: '10'},
	function (err, response, body) {
    	console.log('/FETCHTWEETS ERR:', err);
    	res.status(400).send('/FETCHTWEETS ERR');
	}, function (data) {
		console.log(data);
		res.end(data);
	});
});*/

app.post('/fetchTweets', function (req, res) {
	console.log('fetchin');
	twitter.getCustomApiCall('/tweets/search/30day/dev.json', {
		"query": "#puppy",
		"fromDate":"201712121430",
		"toDate":"201712121500",
		"maxResults": 10
	},
	function (err, response, body) {
    	console.log('/FETCHTWEETS ERR:', err);
    	res.status(400).send('/FETCHTWEETS ERR');
	}, function (data) {
		console.log(data);
		res.end(data);
	});
});



var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});
