

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/data');

exports.getCollection = function (collection) {
    return db.get(collection);
}