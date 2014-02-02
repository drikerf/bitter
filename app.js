// Require
var express = require('express');
var mongoose = require('mongoose');

// Get mongo model
var Picture = require('./models').Picture;

// Init app
var app = express();

// Environment
var environ = process.env.NODE_ENV || 'development';

app.configure(function () {
    // Set view engine
    app.set('view engine', 'jade');

    // Set view dir
    app.set('views', __dirname + '/views');

    // Set static dir
    app.use(express.static(__dirname + '/public'));

    // Logger (use @param 'dev' for development)
    app.use(express.logger());

    // Bodyparser
    app.use(express.bodyParser());

    // Use sessions
    app.use(express.cookieParser());
    // Session secret
    var sessionSecret = process.env.SESSION_SECRET || 'notSecret';
    app.use(express.session({secret: sessionSecret}));

    // Use csrf tokens
    app.use(express.csrf());
});

// Mongoose setup
if (environ == 'production') {
    var conn_str = process.env.MONGO_CONNECTION;
} else {
    var conn_str = 'mongodb://localhost/bitter';
}

// Mongoose
mongoose.connect(conn_str);

// Connection
var db = mongoose.connection;

// Handle error
db.on('error', console.error.bind(console, 'connection error'));

// Open connection
db.once('open', function callback() {

    // Add picture
    app.post('/add', function(req, res) {
        // Get picture
        var pictureBody = req.body;
        console.log(typeof pictureBody);
        // TODO: Validate picture
        // Empty picture
        if (Object.keys(pictureBody).length === 0 || 
            typeof pictureBody != 'object') {
            res.json(null);
        } else {
            // New picture
            var picture = new Picture({
                'picture': pictureBody
            });

            // Save picture
            picture.save(function (err, picture) {
                // Catch errors
                if (err) {throw err};
                
                // Return picture id 
                res.json({id: picture._id});
            });
        }
    });

    // Get picture
    app.get('/getpicture', function (req, res) {
        // Get picture with id
        var id = req.query.id;
        Picture.findById(id, function (err, picture) {
            // Return picture
            res.json(picture);
        });
    });

    // About
    app.get('/about', function (req, res) {
        res.render('about');
    })

    // Root
    app.get('/*', function (req, res) {
        var csrfToken = req.csrfToken();
        res.render('index', {token: csrfToken});
    });

    // Listen
    app.listen(5000, function () {
        console.log('Listening on: 5000')
    });
});


