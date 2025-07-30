import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'app.db');

export function initDB() {
  const exists = fs.existsSync(DB_FILE);
  const db = new Database(DB_FILE);
  if (!exists) {
    db.exec(`
      CREATE TABLE employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
      );
      CREATE TABLE leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER,
        firstname TEXT,
        lastname TEXT,
        create_ts TEXT,
        FOREIGN KEY(employee_id) REFERENCES employees(id)
      );
      CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        start_ts TEXT,
        end_ts TEXT,
        create_ts TEXT
      );
      CREATE TABLE event_employees (
        event_id INTEGER,
        employee_id INTEGER,
        FOREIGN KEY(event_id) REFERENCES events(id),
        FOREIGN KEY(employee_id) REFERENCES employees(id)
      );
      CREATE TABLE checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER,
        patient TEXT,
        notes TEXT,
        checkin_ts TEXT,
        create_ts TEXT,
        FOREIGN KEY(employee_id) REFERENCES employees(id)
      );
    `);
  }
  return db;
}

export function seedData(db) {
  const data = JSON.parse(fs.readFileSync(path.join('src','data','fake_data.json'), 'utf-8'));
  const empStmt = db.prepare('INSERT OR IGNORE INTO employees(name) VALUES (?)');
  const leadStmt = db.prepare('INSERT INTO leads(employee_id, firstname, lastname, create_ts) VALUES (?, ?, ?, ?)');
  const eventStmt = db.prepare('INSERT INTO events(title, start_ts, end_ts, create_ts) VALUES (?, ?, ?, ?)');
  const eventEmpStmt = db.prepare('INSERT INTO event_employees(event_id, employee_id) VALUES (?, ?)');
  const checkinStmt = db.prepare('INSERT INTO checkins(employee_id, patient, notes, checkin_ts, create_ts) VALUES (?, ?, ?, ?, ?)');

  data.forEach(emp => {
    const info = empStmt.run(emp.employee);
    const empId = info.lastInsertRowid || db.prepare('SELECT id FROM employees WHERE name=?').get(emp.employee).id;
    emp.records.forEach(group => {
      if (group.type === 'Lead') {
        group.records.forEach(r => {
          leadStmt.run(empId, r.firstname, r.lastname, r.create);
        });
      } else if (group.type === 'Event') {
        group.records.forEach(r => {
          const res = eventStmt.run(r.title, r.start, r.end, r.create);
          const eventId = res.lastInsertRowid;
          r.employees.forEach(name => {
            const row = db.prepare('SELECT id FROM employees WHERE name=?').get(name);
            const id = row ? row.id : empStmt.run(name).lastInsertRowid;
            eventEmpStmt.run(eventId, id);
          });
        });
      } else if (group.type === 'Patient Checkin') {
        group.records.forEach(r => {
          checkinStmt.run(empId, r.patient, r.notes, r.checkin, r.create || r.checkin);
        });
      }
    });
  });
}

export function getAllData(db) {
  const emps = db.prepare('SELECT id, name FROM employees').all();
  return emps.map(emp => {
    const leads = db.prepare('SELECT firstname, lastname, create_ts as "create" FROM leads WHERE employee_id=?').all(emp.id);
    const eventsRaw = db.prepare('SELECT id, title, start_ts as start, end_ts as end, create_ts as "create" FROM events').all();
    const eventEmps = db.prepare('SELECT event_id, employee_id FROM event_employees WHERE employee_id=?').all(emp.id);
    const myEvents = eventEmps.map(ee => {
      const evt = eventsRaw.find(e => e.id === ee.event_id);
      if (!evt) return null;
      const employees = db.prepare('SELECT name FROM employees INNER JOIN event_employees ON employees.id=event_employees.employee_id WHERE event_employees.event_id=?').all(evt.id).map(r => r.name);
      return { ...evt, employees };
    }).filter(Boolean);
    const checkins = db.prepare('SELECT patient, notes, checkin_ts as checkin, create_ts as "create" FROM checkins WHERE employee_id=?').all(emp.id);
    const groups = [];
    if (leads.length) groups.push({ type: 'Lead', records: leads });
    if (myEvents.length) groups.push({ type: 'Event', records: myEvents });
    if (checkins.length) groups.push({ type: 'Patient Checkin', records: checkins });
    return { employee: emp.name, records: groups };
  });
}

export function addLead(db, employee, lead) {
  const emp = db.prepare('SELECT id FROM employees WHERE name=?').get(employee);
  const empId = emp ? emp.id : db.prepare('INSERT INTO employees(name) VALUES (?)').run(employee).lastInsertRowid;
  db.prepare('INSERT INTO leads(employee_id, firstname, lastname, create_ts) VALUES (?, ?, ?, ?)')
    .run(empId, lead.firstname, lead.lastname, lead.create);
}

export function addEvent(db, event) {
  const res = db.prepare('INSERT INTO events(title, start_ts, end_ts, create_ts) VALUES (?, ?, ?, ?)')
    .run(event.title, event.start, event.end, event.create);
  const eventId = res.lastInsertRowid;
  event.employees.forEach(name => {
    const emp = db.prepare('SELECT id FROM employees WHERE name=?').get(name);
    const empId = emp ? emp.id : db.prepare('INSERT INTO employees(name) VALUES (?)').run(name).lastInsertRowid;
    db.prepare('INSERT INTO event_employees(event_id, employee_id) VALUES (?, ?)').run(eventId, empId);
  });
}

export function addCheckin(db, employee, checkin) {
  const emp = db.prepare('SELECT id FROM employees WHERE name=?').get(employee);
  const empId = emp ? emp.id : db.prepare('INSERT INTO employees(name) VALUES (?)').run(employee).lastInsertRowid;
  db.prepare('INSERT INTO checkins(employee_id, patient, notes, checkin_ts, create_ts) VALUES (?, ?, ?, ?, ?)')
    .run(empId, checkin.patient, checkin.notes, checkin.checkin, checkin.create);
}


