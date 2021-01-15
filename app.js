var createError = require('http-errors');
var express = require('express');
var path = require('path');
var http = require('http'); 
var socket = require('socket.io');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var  MongoStore = require('connect-mongo')(session);


var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');


var app = express();

var server = http.createServer(app); //create http server
var io = socket(server); // create the socket IO server on

mongoose.connect('mongodb://localhost:27017/project3', {useNewUrlParser: true, useUnifiedTopology: true});
require('./config/passport')(passport);

// view engine setup
app.engine('.hbs',expressHbs({defaultLayout:'layout', extname:'.hbs', runtimeOptions: {
  allowProtoPropertiesByDefault: true,
  allowProtoMethodsByDefault: true
}}));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret:'mysupersecret', 
  resave: false, 
  saveUninitialized: false,  
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  cookie: {maxAge: 30*24*60*60*1000}
}));
app.use(flash());
app.use(passport.initialize());  
app.use(passport.session());
app.use('/static',express.static('public'));

app.use(function(req,res,next){
  res.locals.login = req.isAuthenticated();  
  res.locals.session = req.session;
  next();
});

//routes
app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));  
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app

