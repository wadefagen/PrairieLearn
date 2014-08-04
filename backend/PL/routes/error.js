/**
 * error.js
 * Error-handling in for the PrairieLearn app
 */

/* Logs the error message. */
exports.log = function (err, req, res, next) {
    //logger.error("Error: " + err);
    console.log("Error: " + err);
    console.log("Error: " + err.message);
    next(err);
};

/* Handles the error message. */
exports.handle = function (err, req, res, next) {
    // TODO: Right now, errors are handled by an HTTP/500 is returned with the error message.
    //       (Note: they should be logged in log(...) before they get here.)

    var html =
        "<b>Error</b>: " + err + "<br>" +
        ".message: " + err.message + "<br>" +
        ".name: " + err.name + "<br>" +
        ".fileName: " + err.fileName + "<br>" +
        ".lineNumber: " + err.lineNumber + "<br>" +
        ".columnNumber: " + err.columnNumber + "<br>" +
        ".stack: <pre>" + err.stack + "</pre>";

    res.send(500, html);
};
