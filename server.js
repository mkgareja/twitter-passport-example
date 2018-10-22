// server.js
// where your node app starts

// set up twitter passport for oauth
// see https://github.com/jaredhanson/passport-twitter
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

// the process.env values are set in .env
passport.use(new TwitterStrategy({
  consumerKey: '4x4FjuiVvqX9eM5KaVA1HCubP',
  consumerSecret: 'QnQe3JVSLqWjSiiZXLRH8pbBhGzIqI8SdkJKcw8dwJyNiyBdtK',
  callbackURL: 'http://c3159baa.ngrok.io/auth/twitter/return',
},
function(token, tokenSecret, profile, cb) {
  return cb(null, profile);
}));
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// init project
var express = require('express');
var app = express();
var expressSession = require('express-session');

// cookies are used to save authentication
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static('public'));
app.use(expressSession({ secret:'watchingferries', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// index route
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// on clicking "logoff" the cookie is cleared
app.get('/logoff',
  function(req, res) {
    res.clearCookie('twitter-passport-example');
    res.redirect('/');
  }
);

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/return', 
  passport.authenticate('twitter', 
    { successRedirect: '/setcookie', failureRedirect: '/' }
  )
);

// on successful auth, a cookie is set before redirecting
// to the success view
app.get('/setcookie',
  function(req, res) {
    console.log(req.user)
    res.cookie('twitter-passport-example', new Date());
    res.redirect('/success');
  }
);

// if cookie exists, success. otherwise, user is redirected to index
app.get('/success',
  function(req, res) {
    if(req.cookies['twitter-passport-example']) {
      res.sendFile(__dirname + '/views/success.html');
    } else {
      res.redirect('/');
    }
  }
);

// listen for requests :)
var listener = app.listen(3001, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
