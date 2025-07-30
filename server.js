import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
const sample = JSON.parse(
  fs.readFileSync(new URL('./src/data/fake_data.json', import.meta.url), 'utf8')
);

const dbPath = path.join(process.cwd(), 'calendar.db');
const firstRun = !fs.existsSync(dbPath);
const db = new Database(dbPath);

// schema
const schema = `
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  firstname TEXT,
  lastname TEXT,
  create_ts TEXT,
  FOREIGN KEY(employee_id) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  create_ts TEXT,
  start_ts TEXT,
  end_ts TEXT
);
CREATE TABLE IF NOT EXISTS event_employees (
  event_id INTEGER,
  employee_id INTEGER,
  FOREIGN KEY(event_id) REFERENCES events(id),
  FOREIGN KEY(employee_id) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS patient_checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  patient TEXT,
  notes TEXT,
  checkin_ts TEXT,
  FOREIGN KEY(employee_id) REFERENCES employees(id)
);
`;

db.exec(schema);

function seed() {
  const insertEmp = db.prepare('INSERT INTO employees (name) VALUES (?)');
  const insertLead = db.prepare('INSERT INTO leads (employee_id, firstname, lastname, create_ts) VALUES (?,?,?,?)');
  const insertEvent = db.prepare('INSERT INTO events (title, create_ts, start_ts, end_ts) VALUES (?,?,?,?)');
  const insertEventEmp = db.prepare('INSERT INTO event_employees (event_id, employee_id) VALUES (?,?)');
  const insertCheck = db.prepare('INSERT INTO patient_checkins (employee_id, patient, notes, checkin_ts) VALUES (?,?,?,?)');
  const findEmp = db.prepare('SELECT id FROM employees WHERE name=?');

  for (const emp of sample) {
    const empRes = insertEmp.run(emp.employee);
    const empId = empRes.lastInsertRowid;
    for (const group of emp.records) {
      if (group.type === 'Lead') {
        for (const rec of group.records) {
          insertLead.run(empId, rec.firstname, rec.lastname, rec.create);
        }
      } else if (group.type === 'Event') {
        for (const rec of group.records) {
          const evRes = insertEvent.run(rec.title, rec.create, rec.start, rec.end);
          const evId = evRes.lastInsertRowid;
          for (const en of rec.employees) {
            let row = findEmp.get(en);
            if (!row) {
              row = insertEmp.run(en).lastInsertRowid;
            } else {
              row = row.id;
            }
            insertEventEmp.run(evId, row);
          }
        }
      } else if (group.type === 'Patient Checkin') {
        for (const rec of group.records) {
          insertCheck.run(empId, rec.patient, rec.notes, rec.checkin);
        }
      }
    }
  }
}

if (firstRun) seed();

function fetchData() {
  const employees = db.prepare('SELECT * FROM employees').all();
  const leads = db.prepare('SELECT * FROM leads').all();
  const events = db.prepare('SELECT * FROM events').all();
  const eventEmployees = db.prepare('SELECT * FROM event_employees').all();
  const checkins = db.prepare('SELECT * FROM patient_checkins').all();

  return employees.map(emp => {
    const groups = [];
    const ls = leads.filter(l => l.employee_id === emp.id).map(l => ({ firstname: l.firstname, lastname: l.lastname, create: l.create_ts }));
    if (ls.length) groups.push({ type: 'Lead', records: ls });
    const cs = checkins.filter(c => c.employee_id === emp.id).map(c => ({ patient: c.patient, notes: c.notes, checkin: c.checkin_ts }));
    if (cs.length) groups.push({ type: 'Patient Checkin', records: cs });
    const evIds = eventEmployees.filter(ee => ee.employee_id === emp.id).map(ee => ee.event_id);
    const evs = events.filter(ev => evIds.includes(ev.id)).map(ev => ({
      title: ev.title,
      create: ev.create_ts,
      start: ev.start_ts,
      end: ev.end_ts,
      employees: eventEmployees.filter(ee => ee.event_id === ev.id).map(ee => employees.find(e => e.id === ee.employee_id).name)
    }));
    if (evs.length) groups.push({ type: 'Event', records: evs });
    return { employee: emp.name, records: groups };
  });
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/data', (req, res) => {
  res.json(fetchData());
});

app.post('/api/lead', (req, res) => {
  const { employee, firstname, lastname, create } = req.body;
  const emp = db.prepare('SELECT id FROM employees WHERE name=?').get(employee);
  if (!emp) return res.status(400).json({ error: 'employee not found' });
  db.prepare('INSERT INTO leads (employee_id, firstname, lastname, create_ts) VALUES (?,?,?,?)').run(emp.id, firstname, lastname, create);
  res.json({ status: 'ok' });
});

app.post('/api/event', (req, res) => {
  const { title, create, start, end, employees: emps } = req.body;
  const ev = db.prepare('INSERT INTO events (title, create_ts, start_ts, end_ts) VALUES (?,?,?,?)').run(title, create, start, end);
  const evId = ev.lastInsertRowid;
  const getEmp = db.prepare('SELECT id FROM employees WHERE name=?');
  const insertEE = db.prepare('INSERT INTO event_employees (event_id, employee_id) VALUES (?,?)');
  for (const name of emps) {
    const emp = getEmp.get(name);
    if (emp) insertEE.run(evId, emp.id);
  }
  res.json({ status: 'ok' });
});

app.post('/api/checkin', (req, res) => {
  const { employee, patient, notes, checkin } = req.body;
  const emp = db.prepare('SELECT id FROM employees WHERE name=?').get(employee);
  if (!emp) return res.status(400).json({ error: 'employee not found' });
  db.prepare('INSERT INTO patient_checkins (employee_id, patient, notes, checkin_ts) VALUES (?,?,?,?)').run(emp.id, patient, notes, checkin);
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on ${port}`));

