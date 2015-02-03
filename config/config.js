var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'videopowerhour-v2'
    },
    port: 3000,
    db: 'mongodb://localhost/videopowerhour-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'videopowerhour-v2'
    },
    port: 3000,
    db: 'mongodb://localhost/videopowerhour-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'videopowerhour-v2'
    },
    port: 3000,
    db: 'mongodb://localhost/videopowerhour-production'
  }
};

module.exports = config[env];
