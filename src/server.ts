import express from 'express';
import path from 'path'
import dotenv from 'dotenv'
import process from 'process';
dotenv.config()

const app = express();
app.set('trust proxy', 1);
app.set("views", path.join(import.meta.dirname, "views"));
app.set('view engine', 'pug');
app.use(express.static(path.join(import.meta.dirname, "public"))); //css and js are served as separate files (not included in pug)
const port = Number(process.env.PORT) || 4102;

const BASE_URL = process.env.BASE_URL!;

app.get('/', async function (req, res) {
  let username: string | undefined;
  username = "admin";
  res.render('index', { username });
});

app.listen(port, '0.0.0.0');