var express = require('express');
var env = require('dotenv').config()
var ejs = require('ejs');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

mongoose.connect('mongodb+srv://allan1sikder:anSfjC95@allan.tl61mva.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (!err) {
    console.log('MongoDB-anslutning lyckades.');
  } else {
    console.log('Fel i DB-anslutning : ' + err);
  }
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Anslutningsfel:'));
db.once('open', function () {
});

app.use(session({
  secret: 'jobba hårt',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');	

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/views'));

var index = require('./routes/index');
app.use('/', index);

// fånga 404 och skicka vidare till felhanterare
app.use(function (req, res, next) {
  var err = new Error('Filen hittades inte');
  err.status = 404;
  next(err);
});

// felhanterare
// definiera som den sista app.use-callbacken
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log('Servern är startad på http://127.0.0.1:'+PORT);
});
