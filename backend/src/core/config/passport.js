import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import Database from './db.js';
import env from './env.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID || 'dummy',
      clientSecret: env.GOOGLE_CLIENT_SECRET || 'dummy',
      callbackURL: env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
      proxy: true, // Handle reverse proxy setups
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;

        // 1. Check if user already exists with this Google Id
        let user = await Database.client.user.findUnique({
          where: { googleId },
        });

        if (user) return done(null, user);

        // 2. Check if user exists with this email
        user = await Database.client.user.findUnique({
          where: { email },
        });

        if (user) {
          // Link Google account to existing user
          user = await Database.client.user.update({
            where: { id: user.id },
            data: { googleId },
          });
          return done(null, user);
        }

        // 3. Create new user
        // Generate a unique username
        let username = profile.displayName.replace(/\s+/g, '').toLowerCase();
        const existingUsername = await Database.client.user.findUnique({
          where: { username },
        });

        if (existingUsername) {
          username = `${username}${Math.floor(Math.random() * 1000)}`;
        }

        user = await Database.client.user.create({
          data: {
            email,
            username,
            googleId,
            role: 'USER',
            profilePic: profile.photos[0]?.value,
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID || 'dummy',
      clientSecret: env.GITHUB_CLIENT_SECRET || 'dummy',
      callbackURL: env.GITHUB_CALLBACK_URL || 'http://localhost:4000/api/auth/github/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const githubId = profile.id;

        // 1. Check if user already exists with this GitHub Id
        let user = await Database.client.user.findUnique({
          where: { githubId },
        });

        if (user) return done(null, user);

        // 2. Check if user exists with this email
        user = await Database.client.user.findUnique({
          where: { email },
        });

        if (user) {
          // Link GitHub account to existing user
          user = await Database.client.user.update({
            where: { id: user.id },
            data: { githubId },
          });
          return done(null, user);
        }

        // 3. Create new user
        let username = profile.username || profile.displayName.replace(/\s+/g, '').toLowerCase();
        const existingUsername = await Database.client.user.findUnique({
          where: { username },
        });

        if (existingUsername) {
          username = `${username}${Math.floor(Math.random() * 1000)}`;
        }

        user = await Database.client.user.create({
          data: {
            email,
            username,
            githubId,
            role: 'USER',
            profilePic: profile.photos[0]?.value,
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// We don't use sessions, we use JWT, but Passport might still call these
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Database.client.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
