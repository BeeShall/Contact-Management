var express = require('express');
var router = express.Router();


router.get('/mailer', function(req, res, next) {
  var invalid = false;
  
  
  if(req.session.invalid){
    invalid = true;
    delete req.session.invalid;
  } 
  
  console.log(invalid);
  res.render('mailer',{"invalid": invalid});
});

router.get('/', function(req,res,next){
  res.render('login')
})

router.post('/authenticate', function(req,res,next){
  console.log(req.body.username)
  console.log(req.body.password)
  var passport = req.passport;
  passport.authenticate('local', { successRedirect: '/mailer',
                                     failureRedirect: '/login',
                                  })
})

router.post('/submit', function(req, res, next) {
  var mongo = req.db;
  
  mongo.addContact(req.body, function(done){
    if(done) res.render('success');
    else{
      req.session['invalid'] = true;
      res.redirect('mailer');
    }
  });
});

router.post('/addRecord', function(req,res,next){
  var mongo = req.db;


  mongo.addContact(req.body, function(done, data){
    if(done){
      console.log(data);
      res.send({contact:data});
    }
    else res.send({err:true})

  })
})

router.get('/contacts', function(req,res,next){
  res.render('contacts');
});

router.post('/createUser', function(req,res,next){
  console.log(req)
  req.authenticate.createUser(req.db, req.body.username, req.body.password, function(success){
    if(success){
      res.send("success");
    }
  })
});

router.get('/contactData', function(req, res, next) {
  var mongo = req.db;
  mongo.getAllContacts(function(data){
      console.log(data)
      res.send(data);
  });

});

router.post('/updateContact', function(req,res,next){
    var mongo = req.db;
    mongo.updateContact(req.body, function(done, contact){
      if(!done) res.send({valid:false})
      else{
        contact._id = req.body.id;
        console.log(contact)
        console.log(done)
        res.send({valid: true, contact: contact})
      }
    })
  });

router.post('/deleteContact', function(req,res,next){
  var mongo = req.db;
  mongo.deleteContact(req.body.id,function(done){
    res.send({status:done})
  });

  
})



module.exports = router;
