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

async function checkVisited() {
  const result = await db.query('SELECT country FROM visited_countries');
  let countries = [];

  result.rows.forEach((country) => {
    countries.push(country.country);
  });

  return countries;
}

app.get('/', async (req, res) => {
  const countries = await checkVisited();
  res.render('index.ejs', { countries: countries, total: countries.length });
  db.end();
});

app.post('/add', async (req, res) => {
  const country = await req.body['country'];
  const code = await db.query(
    'SELECT country_code FROM countries WHERE country_name = $1',
    [country]
  );

  if (code.rows.length !== 0) {
    const data = code.rows[0];
    const countryCode = data.country_code;
    await db.query(`INSERT INTO visited_countries (country) VALUES ($1)`, [
      countryCode,
    ]);
    res.redirect('/');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
