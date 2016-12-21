var bcrypt = require("bcryptjs");
var LocalStrategy = require('passport-local').Strategy;

exports.createUser = function (db, user, pass, callBack) {
    console.log(user)
    console.log(pass)
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(pass, salt, function (err, hash) {
            db.createUser(user, hash, callBack);
        })
    })
}



exports.setAuthentication = function (passport, db) {
    console.log("Here");
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function (user, pswd, done) {
        console.log(user + " "+pswd )
        db.getUser(user, function (err, pass) {
            if (err) {
                console.log("Username incorrect")
                return done(null, false);
            }
            console.log("Success")

            bcrypt.compare(pswd, pass, function (err, isMatch) {
                if (err) return done(err)
                if (!isMatch) console.log("Password incorrect")
                else console.log("Login Successful")

                done(null, isMatch)
            })
        })
    }))

    

    passport.serializeUser(function(username, done) {
        done(null, username);
    });
    passport.deserializeUser(function(username, done) {
      done(null, username);
   });

   

} 