import express from 'express';
import pg from 'pg';

process.loadEnvFile();

const app = express();
const port = 3000;

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: process.env.pass,
  port: 5432,
});
db.connect();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', async (req, res) => {
  const result = await db.query('SELECT country FROM visited_countries');
  let countries = [];

  result.rows.forEach((country) => {
    countries.push(country.country);
  });

  res.render('index.ejs', { countries: countries, total: countries.length });
  db.end();
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
