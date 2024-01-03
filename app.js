// Include your required packages and configurations at the top
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: 'keyboard cat.',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1/userDB");
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  secret: [String]
});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/secrets", function(req, res) {
  // if (req.isAuthenticated()) {
  //   res.render("secrets");
  // } else {
  //   res.redirect("/login");
  // }
  User.find({ "secret": { $ne: null } }).then(foundUsers => {
    if (foundUsers) {
      res.render("secrets", { usersWithSecrets: foundUsers });
    }
  }).catch(err => {
    console.log(err);
    // Handle the error appropriately, maybe send an error response
    res.status(500).send("Error occurred while fetching users with secrets.");
  });


});

app.get("/submit", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

app.post("/submit", function(req, res) {
  const submittedSecret = req.body.secret;
  User.findById(req.user.id)
    .then((foundUser) => {
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save();
      }
    })
    .then(() => {
      res.redirect("/secrets");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error occurred while saving the secret.");
    });
});

app.get("/logout", function(req, res) {
  req.logout(function(err) {
    if (err) {
      console.error(err);
    }
    res.redirect("/");
  });
});



app.post("/register", function(req, res) {
  User.register({ username: req.body.username }, req.body.password, function(err, user) {
    if (err) {
      console.error(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }
  });
});

app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.error(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});






















// //jshint esversion:6
// require('dotenv').config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const ejs = require("ejs");
// const mongoose = require('mongoose');
// const session=require('express-session');
// const passport=require('passport');
// const passportLocalMongoose=require('passport-local-mongoose');
//
// // const bcrypt= require('bcrypt');
// // const saltRounds=10;
// // const md5 = require('md5');
// // const encrypt = require('mongoose-encryption');
//
// const app = express();
//
// console.log(process.env.API_KEY);
//
// app.set('view engine', 'ejs');
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
// app.use(express.static("public"));
//
//
//
//
// app.use(session({
//   secret: 'keyboard cat.',
//   resave: false,
//   saveUninitialized: true
// }));
// app.use(passport.initialize());
// app.use(passport.session());
//
// mongoose.connect("mongodb://127.0.0.1/userDB");
// const userSchema=new mongoose.Schema(
//   {
//     email:String,
//     password:String,
//     secret:String
//   }
// );
// userSchema.plugin(passportLocalMongoose);
//
// // const secret="Thisisoursecret";
// // userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptesFields:["password"] });
//
// const User=new mongoose.model("User",userSchema);
//
// passport.use(User.createStrategy());
//
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
//
// app.get("/",function(req,res){
//   res.render("home");
// })
// app.get("/login",function(req,res){
//   res.render("login");
// })
// app.get("/register",function(req,res){
//   res.render("register");
// })
// app.get("/submit",function(req,res){
//   if (req.isAuthenticated()) {
//     res.render("submit");
//   } else {
//     res.redirect("/login");
//   }
// })
//
// app.post("/submit", function (req, res) {
//   const submittedSecret = req.body.secret;
//   User.findById(req.user.id)
//     .then((foundUser) => {
//       if (foundUser) {
//         foundUser.secret = submittedSecret;
//         return foundUser.save();
//       }
//     })
//     .then(() => {
//       res.redirect("/secrets");
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send("Error occurred while saving the secret.");
//     });
// });
//
//
// app.get("/logout", function(req, res) {
//   req.logout(function(err) {
//     if (err) {
//       console.error(err);
//       res.redirect("/"); // Redirect to home or any other page
//     } else {
//       res.redirect("/"); // Redirect to home or any other page after logout
//     }
//   });
// });
//
// app.get("/secrets", function(req, res) {
//   if (req.isAuthenticated()) {
//     res.render("secrets");
//   } else {
//     res.redirect("/login");
//   }
// });
//
// app.post("/register", function(req, res) {
//
//   User.register({ username: req.body.username }, req.body.password, function(err, user) {
//     if (err) {
//       console.error(err);
//       res.redirect("/register");
//       // res.send("Error occurred while registering.");
//     } else {
//       // If registration is successful, authenticate the user and redirect
//       passport.authenticate("local")(req, res, function() {
//         res.redirect("/secrets");
//       });
//     }
//   });
//   // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//   //   if (err) {
//   //     console.error(err);
//   //     res.send("Error occurred while registering.");
//   //     return;
//   //   }
//   //
//   //   const newUser = new User({
//   //     email: req.body.username,
//   //     password: hash // Save the hashed password
//   //   });
//   //
//   //   newUser.save()
//   //     .then(() => {
//   //       res.render("secrets");
//   //     })
//   //     .catch(err => {
//   //       console.error(err);
//   //       res.send("Error occurred while registering.");
//   //     });
//   // });
//
//
// });
// app.post("/login", function(req, res) {
//
//   const user=new User({
//     username : req.body.username,
//     password : req.body.password
//   });
//
//
//   req.login(user, function(err){
//     if(err){
//       console.log(err);
//     }
//     else{
//       passport.authenticate("local")(req,res,function(){
//         res.redirect("/secrets");
//       });
//
//     }
//   })
//
//   // const username = req.body.username;
//   // const password = req.body.password;
//   //
//   // User.findOne({ email: username })
//   // .then((foundUser) => {
//   //   if (foundUser) {
//   //     // Compare the entered password with the stored hashed password
//   //     bcrypt.compare(password, foundUser.password, function(err, result) {
//   //       if (err) {
//   //         console.error(err);
//   //         res.send("Error occurred while logging in.");
//   //         return;
//   //       }
//   //       if (result === true) {
//   //         res.render("secrets");
//   //       } else {
//   //         res.send("Incorrect password");
//   //       }
//   //     });
//   //   } else {
//   //     res.send("User not found");
//   //   }
//   // })
//   // .catch((err) => {
//   //   console.error(err);
//   //   res.send("Error occurred while logging in.");
//   // });
//
// });
//
//
//
//
//
//
// app.listen(3000, function() {
//   console.log("Server started on port 3000");
// });
