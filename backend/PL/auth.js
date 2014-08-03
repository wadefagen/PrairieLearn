/**
 * auth.js
 * Handles authentication for the PrairieLearn app (shib or otherwise).
 */

var hmacSha256 = require("crypto-js/hmac-sha256");

var superusers = {
    "user1@illinois.edu": true,
    "mwest@illinois.edu": true
};




exports.authenticate = function (req, res, next) {
    /*
    // hack due to RequireJS not providing header support
    if (/^\/questions/.test(req.path) || /^\/tests/.test(req.path)) {
        req.app.set('authUID', 'nouser');
        next();
        return;
    }
    */

    // don't authenticate for OPTIONS requests, as these are just for CORS
    if (req.method === 'OPTIONS') {
        next();
        return;
    }

    // by-pass authentication for development
    var deployMode = req.app.get('deployMode');
    if (deployMode !== 'engr') {
        req.app.set('authUID', 'user1@illinois.edu');
        next();
        return;
    }

    // shib
    if (req.headers['x-auth-uid'] == null) {
        throw new Error("Missing X-Auth-UID header");
    }
    if (req.headers['x-auth-name'] == null) {
        throw new Error("Missing X-Auth-Name header");
    }
    if (req.headers['x-auth-date'] == null) {
        throw new Error("Missing X-Auth-Date header");
    }
    if (req.headers['x-auth-signature'] == null) {
        throw new Error("Missing X-Auth-Signature header");
    }
    var authUID = req.headers['x-auth-uid'];
    var authName = req.headers['x-auth-name'];
    var authDate = req.headers['x-auth-date'];
    var authSignature = req.headers['x-auth-signature'];
    var checkData = authUID + "/" + authName + "/" + authDate;
    var checkSignature = hmacSha256(checkData, config.secretKey);
    checkSignature = checkSignature.toString();
    if (authSignature !== checkSignature) {
        throw new Error("Invalid X-Auth-Signature for " + authUID);
    }

    req.app.set('authUID', authUID);
    next();
};


exports.setPermissions = function (req, res, next) {
    if (req.app.enabled('authUID')) {
        var uid = req.app.get('authUID');
        req.app.set('superuser', (superusers[uid] === true));
    } else {
        req.app.set('superuser', false);
    }

    console.log("uid: " + uid);
    next();
};
