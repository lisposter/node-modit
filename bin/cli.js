#!/usr/bin/env node
'use strict';
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var async = require('async');
var prompt = require('prompt');
var replace = require('replace');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var licenseGen = require('license-gen');
var analyzer = require('github-url-analyzer');
var cp = require('stream-cp');

var name = '';
var modDir = '';

if (process.argv[2].indexOf(path.sep) >= 0) {
  name = path.basename(process.argv[2]);
  modDir = path.join(process.cwd(), process.argv[2]);
} else {
  name = process.argv[2];
  modDir = path.join(process.cwd(), name);
}

if (!fs.existsSync(modDir)) {
  mkdirp.sync(modDir);
}

var scaffold = path.join(path.dirname(__dirname), 'scaffold');

async.waterfall([
  function(next) {
    cp(scaffold, modDir, function(file) {
      return file.replace(/^_/, '.');
    }, function() {
      next(null, null);
    });
  },

  function(data, next) {
    exec('git config --get user.name', function(err, stdout, stderr) {
      if (err) {
        return next(err);
      }

      next(null, stdout.replace(/[\n\r]/g, ''));
    });
  },

  function(author, next) {
    var schema = {
      properties: {
        name: {
          description: 'module\'s name',
          default: name
        },

        author: {
          description: 'author\'s name',
          default: author,
          required: true
        },

        desc: {
          description: 'description for the module',
          required: false
        },

        repo: {
          description: 'git repo url',
          required: false
        },

        license: {
          description: 'license for the module',
          required: false
        },

        keywords: {
          description: 'keywords for this package',
          required: false
        }
      }
    };

    prompt.message = 'modit'.green;
    prompt.delimiter = ': '.grey;
    prompt.get(schema, function(err, result) {
      if (err) {
        return next(err);
      }

      if (result.license) {
        result.license = result.license.toUpperCase();
      }

      if (result.keywords) {
        result.keywords = JSON.stringify(result.keywords.replace(/\s/g, '').split(','));
      } else {
        result.keywords = "[]";
      }

      if (result.repo) {
        var urls = analyzer(result.repo);

        if (urls) {
          result.repo = urls.repo;
          result.git = urls.git;
        }
      }

      next(null, result);
    });
  },

  function(result, next) {
    var holders = ['__NAME__', '__AUTHOR__', '__DESC__', '__GIT__', '__KEYWORDS__', '__LICENSE__', '__REPO__'];

    holders.forEach(function(holder) {
      replace({
        regex: holder,
        replacement: result[holder.replace(/_/g, '').toLowerCase()] || '',
        paths: [modDir],
        multiline: true,
        recursive: true,
        silent: true
      });
    });

    if (result.license) {
      var config = {
        project: result.name,
        author: result.author,
        year: new Date().getFullYear(),
        _path: modDir
      };
      licenseGen(result.license, config, function(err, data) {
        if (err) {
          return next(err);
        }
        next(null, data);
      });
    } else {
      next(null);
    }
  }
], function(err) {
  if (err) {
    rimraf(modDir, function(err) {
      if (err) {
        throw err;
      }
      console.info('module not created');
    });
  }
  console.info('Succeed created module in ' + modDir);
});
