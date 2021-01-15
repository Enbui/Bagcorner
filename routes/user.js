var express = require('express');
var router = express.Router();
var multer = require('multer');
var session = require('express-session');
var csrf = require('csurf');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var {check, validationResult} = require('express-validator');
var async = require('async');
const { response } = require('../app');

var storage =  require('../config/multer').storage;
var upload = require('../config/multer').upload;

var csrfProtection = csrf();
router.use(csrfProtection);

var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user');

//profile page
router.get('/profile',isSignedIn, function (req,res,next) {
    var infor_user;
    var infor_order_1;
    var infor_order_2;
    var infor_order_3;
    var infor_order_4;

    async.series([
      function(callback){
        Order.find({user: req.user,deliveryStatus: "Chờ xác nhận"},function(err,orders1){
          if(err) {
           return callback(err);
          }
          else {
            var cart;
            orders1.forEach(function(order){
              cart = new Cart(order.cart);
              order.items = cart.generateArray();
            });
            infor_order_1 = orders1;
            callback(null,orders1);
          }
        });
      },
      function(callback){
        Order.find({user: req.user,deliveryStatus: "Đã xác nhận"},function(err,orders2){
          if(err) {
           return callback(err);
          }
          else {
            var cart;
            orders2.forEach(function(order){
              cart = new Cart(order.cart);
              order.items = cart.generateArray();
            });
            infor_order_2 = orders2;
            callback(null,orders2);
          }
        });
      },
      function(callback){
        Order.find({user: req.user,deliveryStatus: "Đang giao hàng"},function(err,orders3){
          if(err) {
           return callback(err);
          }
          else {
            var cart;
            orders3.forEach(function(order){
              cart = new Cart(order.cart);
              order.items = cart.generateArray();
            });
            infor_order_3 = orders3;
            callback(null,orders3);
          }
        });
      },
      function(callback){
        Order.find({user: req.user,deliveryStatus: "Giao hàng thành công"},function(err,orders4){
          if(err) {
           return callback(err);
          }
          else {
            var cart;
            orders4.forEach(function(order){
              cart = new Cart(order.cart);
              order.items = cart.generateArray();
            });
            infor_order_4 = orders4;
            callback(null,orders4);
          }
        });
      },
      function(callback){
        User.find({local : req.user.local}, function(err, infor){
          if(err) {
            return callback(err);
          }
          else {
            infor_user = infor;
            callback(null, infor);
          }
        });
      }
    ],function(err){
      if(err) {
        throw err;
      }
      else{
        res.render('user/profile', {
          infor_order_1 : infor_order_1,
          infor_order_2 : infor_order_2,
          infor_order_3 : infor_order_3,
          infor_order_4 : infor_order_4,
          infor_user : infor_user
        });
      }
    });
  });

router.post('/profile', isSignedIn, function(req,res,next){
  res.redirect('/');
});

//update profile page 
router.get('/update-profile',isSignedIn, function (req,res,next) {
  User.findOne({_id: req.user._id},function(err,data){
    if(err) {
      throw err;    
    }
    else {
      res.render('user/update-profile',{
        csrfToken: req.csrfToken(),
        inforUser : data,
      });
    }
  });
});

router.post('/update-profile',isSignedIn, function(req,res,next){
  upload(req,res,function(err){
    if(!req.file) {
      User.updateOne({_id: req.user._id},{
        information : {
          name: req.body.name,
          birthday: req.body.birthday,
          gendle: req.body.gendle,
          address: req.body.address,
          phoneNumber : req.body.phone_number
        }
      }, function(err){
        if(err) {
          throw err;
        }
        else {
  
          res.redirect('/user/profile');
        }
      });
    }
    else {
      if(err instanceof multer.MulterError) {
        res.json({"errMsg": "A Multer error ocurred when uploading"});
      }
      else if(err) {
        throw err;
      }
      else {
        User.updateOne({_id:req.user._id}, {
          information : {
            avatar: req.file.filename,
            name: req.body.name,
            birthday: req.body.birthday,
            gendle: req.body.gendle,
            address: req.body.address,
            phoneNumber : req.body.phone_number
          }
        }, function(err) {
          if(err) {
            throw err;
          }
          else {
            res.redirect('/user/profile');
          }
        });
      }
    }
  });
});

// change password
router.get('/change-password', isSignedIn, function(req,res,next){
  var messages = req.flash('error');
  res.render('user/change-password', {
    csrfToken: req.csrfToken(), 
    messages: messages, 
    hasErrors: messages.length>0
  });
});

router.post('/change-password',isSignedIn, function(req,res,next){
  var old_password = req.body.old_password;
  var new_password = req.body.new_password;
  var re_password = req.body.re_password;
  var password = req.user.encryptPassword(new_password);
  if(old_password != req.user.local.password) {
    req.flash("mật khẩu không chính xác, vui lòng nhập lại");
  }
  else if(new_password != re_password) {
    req.flash("Mật khẩu mới không trùng khớp, vui lòng nhập lại");
  }
  else {
    User.findOneAndUpdate({_id: req.user._id}, {
      local : {
        email: req.user.local.email,
        password : password
      }
    }, {new: true}, function(err){
      if(err) {
        throw err;
      }
      else {
        res.redirect('/user/profile');
      }
    });
  }
  
});

//logout page
router.get('/logout', isSignedIn, function(req,res, next){
    req.logout();
    res.redirect('/');
});

router.use('/', notSignedIn, function(req,res,next){
    next();
});

// signup page
router.get('/signup', function(req,res, next) {
    var messages = req.flash('error');
    res.render('user/signup', {
      csrfToken: req.csrfToken(), 
      messages: messages, 
      hasErrors: messages.length>0
    });
  });
  
router.post('/signup',
  [
    check('email', 'Vui lòng nhập địa chỉ email').notEmpty(),
    check('email','Địa chỉ email không hợp lệ').isEmail(),
    check('password', 'Vui lòng nhập mật khẩu').notEmpty(),
    check('password','Mật khẩu 6-16 ký tự').isLength({min: 6}),
    check('password', 'Mật khẩu từ 6-16 ký tự').isLength({max: 16})
  ],
  function(req,res,next){
    var messages = req.flash('error');
    const result = validationResult(req);
    var errors = result.errors;
    if(!result.isEmpty()){
      var messages = [];
      errors.forEach(function(error){
        messages.push(error.msg);
      });
      res.render('user/signup', { 
        csrfToken: req.csrfToken(),            
        messages: messages,
        hasErrors: messages.length >0,
      });
    } else {   
      next();   
    }
  },  
  passport.authenticate('local-signup', {
    failureRedirect: '/user/signup',
    failureFlash: true
  }),function(req,res,next){
    if(req.session.oldUrl){     
      var oldUrl = req.session.oldUrl;
      req.session.oldUrl = null;
      res.redirect(oldUrl);  
    }
    else {
      res.redirect('/user/profile')
    }
  });
  
  //signin page
  router.get('/signin', function(req,res, next) {
    var messages = req.flash('error');
    res.render('user/signin', {
      csrfToken: req.csrfToken(), 
      messages: messages, 
      hasErrors: messages.length>0
    });
  });
  
  router.post('/signin',
[
  check('email', 'Vui lòng nhập địa chỉ email').notEmpty(),
  check('email','Địa chỉ email không hợp lệ').isEmail(),
  check('password', 'Vui lòng nhập mật khẩu').notEmpty(),
],
function(req,res,next){
  var messages = req.flash('error');
  const result = validationResult(req);
  var errors = result.errors;
  if(!result.isEmpty()){
    var messages = [];
    errors.forEach(function(error){
      messages.push(error.msg);
    });
    res.render('user/signin', { 
      csrfToken: req.csrfToken(),            
      messages: messages,
      hasErrors: messages.length >0,
    });
  } else {
    next();
  }     
},  
passport.authenticate('local-signin-user', {
  failureRedirect: '/user/signin',
  failureFlash: true
}),function(req,res,next){
  if(req.session.oldUrl){
    console.log(req.user);
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);   
  }
  else {
    res.redirect('/user/profile')
  }
});


function isSignedIn(req,res,next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notSignedIn (req,res,next) {
    if(!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function isUser(req,res, next) {
  if(req.user.rule === 1) {
    return next();
  }
  else {
    res.flash('', 'Bạn không thể truy nhập trang này');
    res.redirect('/');
  }
}


       
module.exports = router;