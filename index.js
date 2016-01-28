/*!
 * base-watch <https://github.com/base/base-watch>
 *
 * Copyright (c) 2016, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

/**
 * Adds a [watch](#watch) method to your app that takes a file, directory, or glob pattern and watches for changes
 * to those files. When a change occurs, the specified task(s) or function will execute.
 *
 * If no task(s) or function is specified, only the instance of `FSWatcher` is returned and can be used directly.
 * See [chokidar.watch](https://github.com/paulmillr/chokidar#api) for more information.
 *
 * ```js
 * app.use(watch());
 * ```
 *
 * @return {Function} plugin function to be used in a [base][] application.
 * @api public
 * @name plugin
 */

module.exports = function() {
  return function plugin(app) {
    if (this.isRegistered('base-watch')) {
      return;
    }

    /**
     * Watch a file, directory, or glob pattern for changes and build a task
     * or list of tasks when changes are made. Watch is powered by [chokidar][]
     * so arguments can be anything supported by [chokidar.watch](https://github.com/paulmillr/chokidar#api).
     *
     * ```js
     * var watcher = app.watch('templates/pages/*.hbs', ['site']);
     * ```
     * @param  {String|Array} `glob` Filename, Directory name, or glob pattern to watch
     * @param  {Object} `options` Additional options to be passed to [chokidar][]
     * @param  {String|Array|Function} `tasks` Tasks that are passed to `.build` when files in the glob are changed.
     * @return {Object} Returns an instance of `FSWatcher` from [chokidar][]
     * @api public
     * @name watch
     */

    this.define('watch', function(glob, options/*, fns/tasks */) {
      var self = this;
      var len = arguments.length - 1, i = 0;
      var args = new Array(len + 1);
      while (len--) args[i] = arguments[++i];
      args[i] = done;

      var opts = {};
      if (typeof options === 'object' && !Array.isArray(options)) {
        args.shift();
        opts = utils.extend(opts, options);
      }

      var building = true;
      function done(err) {
        building = false;
        if (err) console.error(err);
      }

      var watch = utils.chokidar.watch(glob, opts);

      // only contains our `done` function
      if (args.length === 1) {
        return watch;
      }

      watch
        .on('ready', function() {
          building = false;
        })
        .on('all', function() {
          if (building) return;
          building = true;
          self.build.apply(self, args);
        });

      return watch;
    });
  };
};
