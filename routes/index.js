var express = require('express');
var router = express.Router();
var session = require('express-session');
var passport = require('passport');
var paypal = require('paypal-rest-sdk');
var async = require('async');
var nodemailer = require('nodemailer');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'ATReG0nf7zHERwgHu7FY8pBjwPmW0jQA97c0L7njKxIo02g3tF5nf7hC2Cr7mDZthwp_aFtHirV9kFP0',
  'client_secret': 'EPTD-PNVhX2MFD71VJlm5oQZnnAxzfuJGO8C-okqGcDsMWNzXxF4owy_ZNO_v_95pwPAXb_ZQ1CZTG0T'
});

var Cart = require('../models/cart');
var Product = require('../models/product');
var Convert = require('../config/convert');
var Order = require('../models/order');
var Discuss = require('../models/discuss');
var Review = require('../models/review');
const User = require('../models/user');

// informations of Nodemailer properties
const shopMail = 'bagconercskh@gmail.com';
const shopPassword = "Bagcornercskh123";
const mailHost = 'smtp.gmail.com';
const mailPort = 465;


// home page
router.get('/', function (req, res, next) {
  Product.find(function (err, data) {
    var productChunks = [];
    var chunksSize = 6;
    for (var i = 0; i < data.length; i += chunksSize) {
      productChunks.push(data.slice(i, i + chunksSize));
    }
    res.render('shop/index', { title: "Bag Corner", products: productChunks });
  });
});

// list product page  
//tui xach
router.get('/product-tuixach', function (req, res, next) {
  Product.find({ type: "Túi xách" }, function (err, data) {
    var productChunks = [];
    var chunksSize = 6;
    for (var i = 0; i < data.length; i += chunksSize) {
      productChunks.push(data.slice(i, i + chunksSize));
    }
    res.render('shop/product-tuixach', { title: "Bag Corner", products: productChunks });
  });
});
//balo 
router.get('/product-balo', function (req, res, next) {
  Product.find({ type: "Balo" }, function (err, data) {
    var productChunks = [];
    var chunksSize = 6;
    for (var i = 0; i < data.length; i += chunksSize) {
      productChunks.push(data.slice(i, i + chunksSize));
    }
    res.render('shop/product-balo', { title: "Bag Corner", products: productChunks });
  });
});
//tuitote
router.get('/product-tuitote', function (req, res, next) {
  Product.find({ type: "Túi tote" }, function (err, data) {
    var productChunks = [];
    var chunksSize = 6;
    for (var i = 0; i < data.length; i += chunksSize) {
      productChunks.push(data.slice(i, i + chunksSize));
    }
    res.render('shop/product-tuitote', { title: "Bag Corner", products: productChunks });
  });
});

router.get('/add-to-cart/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, function (err, product) {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    //console.log(req.session.cart);      
    res.redirect('/');
  });
});

//add item in cart
router.get('/add/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.addByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart')
});

//reduce item in cart
router.get('/reduce/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart')
});

//remove item im cart
router.get('/remove/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart')
});

router.get('/shopping-cart', function (req, res, next) {
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', { products: null });
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice });
});

//checkout payment
router.get('/checkout', isSignedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/checkout', { total: cart.totalPrice });
});

router.post('/checkout', isSignedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var products = cart.generateArray();

  var name = Convert(req.body.name);
  var address = Convert(req.body.address);
  var district = Convert(req.body.district);
  var city = Convert(req.body.city);
  var items = products.map(function (products) {
    return {
      name: products.item.name,
      sku: products.item.name,
      price: products.item.price,
      currency: 'USD',
      quantity: products.qty
    }
  });

  var payType = req.body.paymentMethod;
  // if payment when receiving
  if (payType === "paypal") {
    var create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:3000/checkout_success",
        cancel_url: "http://localhost:3000/checkout"
      },
      transactions: [{
        item_list: {
          items: items,
          shipping_address: {
            recipient_name: name,
            phone: '0987654321',
            line1: address,
            line2: district,
            city: city,
            country_code: "VN",
            postal_code: 100000,
          },
        },
        amount: {
          currency: "USD",
          total: products.reduce(function (totalpay, products,) {
            return totalpay + products.item.price * products.qty;
          }, 0)
        },
        description: "Đơn hàng của Bagcorner Shop.",

      }],

    };

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        console.log(create_payment_json);
        console.log("Create Payment Response");
        console.log(payment);
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            res.redirect(payment.links[i].href);
          }
        }
      }
    });
  }

  // if payment by transfer money  banking
  else if (payType === "banking") {
    var cart = new Cart(req.session.cart);
    var products = cart.generateArray();

    var order = new Order({
      user: req.user,
      cart: cart,
      paymentId: 'df1234ger545543333',
      paymentMethod: "Thanh toán qua tài khoản ngân hàng",
      paymentStatus: "Đã thanh toán",
      deliveryStatus: "Chờ xác nhận",
      inforReceiver: {
        name: name,
        phoneNumber: req.body.phone_number,
        address: address,
        district: district,
        city: city
      }
    });

    order.save(function (err, order) {
      if (err) {
        throw err;
      }
      else {
        var cart = new Cart(order.cart);
        var items = cart.generateArray();
        console.log(items);
        items.forEach(function (element, index, array) {
          //update quantity of sold products
          Product.findById(element.item._id, function (err, result) {
            if (result) {
              result.quantity -= element.qty;
              result.sold += element.qty;
              result.save(function (err) {
                if (err) throw err;
              })
            }
          });
        });

        //update total

        res.render('shop/checkout_success', { inforOrder: order, products: items });
      }
    });
  }
  // if payment when receive product
  else {
    var cart = new Cart(req.session.cart);
    var products = cart.generateArray();

    var order = new Order({
      user: req.user,
      cart: cart,
      paymentId: 'df1234ger545543333',
      paymentMethod: "Thanh toán khi nhận hàng",
      paymentStatus: "Chưa thanh toán",
      deliveryStatus: "Chờ xác nhận",
      inforReceiver: {
        name: name,
        phoneNumber: req.body.phone_number,
        address: address,
        district: district,
        city: city
      }
    });

    order.save(function (err, order) {
      if (err) {
        throw err;
      }
      else {
        var cart = new Cart(order.cart);
        var items = cart.generateArray();
        console.log(items);
        items.forEach(function (element, index, array) {
          //update quantity of sold products
          Product.findById(element.item._id, function (err, result) {
            if (result) {
              result.quantity -= element.qty;
              result.sold += element.qty;
              result.save(function (err) {
                if (err) throw err;
              })
            }
          });
        });

        //update total

        res.render('shop/checkout_success', { inforOrder: order, products: items });
      }
    });
  }


});

//check success: xu ly phan thong tin giao hang
router.get('/checkout_success', isSignedIn, function (req, res, next) {
  var cart = new Cart(req.session.cart);
  var products = cart.generateArray();

  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": products.reduce(function (totalpay, products,) {
          return totalpay + products.item.price * products.qty;
        }, 0)
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      var order = new Order({
        user: req.user,
        cart: cart,
        paymentId: paymentId,
        paymentMethod: "Thanh toán qua Paypal",
        paymentStatus: "Đã thanh toán",
        deliveryStatus: "Chờ xác nhận",
        inforReceiver: {
          name: payment.payer.payer_info.shipping_address.recipient_name,
          phoneNumber: payment.transactions[0].item_list.shipping_phone_number,
          address: payment.payer.payer_info.shipping_address.line1,
          district: payment.payer.payer_info.shipping_address.line2,
          city: payment.payer.payer_info.shipping_address.city
        }
      });
      order.save(function (err, order) {
        if (err) {
          throw err;
        }
        else {
          var cart = new Cart(order.cart);
          var items = cart.generateArray();
          console.log(items);
          items.forEach(function (element, index, array) {
            Product.findById(element.item._id, function (err, result) {
              if (result) {
                result.quantity -= element.qty;
                result.sold += element.qty;
                result.save(function (err) {
                  if (err) throw err;
                })
              }
            });
          });

          res.render('shop/checkout_success', { inforOrder: order, products: items });
        }
      });
    }
  });
});

//detail product page
router.get('/detail-product/:id', function (req, res, next) {
  var product;
  var review;
  async.series([
    function (callback) {
      Product.findById(req.params.id, function (err, data) {
        if (err) {
          throw err;
        }
        else {
          product = data,
          callback(null, data)
        }
      });
    },
    function (callback) {
      Review.find({ productId: req.params.id }, function (err, result) {
        if (err) {
          throw err;
        }
        else {
          review = result;
          console.log(result);
          callback(null, result);
        }
      });
    },
  ],
    function (err) {
      if (err) {
        throw err;
      }
      else {
        // error to show name of user : review.user.information.name
        res.render('shop/detail-product', {
          product: product,
          review: review,
        });
      }
    })
});

//chatbot
router.get('/chatbot', function (req, res, next) {
  res.render('shop/chatbot');
});

//payment method page
router.get('/payment_method', function (req, res, next) {
  res.render('shop/payment_method');
});

//delivery policy page
router.get('/delivery_policy', function (req, res, next) {
  res.render('shop/delivery_policy');
});

//return policy page
router.get('/return_policy', function (req, res, next) {
  res.render('shop/return_policy');
});

// introduction page
router.get('/introduction', function (req, res, next) {
  res.render('shop/introduction');
});

//contact page
router.get('/contact', function (req, res, next) {
  res.render('shop/contact');
});

// send mail of customer
router.post('/send-email', function (req, res, next) {
  var emailCustomer = req.body.from;
  var name = req.body.name;
  var subject = req.body.subject;
  var content = req.body.content;

  var html = "";
  html +=
    `
    <h5>Thắc mắc từ khách hàng của BagCorner shop</h5>
    <p>Khách hàng : ${name}</p>
    <p>Email khách hàng : <strong>${emailCustomer}</strong></p>
    <p>Nội dung email: ${content} </p>
  `;

  const transporter = nodemailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: true,
    auth: {
      user: shopMail,
      pass: shopPassword,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const options = {
    from: emailCustomer,
    to: shopMail,
    subject: subject,
    html: html,
  }
  transporter.sendMail(options, function (err) {
    if (err) {
      throw err;
    }
    else {
      console.log('send email successfull!');
      res.redirect('/');
    }
  });
});

//q&a page
router.get('/q&a', function (req, res, next) {
  Discuss.find(function (err, data) {
    if (err) {
      throw err;
    }
    else {
      res.render("shop/q&a", { discusses: data });
    }
  });
});

// post comment
router.post('/q&a', function (req, res, next) {
  var newDiscuss = new Discuss();
  newDiscuss.like = 0;
  newDiscuss.comment = req.body.comment;
  newDiscuss.name = req.body.name;
  newDiscuss.save(function (err) {
    if (err) throw err;
    else {
      res.redirect('/q&a');
    }
  });
});

// answer comment
router.post('/answer-comment/:id', function (req, res, next) {
  var answerName;
  if (req.body.answerName == "") answerName = "Khách";
  else answerName = req.body.answerName;
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
        res.redirect('../q&a');
      }
    });
});

//contact page
router.get('/discount', function (req, res, next) {
  res.render('shop/discount');
});

// rating product
router.get('/rating-product/:id', function (req, res, next) {
  Product.find({ _id: req.params.id }, function (err, data) {
    if (err) {
      throw err;
    }
    else {
      res.render('shop/rating-product', {
        product: data
      });
    }
  });
});

router.post('/rating-product', function (req, res, next) {
  var newReview = new Review({
    user: req.user,
    productId: req.body.productId,
    ratingNumber: req.body.rating,
    review: req.body.review
  });
  newReview.save(function (err) {
    if (err) {
      throw err;
    }
    else {
      res.redirect('user/profile');
    }
  })
});



function isSignedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}

function notSignedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function requiredSignin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  else {
    var err = new error("Ban can dang nhap de tiep tuc thao tac");
    err.status = 401;
    return next(err);
  }
}

module.exports = router;
