var _ = require("underscore");

exports.check = check = function (req, obj) {
    if (req.superuser)
        return true;

    if (obj.uid == req.authUID)
    {
        if (typeof obj.availDate === "undefined")
            return true;

        if (Date.parse(obj.availDate) <= Date.now())
            return true;
    }

    return false;
};

exports.filter = filter = function (req, arr) {
    return _(arr).filter(function (obj) { return check(req, obj); });
};

exports.stripPrivate = stripPrivate = function (obj) {
    if (_.isArray(obj))
        return _(obj).map(function (item) { return stripPrivateFields(item); });
    if (!_.isObject(obj))
        return obj;
    var newObj = obj;
    if (_(obj).has("_private")) {
        newObj = _(obj).omit("_private");
        var newObj = _(newObj).omit(obj._private);
    }
    _(newObj).each(function (value, key) {
        newObj[key] = stripPrivateFields(value);
    });
    return newObj;
};

exports.filterAndStrip = function (req, arr) {
    return stripPrivate(filter(req, arr));
}