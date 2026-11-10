import * as auth from './middleware.ts';
import express from 'express';
import path from 'path';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("views", path.join(import.meta.dirname, "views"));
app.set('view engine', 'pug');
app.use(express.static(path.join(import.meta.dirname, "public"))); //css and js are served as separate files (not included in pug)

type Comment = {
    username: string;
    text: string;
};

const comments: Comment[] = [];

const users = new Map<string, string>();

let demoHttpOnly = true;

auth.initCookieAuth(app, '/login');

app.get('/',  function (req, res) {
    if (req.user?.username === 'admin') {
        res.redirect('/admin');
        return;
    }
    res.render('index', {user : req.user, httpOnly: demoHttpOnly});
});

app.get('/api/comments', function (_req, res) {
    res.json(comments);
});

app.post('/comment', auth.requiresAuthentication, function (req, res) {
    const text = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';

    comments.unshift({
        username: req.user?.username ?? 'Anonimno',
        text
    });

    res.redirect('/');
});

app.post('/comment/delete-all', auth.requiresAuthentication, function (_req, res) {
    comments.length = 0;
    res.redirect('/');
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.post('/login',  function (req, res) {        
    const username = req.body.username;    
	  const password = req.body.password;      
    if (!username || !password) {
        res.status(400).send('Username and password are required.');
        return;
    }
    const storedPassword = users.get(username);
    if (storedPassword && storedPassword === password) {
        auth.signInUser(res, username, demoHttpOnly);
        res.redirect("/");
    } else {
        res.status(401).send('Invalid username or password.');
    }  
});

app.get('/register', function (req, res) {
    res.render('register');
});

app.post('/register', function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    if (!username || !password || !email) {
        res.status(400).send('Username, password, and email are required.');
        return;
    }

    if (users.has(username)) {
        res.status(409).send('Username already exists.');
        return;
    }

    users.set(username, password);
    auth.signInUser(res, username, demoHttpOnly);
    res.redirect("/");
});

app.post('/logout',   function (req, res) {
    auth.signOutUser(res);
    res.redirect("/");
});

app.post('/security/cookie', function (req, res) {
    demoHttpOnly = req.body.httpOnly === true;
    res.sendStatus(200);
});

app.get('/admin', auth.requiresAuthentication, function (req, res) {
    res.render('admin', {user : req.user});
});

const port = Number(process.env.PORT) || 4102;

const hostname = '0.0.0.0';
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});