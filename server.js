var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var path = require('path');
var fs = require('fs');

const Sequelize = require('sequelize');
var sequelize = new Sequelize('sally_5', 'root', '', { dialect: 'mysql' });

var User = sequelize.define('user', {
  username: Sequelize.STRING,
  email: Sequelize.STRING,
  profile_image: Sequelize.STRING
});

sequelize.sync();

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'hbs');

app.use(multer({ dest: path.join(__dirname, '/temp')}).any());

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function(req, res) {
	User.findAll().then(function(users) {
		res.render('index', {users: users});	
	}); 
});

app.post('/users', function(req, res) {
	// get the file data from the temporary image file that multer creates for us in the /temp folder
	fs.readFile(req.files[0].path, function read(err, data) {
	    if (err) return console.log('Error: ' + err);
			
			// create a file name that we will use to create the image
	    var file_name = req.body.name + '_profile.png';
	    // create the url path where we will store the image
	    // needs to be in the in the public directory so the front end can access it
			var image_url = path.join(__dirname, '/public/profiles/' + file_name);
			
			// Save the image to the public/profiles directory using the data we got from the readFile as binary
			fs.writeFile(image_url, data, 'binary', function(err){
		    if (err) throw err;
				
				// Create a new user and set the profile_image to the file name
				// so we can simply link to the image in our handlebars view
				User.create({
					username: req.body.name,
					email: req.body.email,
					profile_image: file_name
				}).then(function() {
					res.redirect('/');
				});
		  });
	});
});

app.listen(3000, function() {
	console.log('Listening on port 3000');
});