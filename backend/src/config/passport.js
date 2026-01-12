const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userService = require('../modules/user/user.service');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/user/auth/google/callback`,
      proxy: true, // Trust proxy for HTTPS in production
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const result = await userService.googleAuth(profile);
        return done(null, result.data);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
