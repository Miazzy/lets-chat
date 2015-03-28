var mongoose = require('mongoose'),
    passport = require('passport'),
     _ = require('lodash'),
    TokenStrategy = require('passport-token').Strategy;

function Local(options) {
    this.options = options;
    this.key = 'token';
}

Local.key = 'token';

var createUser = function (username, token, done) {
    var app = this.app,
        core = this.core;

    var spaceIndex = username.indexOf(' ');
    var firstName = username,
        lastName = '';
    if (spaceIndex) {
        firstName = username.slice(0, spaceIndex);
        lastName = username.slice(spaceIndex + 1);
    }
    var data = {
        provider: 'token',
        username: token,
        email: token + '@example.com',
        password: token,
        firstName: firstName,
        lastName: lastName,
        displayName: username
    };
    var User = mongoose.model('User');
    var user = new User({ provider: 'token' });

    Object.keys(data).forEach(function(key) {
        user.set(key, data[key]);
    });

    user.save(function(err, user) {
        if (err) {
            console.log('Failed to create user', err);
            var message = 'Sorry, we could not process your request';
            // User already exists
            if (err.code === 11000) {
                message = 'Email has already been taken';
            }
            // Invalid username
            if (err.errors) {
                message = _.map(err.errors, function(error) {
                    return error.message;
                }).join(' ');
            // If all else fails...
            } else {
                console.error(err);
            }
            // Notify
            done(null, false, {
                message: 'Failed to create user'
            });
            return;
        }

        done(null, user);
    });

};

Local.prototype.setup = function() {
    passport.use(new TokenStrategy({
        usernameHeader: 'x-sandstorm-username',
        tokenHeader:    'x-sandstorm-user-id'
    }, function(username, token, done) {
        username = decodeURIComponent(username);
        token = decodeURIComponent(token);
        var User = mongoose.model('User');
        User.authenticate(token, token, function(err, user) {
            if (err) {
                createUser(username, token, done);
            }
            if (user) {
                return done(null, user);
            } else {
                createUser(username, token, done);
            }
        });
    }));
};

Local.prototype.authenticate = function(req, cb) {
    passport.authenticate('token', cb)(req);
};

module.exports = Local;
