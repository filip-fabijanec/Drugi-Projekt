import * as auth from './middleware.ts';
import express from 'express';
import path from 'path';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(import.meta.dirname, "views"));
app.set('view engine', 'pug');
app.use(express.static(path.join(import.meta.dirname, "public"))); //css and js are served as separate files (not included in pug)

type Comment = {
    username: string;
    text: string;
};

const comments: Comment[] = [];

auth.initCookieAuth(app, '/login');

app.get('/',  function (req, res) {
    res.render('index', {user : req.user});
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

app.post('/comment/delete', auth.requiresAuthentication, function (req, res) {
    const index = parseInt(req.body.index, 10);
    comments.splice(index, 1);
    res.redirect('/');
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.post('/login',  function (req, res) {        
    const username = req.body.username;    
	const password = req.body.password;        
    if (password !== 'some password') {
        res.render('login');
    }
    else {
        auth.signInUser(res, username);

        const returnUrl = req.query.returnUrl;
        if (typeof returnUrl === 'string') {
            res.redirect(returnUrl); //TO DO: (Security) Check if this is a local url
        }        
        else {
            res.redirect("/");
        }
    }
});

app.post('/logout',   function (req, res) {
    auth.signOutUser(res);
    res.redirect("/");
});

const port = Number(process.env.PORT) || 4102;

const hostname = '0.0.0.0';
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});