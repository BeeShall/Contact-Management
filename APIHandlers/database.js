var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var Geocoder = require("./geocode.js");
var db;
var url = 'mongodb://localhost:27017/contacts';
MongoClient.connect(url, function(err, database) {
  if(!err){
    console.log("Connected correctly to server.");
    db = database;
  }
  else{
    console.log("Cannot connect to db");
  }
});

exports.createUser = function(userName, password, callBack){
  db.collection('users').insertOne({username:userName, password: password}, function(err, results){
    if(!err){
      console.log("Username created")
      callBack(true);
    } 
    else console.log(err)
  })
}

function createRecord(formData){
  
    var record = formData;
    var contact = formData["contact"];
    record["contactByPhone"] = false;
    record["contactByEmail"] = false;
    record["contactByMail"] = false;
    
    if(!Array.isArray(contact)){
      contact = [contact];
    }
    
    for(var i in contact){
      if(contact[i] === "Phone") record["contactByPhone"] = true;
      else if(contact[i] === "Email") record["contactByEmail"] = true;
      else if(contact[i] === "Mail") record["contactByMail"] = true;
    }
    
    delete record["contact"];
    console.log(record)
    return record;
}

function contactHelper(data, callBack){
  var address = data["street"] + " ," + data["city"]+ " "+ data["state"] + " "+data["zip"];
  Geocoder.getCoords(address, function(coords){
    if(coords == null){
      callBack(false,null);
      return;
    } 
    var record = createRecord(data);
    record["coords"] = coords;
    callBack(true, record)
      
  })
}

exports.addContact = function(formData, done){
  console.log("here")
  contactHelper(formData, function(status, record){
    if(!status){
      done(false)
      return;
    }
    console.log(record)
     db.collection('contacts').insertOne(record, function(err, result){
       if(!err) {
         console.log("Result")
         done(true, result.ops[0]);
       }
       else console.log("Error inserting file")
      });
  })
}


exports.updateContact = function(data, callBack){
  delete data.data['_id']
  contactHelper(data.data, function(status, record){
      if(!status){
        console.log("Bogus")
        callBack(false)
        return
      }
      db.collection('contacts').replaceOne(
        {_id : new mongodb.ObjectID(data.id)}, data.data, function(err,result){
          if(!err) callBack(true, result.ops[0])
          else console.log(err)
        }
    )
  })
  
  }


exports.getAllContacts = function(render){
  db.collection('contacts').find().toArray(function(err,docs){
      if(!err){
        render(docs);
      }
  });

};

exports.deleteContact = function(id, callBack){
  db.collection('contacts').deleteOne(
    {_id : new mongodb.ObjectID(id)}, function(err, results){
        if(!err) callBack(true)
        else callBack(false)
    }
  )
}

exports.getContactById = function(name){

};




