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
      name TEXT UNIQUE
    );
    CREATE TABLE IF NOT EXISTS fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER,
      name TEXT,
      type TEXT,
      foreign_table TEXT,
      FOREIGN KEY(record_id) REFERENCES records(id)
    );
    CREATE TABLE IF NOT EXISTS formrecords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER,
      type TEXT,
      title TEXT,
      FOREIGN KEY(record_id) REFERENCES records(id)
    );
    CREATE TABLE IF NOT EXISTS formsubtabs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      name TEXT,
      sort_order INTEGER,
      FOREIGN KEY(form_id) REFERENCES formrecords(id)
    );
    CREATE TABLE IF NOT EXISTS formfields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      field_id INTEGER,
      subtab_id INTEGER,
      label TEXT,
      read_only INTEGER,
      sort_order INTEGER,
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
    await seedForms(db);
  }

  return db;
}

export async function seedForms(db) {
  const leadRec = await db.run("INSERT INTO records(name) VALUES ('Lead')");
  const eventRec = await db.run("INSERT INTO records(name) VALUES ('Event')");
  const checkRec = await db.run("INSERT INTO records(name) VALUES ('Patient Checkin')");
  await db.run("INSERT INTO records(name) VALUES ('Employee')");

  const leadId = leadRec.lastID;
  const eventId = eventRec.lastID;
  const checkId = checkRec.lastID;

  const leadFName = (await db.run("INSERT INTO fields(record_id,name,type) VALUES (?,?,?)", [leadId,'firstname','text'])).lastID;
  const leadLName = (await db.run("INSERT INTO fields(record_id,name,type) VALUES (?,?,?)", [leadId,'lastname','text'])).lastID;

  const evtTitle = (await db.run("INSERT INTO fields(record_id,name,type) VALUES (?,?,?)", [eventId,'title','text'])).lastID;
  const evtStart = (await db.run("INSERT INTO fields(record_id,name,type) VALUES (?,?,?)", [eventId,'start','datetime'])).lastID;
  const evtEnd = (await db.run("INSERT INTO fields(record_id,name,type) VALUES (?,?,?)", [eventId,'end','datetime'])).lastID;

  const chkPatient = (await db.run("INSERT INTO fields(record_id,name,type) VALUES (?,?,?)", [checkId,'patient','text'])).lastID;
  const chkNotes = (await db.run("INSERT INTO fields(record_id,name,type) VALUES (?,?,?)", [checkId,'notes','text'])).lastID;
  const chkCheckin = (await db.run("INSERT INTO fields(record_id,name,type) VALUES (?,?,?)", [checkId,'checkin','datetime'])).lastID;

  const quickLeadForm = (await db.run("INSERT INTO formrecords(record_id,type,title) VALUES (?,?,?)", [leadId,'quickadd','Add Lead'])).lastID;
  await db.run("INSERT INTO formfields(form_id,field_id,label,read_only,sort_order) VALUES (?,?,?,?,?)", [quickLeadForm, leadFName, 'First Name', 0, 1]);
  await db.run("INSERT INTO formfields(form_id,field_id,label,read_only,sort_order) VALUES (?,?,?,?,?)", [quickLeadForm, leadLName, 'Last Name', 0, 2]);

  const hoverLeadForm = (await db.run("INSERT INTO formrecords(record_id,type,title) VALUES (?,?,?)", [leadId,'hover','Lead'])).lastID;
  await db.run("INSERT INTO formfields(form_id,field_id,label,read_only,sort_order) VALUES (?,?,?,?,?)", [hoverLeadForm, leadFName, 'First Name', 1, 1]);
  await db.run("INSERT INTO formfields(form_id,field_id,label,read_only,sort_order) VALUES (?,?,?,?,?)", [hoverLeadForm, leadLName, 'Last Name', 1, 2]);

  const eventQuickForm = (await db.run("INSERT INTO formrecords(record_id,type,title) VALUES (?,?,?)", [eventId,'quickadd','Add Event'])).lastID;
  await db.run("INSERT INTO formfields(form_id,field_id,label,read_only,sort_order) VALUES (?,?,?,?,?)", [eventQuickForm, evtTitle, 'Title', 0, 1]);
  await db.run("INSERT INTO formfields(form_id,field_id,label,read_only,sort_order) VALUES (?,?,?,?,?)", [eventQuickForm, evtStart, 'Start', 0, 2]);
  await db.run("INSERT INTO formfields(form_id,field_id,label,read_only,sort_order) VALUES (?,?,?,?,?)", [eventQuickForm, evtEnd, 'End', 0, 3]);

  const checkQuickForm = (await db.run("INSERT INTO formrecords(record_id,type,title) VALUES (?,?,?)", [checkId,'quickadd','Add Checkin'])).lastID;
  await db.run("INSERT INTO formfields(form_id,field_id,label,read_only,sort_order) VALUES (?,?,?,?,?)", [checkQuickForm, chkPatient, 'Patient', 0, 1]);
  await db.run("INSERT INTO formfields(form_id,field_id,label,read_only,sort_order) VALUES (?,?,?,?,?)", [checkQuickForm, chkNotes, 'Notes', 0, 2]);
  await db.run("INSERT INTO formfields(form_id,field_id,label,read_only,sort_order) VALUES (?,?,?,?,?)", [checkQuickForm, chkCheckin, 'Checkin', 0, 3]);
}
