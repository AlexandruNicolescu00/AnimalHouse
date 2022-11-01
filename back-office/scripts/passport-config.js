const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/users');

// --------------------------------- LOCAL ---------------------------------

const customFields = {
    usernameField: 'email',
    passwordField: 'password'
};

const verifyCallback = (username, password, done) => {
    User.findOne({ email: username })
        .then((user) => {
            if (!user) { return done(null, false) }
            bcrypt.compare(password, user.password, function (error, isValid) {
                if (isValid) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            })
        })
        .catch((err) => {
            done(err);
        });
}

const strategy = new LocalStrategy(customFields, verifyCallback);

// --------------------------------- GOOGLE ---------------------------------

const GOOGLE_CLIENT_ID = '337748568241-l2oa0iscpucgr8125jujpm53plcg38st.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const uriCallback = '/google-callback';

const google_verifyCallback = (request, accessToken, refreshToken, profile, done) => {
    User.findOne({ email: profile.email })
        .then((user) => {
            if (!user) {
                const newuser = new User({
                    name: profile.name.givenName,
                    surname: profile.name.familyName,
                    email: profile.email,
                    password: '123',
                    admin: false
                })
                newuser.save();
                return done(null, newuser);
            } else {
                return done(null, user);
            }
        })
}

const google_customFields = {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: uriCallback,
    passReqToCallback: true
};

const google_strategy = new GoogleStrategy(google_customFields, google_verifyCallback);

passport.use(strategy);
passport.use(google_strategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch((err) => {
            done(err)
        })
});