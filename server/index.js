import express from 'express';
import bodyParser from 'body-parser';
import { initDB, seedData, getAllData, addLead, addEvent, addCheckin } from './db.js';

const db = initDB();
// seed data if tables just created (empty employees table)
if (db.prepare('SELECT count(*) as c FROM employees').get().c === 0) {
  seedData(db);
}

const app = express();
app.use(bodyParser.json());

app.get('/data', (req, res) => {
  res.json(getAllData(db));
});

app.post('/lead', (req, res) => {
  const { employee, lead } = req.body;
  if (!employee || !lead) return res.status(400).end();
  addLead(db, employee, lead);
  res.json({ ok: true });
});

app.post('/event', (req, res) => {
  const { event } = req.body;
  if (!event) return res.status(400).end();
  addEvent(db, event);
  res.json({ ok: true });
});

app.post('/checkin', (req, res) => {
  const { employee, checkin } = req.body;
  if (!employee || !checkin) return res.status(400).end();
  addCheckin(db, employee, checkin);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
