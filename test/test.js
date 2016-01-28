/*!
 * base-watch <https://github.com/base/base-watch>
 *
 * Copyright (c) 2016 .
 * Licensed under the MIT license.
 */

'use strict';

require('mocha');
var assert = require('assert');
var path = require('path');
var fs = require('fs');

var Base = require('base');
var tasks = require('base-tasks');
var plugin = require('../');
var app, watch;

describe('base-watch', function() {
  beforeEach(function() {
    app = new Base();
    app.use(tasks());
    app.use(plugin());
    app.on('error', console.log);
  });

  afterEach(function() {
    if (watch && watch.close) {
      watch.close();
    }
  });

  it('should watch files and run a task when files change', function(done) {
    if (process.env.CI) return done();
    var count = 0;
    app.task('default', function(cb) {
      count++;
      cb();
    });

    app.task('close', function(cb) {
      cb();
      app.emit('close');
    });

    app.task('watch', function(cb) {
      app.on('close', cb);
      watch = app.watch(path.join(__dirname, 'fixtures/foo.txt'), ['default', 'close']);
      fs.writeFileSync(path.join(__dirname, 'fixtures/foo.txt'), 'bar');
    });

    app.build(['watch'], function(err) {
      if (err) return done(err);
      assert.equal(count, 1);
      done();
    });
  });

  it('should watch files with given options and run a task when files change', function(done) {
    if (process.env.CI) return done();
    var count = 0;
    app.task('default', function(cb) {
      count++;
      cb();
    });

    app.task('close', function(cb) {
      cb();
      app.emit('close');
    });

    app.task('watch', function(cb) {
      app.on('close', cb);
      watch = app.watch('foo.txt', {cwd: path.join(__dirname, 'fixtures')}, ['default', 'close']);
      fs.writeFileSync(path.join(__dirname, 'fixtures/foo.txt'), 'bar');
    });

    app.build(['watch'], function(err) {
      if (err) return done(err);
      assert.equal(count, 1);
      done();
    });
  });

  it('should watch files without given tasks', function(done) {
    if (process.env.CI) return done();
    var count = 0;
    app.task('default', function(cb) {
      count++;
      cb();
    });

    app.task('watch', function(cb) {
      watch = app.watch(path.join(__dirname, 'fixtures/foo.txt'));
      watch.on('change', function() {
        app.build(['default'], cb);
      });
      fs.writeFileSync(path.join(__dirname, 'fixtures/foo.txt'), 'bar');
    });

    app.build(['watch'], function(err) {
      if (err) return done(err);
      assert.equal(count, 1);
      done();
    });
  });

  it('should watch files without given tasks and with given options', function(done) {
    if (process.env.CI) return done();
    var count = 0;
    app.task('default', function(cb) {
      count++;
      cb();
    });

    app.task('watch', function(cb) {
      watch = app.watch('foo.txt', {cwd: path.join(__dirname, 'fixtures'), ignoreInitial: true});
      watch.on('all', function() {
        app.build(['default'], cb);
      });
      fs.writeFileSync(path.join(__dirname, 'fixtures/foo.txt'), 'bar');
    });

    app.build(['watch'], function(err) {
      if (err) return done(err);
      assert.equal(count, 1);
      done();
    });
  });
});

