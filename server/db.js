import { existsSync, readFileSync } from 'fs';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data.db');

export async function openDb() {
  return open({ filename: DB_FILE, driver: sqlite3.Database });
}

export async function initDb() {
  const exists = existsSync(DB_FILE);
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    );
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER,
      firstname TEXT,
      lastname TEXT,
      created TEXT,
      FOREIGN KEY(employee_id) REFERENCES employees(id)
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      start TEXT,
      end TEXT,
      created TEXT
    );
    CREATE TABLE IF NOT EXISTS event_employees (
      event_id INTEGER,
      employee_id INTEGER,
      PRIMARY KEY (event_id, employee_id),
      FOREIGN KEY(event_id) REFERENCES events(id),
      FOREIGN KEY(employee_id) REFERENCES employees(id)
    );
    CREATE TABLE IF NOT EXISTS patient_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER,
      patient TEXT,
      notes TEXT,
      checkin TEXT,
      created TEXT,
      FOREIGN KEY(employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      table_name TEXT
    );

    CREATE TABLE IF NOT EXISTS fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER,
      name TEXT,
      type TEXT,
      ref_table TEXT,
      FOREIGN KEY(record_id) REFERENCES records(id)
    );

    CREATE TABLE IF NOT EXISTS formrecords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER,
      form_type TEXT,
      label TEXT,
      FOREIGN KEY(record_id) REFERENCES records(id)
    );

    CREATE TABLE IF NOT EXISTS formsubtabs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      label TEXT,
      ord INTEGER,
      FOREIGN KEY(form_id) REFERENCES formrecords(id)
    );

    CREATE TABLE IF NOT EXISTS formfields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      field_id INTEGER,
      subtab_id INTEGER,
      label TEXT,
      ord INTEGER,
      readonly INTEGER,
      FOREIGN KEY(form_id) REFERENCES formrecords(id),
      FOREIGN KEY(field_id) REFERENCES fields(id),
      FOREIGN KEY(subtab_id) REFERENCES formsubtabs(id)
    );
  `);

  if (!exists) {
    const raw = readFileSync('./src/data/fake_data.json', 'utf-8');
    const data = JSON.parse(raw);
    for (const emp of data) {
      const { employee, records } = emp;
      const empRes = await db.run('INSERT INTO employees(name) VALUES (?)', [employee]);
      const empId = empRes.lastID;
      for (const grp of records) {
        if (grp.type === 'Lead') {
          for (const r of grp.records) {
            await db.run(
              'INSERT INTO leads(employee_id, firstname, lastname, created) VALUES (?, ?, ?, ?)',
              [empId, r.firstname, r.lastname, r.create]
            );
          }
        } else if (grp.type === 'Event') {
          for (const r of grp.records) {
            const evtRes = await db.run(
              'INSERT INTO events(title, start, end, created) VALUES (?, ?, ?, ?)',
              [r.title, r.start, r.end, r.create]
            );
            const evtId = evtRes.lastID;
            for (const ename of r.employees) {
              let e = await db.get('SELECT id FROM employees WHERE name=?', [ename]);
              if (!e) {
                const ins = await db.run('INSERT INTO employees(name) VALUES (?)', [ename]);
                e = { id: ins.lastID };
              }
              await db.run('INSERT INTO event_employees(event_id, employee_id) VALUES (?, ?)', [evtId, e.id]);
            }
          }
        } else if (grp.type === 'Patient Checkin') {
          for (const r of grp.records) {
            const create = r.create || r.checkin;
            await db.run(
              'INSERT INTO patient_checkins(employee_id, patient, notes, checkin, created) VALUES (?, ?, ?, ?, ?)',
              [empId, r.patient, r.notes, r.checkin, create]
            );
          }
        }
      }
    }

    // seed form metadata for employees
    const recRes = await db.run(
      "INSERT INTO records(name, table_name) VALUES ('employee', 'employees')"
    );
    const recId = recRes.lastID;
    const fldRes = await db.run(
      "INSERT INTO fields(record_id, name, type) VALUES (?, 'name', 'text')",
      [recId]
    );
    const fldId = fldRes.lastID;
    const quickRes = await db.run(
      "INSERT INTO formrecords(record_id, form_type, label) VALUES (?, 'quickadd', 'Add Employee')",
      [recId]
    );
    const hoverRes = await db.run(
      "INSERT INTO formrecords(record_id, form_type, label) VALUES (?, 'hover', 'Employee Info')",
      [recId]
    );
    const summaryRes = await db.run(
      "INSERT INTO formrecords(record_id, form_type, label) VALUES (?, 'summary', 'Employee Summary')",
      [recId]
    );
    const subRes = await db.run(
      "INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, 'General', 1)",
      [summaryRes.lastID]
    );
    const subId = subRes.lastID;
    await db.run(
      "INSERT INTO formfields(form_id, field_id, ord, readonly, label) VALUES (?, ?, 1, 0, 'Name')",
      [quickRes.lastID, fldId]
    );
    await db.run(
      "INSERT INTO formfields(form_id, field_id, ord, readonly, label) VALUES (?, ?, 1, 1, 'Name')",
      [hoverRes.lastID, fldId]
    );
    await db.run(
      "INSERT INTO formfields(form_id, field_id, subtab_id, ord, readonly, label) VALUES (?, ?, ?, 1, 1, 'Name')",
      [summaryRes.lastID, fldId, subId]
    );
  }

  return db;
}
