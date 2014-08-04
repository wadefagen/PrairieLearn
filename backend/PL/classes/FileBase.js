var fs = require("fs");
var async = require("async");
var path = require("path");
var _ = require("underscore");

function FileBase(dir) {
    this._dir = dir;
}

FileBase.prototype.load = function (id) {
    var result = {};
    var _dir = this._dir;

    var files = fs.readdirSync(this._dir);
    _(files).each(
        function (dir) {
            var infoFile = path.join(_dir, dir, "info.json");
            var data = fs.readFileSync(infoFile);

            var info;
            try { info = JSON.parse(data); }
            catch (e) { throw e; }


            if (info.disabled)
                return;
            info[id] = dir;
            result[dir] = info;
        }
    );

    console.log("successfully loaded info from " + _dir + ", number of items = " + _.size(result));
    return result;
};

module.exports = FileBase;