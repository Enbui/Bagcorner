var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;



module.exports = function(passport) {

    passport.serializeUser(function(user,done){
        done(null,user.id);
    });
    
    passport.deserializeUser(function(id,done){
        User.findById(id,function(err,user) {
            done(err,user);
        });
    });     

    // local signup

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req,email,password,done){
        process.nextTick(function(){
            User.findOne({'local.email': email}, function(err, user){
                if(err){ 
                    return done(err);
                } 
                if(user){
                    return done(null, false, req.flash('error', 'Email này đã được đăng ký'));     

                } else {
                    var newUser = new User();
                    newUser.local.email = email;
                    newUser.local.password = newUser.encryptPassword(password);
                    newUser.rule = 1;
                    newUser.save(function(err) {
                        if(err) {
                            done(err);    
                        }
                        newUser.set('totalCost',0);
                        return done(null, newUser);
                    });
                }
            });
        });
    }));  

    //local add admin-acount

    passport.use('local-add-admin', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req,email,password,done){
        process.nextTick(function(){
            User.findOne({'local.email': email}, function(err, user){
                if(err){ 
                    return done(err);
                } 
                if(user){
                    return done(null, false, req.flash('error', 'Email này đã được đăng ký'));     

                } else {
                    var newUser = new User();
                    newUser.local.email = email;
                    newUser.local.password = newUser.encryptPassword(password);
                    newUser.rule = 2;
                    newUser.save(function(err) {
                        if(err) {
                            done(err);    
                        }
                        return done(null, newUser);
                    });
                }
            });
        });
    })); 

    // local signin user
    
    passport.use('local-signin-user', new LocalStrategy({   
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req,email,password,done){
        process.nextTick(function(){
            User.findOne({'local.email': email, rule : 1}, function(err, user){
                if(err){ 
                    return done(err);
                } 
                if(!user){
                    return done(null, false, req.flash('error', 'Email này chưa được đăng ký'));     

                }
                
                return done(null,user);
            });
        });
    }));

     // signin admin

    passport.use('local-signin-admin', new LocalStrategy({   
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req,email,password,done){
        process.nextTick(function(){
             User.findOne({'local.email': email, rule : 2}, function(err, user){
                 if(err){ 
                      return done(err);
                  } 
                  if(!user){
                      return done(null, false, req.flash('error', 'Email này chưa được đăng ký'));     

                  }
            
                 return done(null,user);
            });
         });
    }));

};   






 