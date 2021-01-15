var express = require('express');
var router = express.Router();
var multer = require('multer');
var csrf = require('csurf');
var mongoose = require('mongoose');
var async = require('async');
var { check, validationResult } = require('express-validator');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var storage = require('../config/multer').storage;
var upload = require('../config/multer').upload;

mongoose.connect('mongodb://localhost:27017/project3', { useNewUrlParser: true, useUnifiedTopology: true });

var Product = require('../models/product');
var User = require("../models/user");
var Order = require('../models/order');
var Cart = require('../models/cart');
var Discuss = require('../models/discuss');

var convertTime = require('../config/convertTime');

//csrf token
var csrfProtection = csrf();
router.use(csrfProtection);

//handle breakdown
//svar BreakDown = require('../config/breakdown');

//signin page
router.get('/signin', function (req, res, next) {
    var messages = req.flash('error');
    res.render('admin/signin', {
        csrfToken: req.csrfToken(),
        layout: "../layouts/layout-admin.hbs",
        messages: messages,
        hasErrors: messages.length > 0
    });
});  

router.post('/signin',
    [
        check('email', 'Vui lòng nhập địa chỉ email').notEmpty(),
        check('email', 'Địa chỉ email không hợp lệ').isEmail(),
        check('password', 'Vui lòng nhập mật khẩu').notEmpty(),
    ],
    function (req, res, next) {
        var messages = req.flash('error');   
        const result = validationResult(req);
        var errors = result.errors;
        if (!result.isEmpty()) {
            var messages = [];
            errors.forEach(function (error) {
                messages.push(error.msg);
            });
            res.render('user/signin', {
                csrfToken: req.csrfToken(),
                layout: "../layouts/layout-admin.hbs",
                messages: messages,
                hasErrors: messages.length > 0,
            });
        } else {
            next();
        }
    },
    passport.authenticate('local-signin-admin', {
        failureRedirect: '/user/signin',
        failureFlash: true
    }), function (req, res, next) {
        if (req.session.oldUrl) {
            console.log(req.user);
            var oldUrl = req.session.oldUrl;
            req.session.oldUrl = null;
            res.redirect(oldUrl);
        }
        else {
            res.redirect('/admin/profile')
        }
    });

//list-product page
router.get('/list-product', isSignedIn, isAdmin, function (req, res, err) {
    var product_1;
    var product_2;
    var product_3;

    async.series([
        function (callback) {
            Product.find({ type: "Túi xách" }, function (err, product_type1) {
                if (err) {
                    return callback(err);
                }
                else {
                    product_1 = product_type1;
                    callback(null, product_type1);
                }
            });
        },
        function (callback) {
            Product.find({ type: "Túi tote" }, function (err, product_type2) {
                if (err) {
                    return callback(err);
                }
                else {
                    product_2 = product_type2;
                    callback(null, product_type2);
                }
            });
        },
        function (callback) {
            Product.find({ type: "Balo" }, function (err, product_type3) {
                if (err) {
                    return callback(err);
                }
                else {
                    product_3 = product_type3;
                    callback(null, product_type3);
                }
            });
        },
    ],
        function (err) {
            if (err) {
                throw err;
            }
            else {
                res.render('admin/list-product', {
                    csrfToken: req.csrfToken(),
                    layout: "../layouts/layout-admin.hbs",
                    product_1: product_1,    
                    product_2: product_2,
                    product_3: product_3,

                });
            }
        });
});

// add-product page
router.get("/add-product", isSignedIn, isAdmin,
    function (req, res, next) {
        var messages = req.flash('error');
        res.render('admin/add-product', {
            csrfToken: req.csrfToken(),
            layout: "../layouts/layout-admin.hbs",
            messages: messages,
            hasErrors: messages.length > 0,
        });
    });

router.post("/add-product", isSignedIn, isAdmin, function (req, res, next) {
    //upload file  
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            res.json({ "kq": 0, "errMsg": "A Multer error ocurred when uploading." });
        }
        else if (err) {
            res.json({ "kq": 0, "erMsg": "An unknown error occurred when uploading." });
        }
        else {
            // save to mongoose
            var newProduct = new Product();
            newProduct.name = req.body.name;
            newProduct.type = req.body.type;
            newProduct.price = req.body.price;
            newProduct.imagePath = req.file.filename;
            newProduct.description = req.body.description;
            newProduct.quantity = req.body.quantity;
            newProduct.sold = 0,
                newProduct.save(function (err) {
                    if (err) {
                        throw err;
                    } else {
                        res.redirect("/admin/list-product");
                    }
                });
        }
    });
});

//profile admin
router.get("/profile",isSignedIn, isAdmin, function(req,res,next){
    User.find({_id: req.user._id}, function(err, data){
        if(err){
            throw err;
        }
        else {
            res.render("admin/profile", {
                layout: "../layouts/layout-admin.hbs",
                infor_user: data});
        }
    });
})

// update profile admin
router.get("/update-profile",isSignedIn,isAdmin, function(req,res,next){
    User.find({_id: req.user._id}, function(err, data){
        if(err){
            throw err;
        }
        else {
            res.render("admin/update-profile", {
                layout: "../layouts/layout-admin.hbs",
                csrfToken: req.csrfToken(),
                inforUser: data});
        }
    });
});

router.post('/update-profile',isSignedIn,isAdmin, function(req,res,next){
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
    
            res.redirect('/admin/profile');
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
              res.redirect('/admin/profile');
            }
          });
        }
      }
    });
  });

//edit-product page
router.get("/edit-product/:id", isSignedIn, isAdmin, function (req, res, next) {
    Product.findById(req.params.id, function (err, data) {
        if (err) {
            throw err;
        } else {
            res.render("admin/edit-product", {
                csrfToken: req.csrfToken(),
                layout: "../layouts/layout-admin.hbs",
                editedProduct: data,
            });
        }
    });
});

router.post("/edit-product", isSignedIn, isAdmin, function (req, res, next) {
    upload(req, res, function (err) {
        if (!req.file) {
            Product.updateOne({ _id: req.body.IDChar }, {
                name: req.body.name,
                price: req.body.price,
                type: req.body.type,
                description: req.body.description,
                quantity: req.body.quantity,
            }, function (err) {
                if (err) {
                    throw err;
                } else {
                    res.redirect("/admin/list-product");
                }
            });
        }
        else {
            if (err instanceof multer.MulterError) {
                res.json({ "kq": 0, "errMsg": "A Multer error ocurred when uploading." });
            }
            else if (err) {
                res.json({ "kq": 0, "erMsg": "An unknown error ocurred when uploading." });
            }
            else {
                Product.updateOne({ _id: req.body.IDChar }, {
                    name: req.body.name,
                    imagePath: req.file.filename,
                    price: req.body.price,
                    type: req.body.type,
                    description: req.body.description,
                    quantity: req.body.quantity,
                }, function (err) {
                    if (err) {
                        res.json({ "message": "error" });
                    } else {
                        res.redirect("/admin/list-product");
                    }
                });

            }
        }

    });

});

//delete a product

router.get("/delete-product/:id", isSignedIn, isAdmin, function (req, res, next) {
    Product.deleteOne({ _id: req.params.id }, function (err) {
        if (err) {
            throw err;
        } else {
            res.redirect("../list-product");
        }
    });
});

// list user
router.get('/list-user', isSignedIn, isAdmin, function (req, res, err) {
    var user_silver;
    var user_gold;
    var user_diamon;

    async.series([
        function (callback) {
            User.find({ rule: 1 }, function (err, user_type1) {
                if (err) {
                    return callback(err);
                }
                else {
                    user_silver = user_type1;
                    callback(null, user_type1);
                }
            });
        },
        function (callback) {
            Product.find({ rule: 1 }, function (err, user_type2) {
                if (err) {
                    return callback(err);
                }
                else {
                    user_gold = user_type2;
                    callback(null, user_type2);
                }
            });
        },
        function (callback) {
            Product.find({ rule: 1 }, function (err, user_type3) {
                if (err) {
                    return callback(err);
                }
                else {
                    user_diamon = user_type3;
                    callback(null, user_type3);
                }
            });
        },
    ],
        function (err) {
            if (err) {
                throw err;
            }
            else {
                res.render('admin/list-user', {
                    csrfToken: req.csrfToken(),
                    layout: "../layouts/layout-admin.hbs",
                    user_silver: user_silver,
                    user_gold: user_gold,
                    user_diamon: user_diamon
                });
            }
        });
});


//list admin 
router.get('/list-admin', isSignedIn, isAdmin, function (req, res, next) {
    User.find({ rule: 2 }, function (err, admin) {
        if (err) {
            throw err;
        }
        else {
            res.render('admin/list-admin', {
                csrfToken: req.csrfToken(),
                layout: "../layouts/layout-admin.hbs",
                admin: admin
            });
        }
    });
});

// add account admin
router.get('/add-admin', isSignedIn, isAdmin, function (req, res, next) {
    var messages = req.flash('error');
    res.render('admin/add-admin', {
        csrfToken: req.csrfToken(),
        layout: "../layouts/layout-admin.hbs",
        messages: messages,
        hasErrors: messages.length > 0
    });
});

router.post('/add-admin', isSignedIn, isAdmin,
    [
        check('email', 'Vui lòng nhập địa chỉ email').notEmpty(),
        check('email', 'Địa chỉ email không hợp lệ').isEmail(),
        check('password', 'Vui lòng nhập mật khẩu').notEmpty(),
        check('password', 'Mật khẩu 6-16 ký tự').isLength({ min: 6 }),
        check('password', 'Mật khẩu từ 6-16 ký tự').isLength({ max: 16 })
    ],
    function (req, res, next) {
        var messages = req.flash('error');
        const result = validationResult(req);
        var errors = result.errors;
        if (!result.isEmpty()) {
            var messages = [];
            errors.forEach(function (error) {
                messages.push(error.msg);
            });
            res.render('admin/add-admin', {
                csrfToken: req.csrfToken(),
                messages: messages,
                hasErrors: messages.length > 0,
            });
        } else {
            next();
        }
    },
    passport.authenticate('local-add-admin', {
        successRedirect: '/admin/list-admin',
        failureRedirect: '/admin/add-admin',
        failureFlash: true
    }));

//delete account-admin

router.get("/delete-admin/:id", isSignedIn, isAdmin, function (req, res, next) {
    User.deleteOne({ _id: req.params.id }, function (err) {
        if (err) {
            throw err;
        } else {
            res.redirect("../list-admin");
        }
    });
});

//detail information of admin
router.get('/detail-admin/:id', isSignedIn, isAdmin, function (req, res, next) {
    User.findById(req.params.id, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            res.render('admin/detail-admin', {
                layout: "../layouts/layout-admin.hbs",
                infor: data,
            })
        }
    });
});

//detail information of user
router.get('/detail-user/:id', isSignedIn, isAdmin, function (req, res, next) {
    var infor_user;
    var infor_order;


    async.series([
        function (callback) {
            User.findById(req.params.id, function (err, infor) {
                if (err) {
                    return callback(err);
                }
                else {
                    infor_user = infor;
                    callback(null, infor);
                }
            });
        },
        function (callback) {
            Order.find({ user: { _id: req.params.id } }, function (err, orders) {
                if (err) {
                    return callback(err);
                }
                else {
                    var cart;
                    orders.forEach(function (order) {
                        cart = new Cart(order.cart);
                        order.items = cart.generateArray();
                    });
                    infor_order = orders;
                    callback(null, orders);
                }
            });
        }
    ],
        function (err) {
            if (err) {
                throw err;
            }
            else {
                res.render('admin/detail-user', {
                    layout: "../layouts/layout-admin.hbs",
                    infor_user: infor_user,
                    infor_order: infor_order
                })
            }
        });
});

//delete account-admin

router.get("/delete-user/:id", isSignedIn, isAdmin, function (req, res, next) {
    User.deleteOne({ _id: req.params.id }, function (err) {
        if (err) {
            throw err;
        } else {
            res.redirect("../list-user");
        }
    });
});

//list payments page
router.get('/list-payment', isSignedIn, isAdmin, function (req, res, next) {
    var order_type1;
    var order_type2;
    var order_type3;
    var order_type4;
    async.series([
        function (callback) {
            Order.find({ deliveryStatus: "Chờ xác nhận" }, function (err, order_1) {
                if (err) {
                    return callback(err);
                }
                else {
                    order_type1 = order_1;
                    callback(null, order_1);
                }
            });
        },
        function (callback) {
            Order.find({ deliveryStatus: "Đã xác nhận" }, function (err, order_2) {
                if (err) {
                    return callback(err);
                }
                else {
                    order_type2 = order_2;
                    callback(null, order_2);
                }
            });
        },
        function (callback) {
            Order.find({ deliveryStatus: "Đang giao hàng" }, function (err, order_3) {
                if (err) {
                    return callback(err);
                }
                else {
                    order_type3 = order_3;
                    callback(null, order_3);
                }
            });
        },
        function (callback) {
            Order.find({ deliveryStatus: "Giao hàng thành công" }, function (err, order_4) {
                if (err) {
                    return callback(err);
                }
                else {
                    order_type4 = order_4;
                    callback(null, order_4);
                }
            });
        }],
        function (err) {
            if (err) {
                throw err;
            }
            else {
                for (let i = 0; i < order_type1.length; i++) {
                    order_type1[i].createAt = convertTime(order_type1[i].createAt);
                }                
                for (let i = 0; i < order_type3.length; i++) {
                    order_type3[i].createAt = convertTime(order_type3[i].createAt);
                }
                for (let i = 0; i < order_type2.length; i++) {
                    order_type2[i].createAt = convertTime(order_type2[i].createAt);
                }
                for (let i = 0; i < order_type4.length; i++) {
                    order_type4[i].createAt = convertTime(order_type4[i].createAt);
                }
                res.render('admin/list-payment', {
                    csrfToken: req.csrfToken(),
                    layout: "../layouts/layout-admin.hbs",
                    order_type1: order_type1,
                    order_type2: order_type2,
                    order_type3: order_type3,
                    order_type4: order_type4
                });
            }
        });
    // Order.find({deliveryStatus: "Chờ xác nhận"}, function(err,data) {
    //     if(err) {
    //         throw err;
    //     }
    //     else {
    //         for(var i = 0; i<data.length; i++) {
    //             data[i].createAt = convertTime(data[i].createAt);
    //         }
    //         res.render('admin/list-payment', 
    //         {csrfToken: req.csrfToken(),
    //         order_type1: data,
    //         });
    //     }
    // });
});

router.get('/detail-payment/:id', isSignedIn, isAdmin, function (req, res, next) {
    Order.findById(req.params.id, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            res.render('admin/detail-payment', {
                layout: "../layouts/layout-admin.hbs",
                infor: data,
            })
        }
    });
})

//update status of delivery payment
router.get('/confirm-payment/:id', isSignedIn, isAdmin, function (req, res, next) {
    Order.updateOne({ _id: req.params.id }, {
        deliveryStatus: "Đã xác nhận",
    }, function (err) {
        if (err) {
            throw err;
        } else {
            res.redirect("../list-payment");
        }
    });
});

router.get('/delivery-payment/:id', isSignedIn, isAdmin, function (req, res, next) {
   
    Order.updateOne({ _id: req.params.id }, {
        deliveryStatus: "Đang giao hàng"
    }, function (err) {
        if (err) {
            throw err;
        } else {
            res.redirect("/admin/list-payment");
        }
    });
});

router.get('/compelete-payment/:id', isSignedIn, isAdmin, function (req, res, next) {
    Order.updateOne({ _id: req.params.id }, {
        deliveryStatus: "Giao hàng thành công"
    }, function (err) {
        if (err) {
            throw err;
        } else {
            res.redirect("/admin/list-payment");
        }
    });
});

router.get('/delete-payment/:id', isSignedIn, isAdmin, function (req, res, next) {
    Order.deleteOne({ _id: req.params.id }, function (err) {
        if (err) {
            throw err;
        } else {
            res.redirect("../list-payment");
        }
    });
});


//q&a page
router.get('/q&a', isSignedIn, isAdmin, function (req, res, next) {
    Discuss.find(function (err, data) {
        if (err) {
            throw err;
        } else {
            res.render("admin/q&a", {
                layout: "../layouts/layout-admin.hbs",
                csrfToken: req.csrfToken(),
                discusses: data,
            });
        }
    });
});

// error token
router.post('/q&a/:id', function (req, res, next) {
    var answerName = req.user.information.name + '(admin)';
    // add reply to comment of guest
    Discuss.updateOne({ _id: req.body.IDChar },
        {
            $push: {
                answer: {
                    name: answerName,
                    comment: req.body.answerComment,
                }
            }
        }, { new: true }
        , function (err) {
            if (err) {
                throw err;
            }
            else {
                res.redirect('../../admin/q&a');
            }
        });
});


function isSignedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    response.redirect('/');
}

function notSignedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}


function isAdmin(req, res, next) {
    if (req.user.rule === 2) {
        return next();
    }
    else {
        res.flash('', 'Bạn không thể truy nhập trang này');
        res.redirect('/');
    }
}


module.exports = router;
