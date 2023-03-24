const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const github = require('./github');

const config = require('./config')

const app = express();
const port = config.PORT || 3000;

// Configure session middleware
app.use(session({
  secret: config.sessionSecret, // Replace with a secure secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: 'auto', // Set to true for HTTPS connections
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

passport.use(new GitHubStrategy({
    clientID: config.GITHUB_CLIENT_ID,
    clientSecret: config.GITHUB_CLIENT_SECRET,
    callbackURL: config.callbackUrl,
  },
  (accessToken, refreshToken, profile, cb) => {
    profile.accessToken = accessToken;
    return cb(null, profile);
  }
));

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

app.get('/', async (req, res) => {
  if (req.user) {
    const todos = await github.listTodos(req.user.accessToken, {
      owner: config.repo.owner,
      repo: config.repo.repo,
    });
    res.json(todos);
  } else {
    res.send('Hello, World!');
  }
});

app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
