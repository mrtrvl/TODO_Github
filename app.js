const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const github = require('./github');
const path = require('path');

const config = require('./config')

const app = express();
const port = config.PORT || 3000;

// Configure view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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
app.use(express.static('public'));

function ensureAuthenticated(req, res, next) {
  if (req.user) {
    return next();
  }
  return res.redirect('/auth/github');
}

app.get('/', async (req, res) => {
  if (req.user) {
/*     const repos = await github.listUserRepos(req.user.accessToken);
    console.log('User repositories:', repos); */

    const todos = await github.listTodos(req.user.accessToken, {
      owner: config.repo.owner,
      repo: config.repo.repo,
    });
    return res.render('index', { user: req.user, todos: todos });
  } else {
    return res.render('index', { user: null, todos: [] });
  }
});

app.get('/auth/github', passport.authenticate('github', { scope: ['repo'] }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  return res.redirect('/');
});

app.post('/todos', ensureAuthenticated, async (req, res) => {
  try {
    const { title } = req.body;
    await github.createTodo(req.user.accessToken, {
      owner: config.repo.owner,
      repo: config.repo.repo,
      title,
    });
    return res.sendStatus(201);
  } catch (error) {
    console.error("Error creating todo:", error);
    return res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
