/*
  This file contains the logger utility function that is used to log messages to the console.
*/

const info = (...params) => {
  console.log(...params);
};

const error = (...params) => {
  console.error(...params);
};

module.exports = {
  info,
  error,
};
