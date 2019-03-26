var db = require("../models");
var axios = require("axios")
var passport = require("passport");
var bcrypt = require("bcrypt");
var authorizeUser = require("../config/authorizeUser");
var Op = db.Sequelize.Op
module.exports = function(app) {
  // Get all examples
  app.get("/api/search/:search",authorizeUser, function(req, res) {
    var url = "https://www.googleapis.com/customsearch/v1?key="+ process.env.API_KEY + "&cx=" + process.env.CSE_ID + "&q=" + req.params.search;
    axios.get(url).then(function(results){
      console.log(results.data.items);
      res.json(results.data.items);
    }).catch(function(err){
      console.log(err)
    })
  });
  //create new event
  app.post("/api/event/",authorizeUser, function(req, res) {
    
   
  });
  // Create a new list item
  app.post("/api/event/:id", authorizeUser,function(req, res) {
  });

  app.post("/api/register", function(req,res){
    var hashedPW = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
    db.User.findOne({where:{
      [Op.or]:[
        {
          username:req.body.username
        }, 
        {
          email:req.body.email
        }
      ]}
      }).then(function(user){
        if (user)
        {
          res.redirect("/register")
        }
        else
        {
          db.User.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPW
        })
        res.redirect("/login")
      }
    })
  });
       
  app.post("/api/login", passport.authenticate('local', {
      successRedirect: '/home',
      failureRedirect: '/login',
    })
  );
  // // Delete an example by id
  // app.delete("/api/examples/:id", function(req, res) {
    

  // });
};
