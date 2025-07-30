import express from 'express';
import { initDb } from './db.js';
import { format } from 'date-fns';

const app = express();
const dbPromise = initDb();

app.use(express.json());

function now() {
  return format(new Date(), 'MM/dd/yyyy h:mma');
}

async function getEmployeeId(db, name) {
  let row = await db.get('SELECT id FROM employees WHERE name=?', [name]);
  if (!row) {
    const res = await db.run('INSERT INTO employees(name) VALUES (?)', [name]);
    row = { id: res.lastID };
  }
  return row.id;
}

app.get('/api/employees', async (req, res) => {
  const db = await dbPromise;
  const employees = await db.all('SELECT * FROM employees');
  const result = [];
  for (const emp of employees) {
    const leads = await db.all('SELECT firstname, lastname, created FROM leads WHERE employee_id=?', [emp.id]);
    const checkins = await db.all('SELECT patient, notes, checkin, created FROM patient_checkins WHERE employee_id=?', [emp.id]);
    const events = await db.all(`SELECT e.id, e.title, e.start, e.end, e.created FROM events e
      JOIN event_employees ee ON ee.event_id=e.id WHERE ee.employee_id=?`, [emp.id]);
    const groups = [];
    if (leads.length)
      groups.push({ type: 'Lead', records: leads });
    if (events.length) {
      for (const ev of events) {
        const rows = await db.all(`SELECT name FROM employees e JOIN event_employees ee ON e.id=ee.employee_id WHERE ee.event_id=?`, [ev.id]);
        ev.employees = rows.map(r => r.name);
      }
      groups.push({ type: 'Event', records: events });
    }
    if (checkins.length)
      groups.push({ type: 'Patient Checkin', records: checkins });
    result.push({ employee: emp.name, records: groups });
  }
  res.json(result);
});

app.get('/api/employees/simple', async (req, res) => {
  const db = await dbPromise;
  const rows = await db.all('SELECT name FROM employees');
  res.json(rows.map(r => r.name));
});

app.get('/api/forms/:record/:type', async (req, res) => {
  const { record, type } = req.params;
  const db = await dbPromise;
  const rec = await db.get('SELECT id FROM records WHERE name=?', [record]);
  if (!rec) return res.status(404).end();
  const fr = await db.get(
    'SELECT id, label FROM form_records WHERE record_id=? AND form_type=?',
    [rec.id, type],
  );
  if (!fr) return res.status(404).end();
  const fields = await db.all(
    `SELECT ff.id, f.name, ff.label, f.type, f.foreign_table, ff.readonly
     FROM form_fields ff
     JOIN fields f ON f.id=ff.field_id
     WHERE ff.form_record_id=?
     ORDER BY ff.sort_order`,
    [fr.id],
  );
  res.json({ id: fr.id, label: fr.label, fields });
});

app.post('/api/leads', async (req, res) => {
  const db = await dbPromise;
  const { employee, firstname, lastname } = req.body;
  const empId = await getEmployeeId(db, employee);
  const create = now();
  await db.run('INSERT INTO leads(employee_id, firstname, lastname, created) VALUES (?, ?, ?, ?)', [empId, firstname, lastname, create]);
  res.json({ employee, firstname, lastname, create });
});

app.post('/api/events', async (req, res) => {
  const db = await dbPromise;
  const { title, start, end, employees } = req.body;
  const create = now();
  const evtRes = await db.run('INSERT INTO events(title, start, end, created) VALUES (?, ?, ?, ?)', [title, start, end, create]);
  const evtId = evtRes.lastID;
  for (const name of employees) {
    const empId = await getEmployeeId(db, name);
    await db.run('INSERT INTO event_employees(event_id, employee_id) VALUES (?, ?)', [evtId, empId]);
  }
  res.json({ title, start, end, create, employees });
});

app.post('/api/checkins', async (req, res) => {
  const db = await dbPromise;
  const { employee, patient, notes, checkin } = req.body;
  const empId = await getEmployeeId(db, employee);
  const create = now();
  await db.run(
    'INSERT INTO patient_checkins(employee_id, patient, notes, checkin, created) VALUES (?, ?, ?, ?, ?)',
    [empId, patient, notes, checkin, create]
  );
  res.json({ employee, patient, notes, checkin, create });
});

app.get('/api/options/:table', async (req, res) => {
  const { table } = req.params;
  if (!['employees'].includes(table)) return res.status(400).end();
  const db = await dbPromise;
  const rows = await db.all(`SELECT id, name FROM ${table}`);
  res.json(rows);
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API server running on ${port}`));
