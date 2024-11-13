const path = require('path');

module.exports = {
  entry: './node_modules/granular-js/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'granular.js',
  },
};