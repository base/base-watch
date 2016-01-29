'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('chokidar');
require('extend-shallow', 'extend');
require = fn;

/**
 * Expose `utils` modules
 */

module.exports = utils;
