var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyBSqOcYsd8zDyPmJ7aj-iKfex8mGhTw9ag'
});

exports.getCoords = function(location, fn){
    var coords;
    googleMapsClient.geocode({
        address: location
    }, function(err,response){
        if(!err){
            if(response.json.results.length === 0) fn(null)
            else fn(response.json.results[0]["geometry"]["location"])
        }
        else console.log(err)
    })
};