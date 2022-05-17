const winston = require("winston");
//require("winston-mongodb");
require("express-async-errors");

module.exports = function() {
  process.on("uncaughtException", ex => {
    console.log("We got an uncaught exception...");
    winston.error(ex.message, ex);
    process.exit(1); // Anything except zero is failure
  });

  process.on("unhandledRejection", ex => {
    console.log("We got an unhandled rejection...");
    winston.error(ex.message, ex);
    process.exit(1); // Anything except zero is failure
  });

  winston.add(new winston.transports.File({ filename: "logfile.log" }));
  winston.add(
    new winston.transports.Console({ colorize: true, prettyPrint: true })
  );
  /*winston.add(
    new winston.transports.MongoDB({
      db: "mongodb://localhost:27017/vidly",
      level: "info"
    })
  );*/
};
