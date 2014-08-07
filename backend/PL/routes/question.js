var _ = require("underscore");
var fs = require("fs");
var path = require("path");

var FileBase = require('../classes/FileBase');
var Permissions = require("../classes/Permissions.js");

var questionFileBase, questions;
exports.init = function (app) {
    questionFileBase = new FileBase(app.locals.config.questionsDir);
    questions = questionFileBase.load("qid");

    console.log("Question Init");
    console.log(questions);
};



//
// ":qid" param route
// - Processes ":qid" into:
//   (1): req.qid, storing the qid
//   (2): req.question, the database entry for the specific qid
//
function _param_qid(req, qid) {
    req.qid = qid;

    if (qid in questions)
        req.question = questions[qid];
    else
        throw new Error("No such question: " + id);
}

exports.param_qid = function (req, res, next, id) {
    console.log("Processed qid: " + id);
    _param_qid(req, id);
    next();
};


function _param_qfile_async_follow_template(req, qfile, step, next) {
    var questionBaseDir = req.app.locals.config.questionsDir;

    var questionRelPath = path.join(req.qid, qfile);
    var quesitonFullPath = path.join(questionBaseDir, questionRelPath);

    fs.stat(quesitonFullPath, function (err, stat) {
        if (err) {
            // File not found on disk, check for template...
            if ("template" in req.question) {
                if (step == 10) {
                    next(new Error("Too-long template recursion for qid: " + qid));
                    return;
                }

                _param_qfile_follow_template(req, res, next, req.question.template, step + 1, next);
                return;
            }
            else
                next(new Error("File not found: " + questionPath));
        } else {
            req.qfile_relPath = questionRelPath;
            req.qfile_qid = qfile;
            console.log("Processed _param_qfile_follow_template: " + req.qfile_relPath);

            next();
            return;
        }
    });
}

function _param_qfile_async(req, qfile, next) {
    req.qfile = qfile;
    _param_qfile_async_follow_template(req, qfile, 0, next);
}

exports.param_qfile = function (req, res, next, id) {
    _param_qfile_async(req, id, next);
};


exports.allQuestions = function (req, res, next) {
    var result = _.map(_.values(questions), function (question) {
        return { qid: question.qid,
                 title: question.title,
                 number: question.number }
    });

    console.log(" ! ! ! ! ! ! ! ! ! ! ! ");
    console.log(result);
    console.log(" ! ! ! ! ! ! ! ! ! ! ! ");
    console.log(Permissions.filterAndStrip(req, result));
    console.log(" ! ! ! ! ! ! ! ! ! ! ! ");

    res.json(Permissions.filterAndStrip(req, result));
};

exports.qid = function (req, res, next) {

    console.log(" - - - - - - - - - - - ");
    console.log(req.question);
    console.log(req.question.qid);
    console.log(req.question.title);
    console.log(req.question.number);
    console.log(" - - - - - - - - - - - ");

    var result = {
        qid: req.qid,
        title: req.question.title,
        number: req.question.number
    };

    res.json(Permissions.filterAndStrip(req, result));
};

exports.qid_qfile = function (req, res, next) {
    var questionBaseDir = req.app.locals.config.questionsDir;
    console.log(" -x-x-x-x-x-x-x-x-x-x- ");
    console.log(req.qfile_relPath);
    console.log(" -x-x-x-x-x-x-x-x-x-x- ");
    res.sendfile(req.qfile_relPath, { root: questionBaseDir });
};
