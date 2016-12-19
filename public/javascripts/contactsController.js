var app = angular.module('myApp', []);

app.factory('scopes', function ($rootScope) {
    var data = {}

    return {
        put: function (key, value) {
            data[key] = value;
        },
        get: function (key) {
            return data[key];
        }
    }
})

app.controller('listController', function ($scope, $http, scopes) {
    angular.element(document).ready(function () {
        $http.get('/contactData')
            .then(function (response) {
                $scope.records = response.data;
                $scope.invalid = false;

                var map = scopes.get('map');
                var records = $scope.records;

                $scope.markers = {};
                for (var i in records) {
                    var marker = getMarker(records[i]);
                }
            });


        $scope.addressFilter = {}
    })

    $scope.reCenter = function (coords) {
        var map = scopes.get('map');
        map.setCenter(coords)
    }

    $scope.deleteRecord = function (event, contact) {
        console.log($scope.records.length)
        $http.post('/deleteContact', {
                id: contact._id
            })
            .then(function (response) {
                if (response.status) {

                    var index = $scope.records.indexOf(contact);
                    var marker = $scope.markers[contact._id]
                    marker.marker.setMap(null);
                    delete marker
                    $scope.records.splice(index, 1)

                }
                //delete ()
            })
    }

    $scope.addRecord = function () {
        $http.post('/addRecord', $scope.record)
            .then(function (response) {
                if (!response.data.err) {
                    $scope.invalid = false;
                    var contact = response.data.contact;
                    $scope.records.push(contact)

                    var marker = getMarker(contact);

                    $scope.record = {}
                    angular.element('#addModal').modal('hide')
                } else {
                    //Bogus Address
                    $scope.invalid = true;
                }
            })
    }

    $scope.clearScopeData = function () {
        $scope.record = {};
    }

    $scope.populateRecord = function (contact) {
        $scope.record = JSON.parse(JSON.stringify(contact))
        $scope.recordIndex = $scope.records.indexOf(contact);
    }

    $scope.updateRecord = function (event) {
        $http.post('/updateContact', {
                id: $scope.record._id,
                data: $scope.record
            })
            .then(function (response) {
                if (response.data.valid) {
                    $scope.invalid = false;
                    var contact = response.data.contact;
                    var index = $scope.recordIndex;
                    console.log($scope.records[index])
                    console.log(contact)
                    $scope.records[index] = contact;

                    $scope.markers[contact._id].marker.setPosition(contact.coords)
                    $('#updateModal').modal('hide')
                } else {
                    //Bogus Address
                    $scope.invalid = true;
                }

            })
    }

    $scope.coordsFilter = function (contact) {
        var coords = $scope.addressFilter.coords;
        if (coords) {
            var dist = distance(coords.lat, coords.lng, contact.coords.lat, contact.coords.lng);
            console.log("Here")
            if (dist <= $scope.addressFilter.distance) return true;
            return false
        }
        return true;
        $scope.$apply()
    }


    $scope.applyFilter = function (event) {

        var address = $scope.addressFilter.address;

        geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            'address': address
        }, function (results, status) {
            if (status == 'OK') {
                var loc = results[0].geometry.location;
                $scope.addressFilter.coords = {
                    lat: loc.lat(),
                    lng: loc.lng()
                }
                $scope.reCenter(loc)
                $scope.$apply();
            }
        })
    }

    $scope.clearFilter = function () {
        $scope.addressFilter.address = "";
        $scope.addressFilter.coords = undefined;
    }

    function getMarker(contact) {

        var map = scopes.get('map');
        var marker = new google.maps.Marker({
            position: contact.coords,
            title: contact.fName + " " + contact.lName
        })
        marker.setMap(map)
        var toolTip = new google.maps.InfoWindow()
        $scope.markers[contact['_id']] = {
            marker: marker,
            toolTip: toolTip
        };

        google.maps.event.addListener(marker, 'mouseover', function () {
            toolTip.setContent(contact.fName + " " + contact.lName)
            toolTip.open(map, marker)
        })
        google.maps.event.addListener(marker, 'mouseout', function () {
            toolTip.close();
        })


        return marker;
    }


    function distance(lat1, lon1, lat2, lon2, unit) {
        var radlat1 = Math.PI * lat1 / 180
        var radlat2 = Math.PI * lat2 / 180
        var theta = lon1 - lon2
        var radtheta = Math.PI * theta / 180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180 / Math.PI
        dist = dist * 60 * 1.1515
        if (unit == "K") {
            dist = dist * 1.609344
        }
        if (unit == "N") {
            dist = dist * 0.8684
        }
        return dist
    }
})



app.controller('mapsController', function ($scope, scopes) {
    angular.element(document).ready(function () {
        var coords = {
            lat: 41.0820648,
            lng: -74.1768105
        };
        $scope.map = new google.maps.Map(document.getElementById('map'), {
            center: coords,
            zoom: 14
        });
        scopes.put('map', $scope.map);
    })




});