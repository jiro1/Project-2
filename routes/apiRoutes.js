var db = require("../models");
var axios = require("axios")
var passport = require("passport");
var bcrypt = require("bcrypt");
var authorizeUser = require("../config/authorizeUser");
var Op = db.Sequelize.Op
var path = require("path");
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

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect("login");

  });


  //create new event
  app.post("/api/event/create",authorizeUser, function(req, res) {
    var userId = req.user.id;
   db.User.findByPk(userId).then(function(user){
     if (user)
     {
       user.createEvent({
         name: req.body.name,
         dateTime: req.body.dateTime,
         phoneNumber: req.body.phoneNumber
       }).then(function(event){
         res.redirect("/event/create/" + event.dataValues.id)
       })

     }
   })
  });
  // Create a new list item
  app.post("/api/event/add", authorizeUser,function(req, res) {
    var eventId = req.body.event_id;
    console.log(eventId);
    db.Event.findByPk(eventId).then(function(event){
      console.log(event);
      if (event)
      {
        event.createItem({
          image_link: req.body.image_link,
          item: req.body.item,
          description: req.body.description
        })
      }
    })
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
  app.post("/api/event/item", function(req, res){
    db.Item.findByPk(req.body.id).then(function(item){
      if(item)
      {
        item.update({isBrought:req.body.isBrought})
      }
    })
  })
  app.get("/api/event/:id", function(req,res){
    console.log("here");
    event_id = parseInt(req.params.id)
    db.Item.findAll({where:{EventId:event_id,isBrought:false}})
    .then( function(items){
      if(items)
      {
        res.json(items);
      }
    })
  });

  app.post("/api/login", passport.authenticate('local', {
      successRedirect: "/home",
      failureRedirect: "/login",
    })
  );
  // // Delete an example by id
  // app.delete("/api/examples/:id", function(req, res) {
    

  // });
};
