var _ = require("underscore");
var DB = require("../classes/DB");
var Permissions = require("../classes/Permissions.js");

var users = DB.getCollection("users");

exports.ensure_uid_in_db = function (req, res, next) {
    users.findOne(
        { uid: req.authUID },
        function (err, doc) {
            if (err) { next(err); }
            if (doc) { next(); }

            if (!doc) {
                users.insert(
                    { uid: req.uid },
                    { w: 1 },
                    function (err, doc) {
                        if (err) { next(err); }
                        next();
                    }
                )
            }
        }
    );
};

exports.param_uid = function (req, res, next, id) {
    users.findOne(
        { uid: id },
        function (err, doc) {
            if (err) { next(err); }
            if (!doc) { next(new Error("UID " + id + " not found.")); }

            req.uid = doc.uid;
            req.uid_doc = doc;
            next();
        }
    )
};

exports.allUsers = function (req, res, next) {
    users.find({}, { "uid": 1, "name": 1 }, function (err, docs) {
        if (err) next(err);

        var result = _(docs).map(function (doc) {
            return { name: doc.name, uid: doc.uid };
        });

        res.json(Permissions.filterAndStrip(result));
    });
};


exports.user_uid = function (req, res, next) {
    var result = {
        name: req.uid_doc.name,
        uid: req.uid_doc.uid
    };

    res.json(Permissions.filterAndStrip(result));;
};
