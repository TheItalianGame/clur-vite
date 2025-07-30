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
      ref_table TEXT,
      FOREIGN KEY(record_id) REFERENCES records(id)
    );
    CREATE TABLE IF NOT EXISTS formrecord (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER,
      form_type TEXT,
      title TEXT,
      active INTEGER DEFAULT 1,
      FOREIGN KEY(record_id) REFERENCES records(id)
    );
    CREATE TABLE IF NOT EXISTS formsubtabs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      label TEXT,
      ord INTEGER,
      FOREIGN KEY(form_id) REFERENCES formrecord(id)
    );
    CREATE TABLE IF NOT EXISTS formfields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      field_id INTEGER,
      ord INTEGER,
      readonly INTEGER,
      subtab_id INTEGER,
      FOREIGN KEY(form_id) REFERENCES formrecord(id),
      FOREIGN KEY(field_id) REFERENCES fields(id),
      FOREIGN KEY(subtab_id) REFERENCES formsubtabs(id)
    );
  `);

  const cols = await db.all("PRAGMA table_info(formrecord)");
  if (!cols.find(c => c.name === 'active')) {
    await db.exec('ALTER TABLE formrecord ADD COLUMN active INTEGER DEFAULT 1');
  }

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

    // insert form metadata
    const empRec = await db.run("INSERT INTO records(name) VALUES ('Employee')");
    const empRecId = empRec.lastID;
    const empField = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [empRecId, 'name', 'text']
    );
    const empMain = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'main', 'Employee')",
      [empRecId]
    );
    const empMainSub = await db.run(
      'INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, ?, ?)',
      [empMain.lastID, 'General', 1]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [empMain.lastID, empField.lastID, 1, 0, empMainSub.lastID]
    );
    const empQuick = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'quickadd', 'Add Employee')",
      [empRecId]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly) VALUES (?, ?, ?, ?)',
      [empQuick.lastID, empField.lastID, 1, 0]
    );
    const empHover = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'hover', 'Employee Hover')",
      [empRecId]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly) VALUES (?, ?, ?, ?)',
      [empHover.lastID, empField.lastID, 1, 1]
    );

    const leadRec = await db.run("INSERT INTO records(name) VALUES ('Lead')");
    const leadId = leadRec.lastID;
    const lfname = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [leadId, 'firstname', 'text']
    );
    const llname = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [leadId, 'lastname', 'text']
    );
    const lemp = await db.run(
      'INSERT INTO fields(record_id, name, type, ref_table) VALUES (?, ?, ?, ?)',
      [leadId, 'employee', 'foreign', 'employees']
    );
    const lquick = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'quickadd', 'Add Lead')",
      [leadId]
    );
    const lsub = await db.run(
      'INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, ?, ?)',
      [lquick.lastID, 'General', 1]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [lquick.lastID, lemp.lastID, 1, 0, lsub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [lquick.lastID, lfname.lastID, 2, 0, lsub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [lquick.lastID, llname.lastID, 3, 0, lsub.lastID]
    );
    const lhover = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'hover', 'Lead Hover')",
      [leadId]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly) VALUES (?, ?, ?, ?)',
      [lhover.lastID, lfname.lastID, 1, 1]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly) VALUES (?, ?, ?, ?)',
      [lhover.lastID, llname.lastID, 2, 1]
    );
    const lmain = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'main', 'Lead Details')",
      [leadId]
    );
    const lmainSub = await db.run(
      'INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, ?, ?)',
      [lmain.lastID, 'General', 1]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [lmain.lastID, lemp.lastID, 1, 1, lmainSub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [lmain.lastID, lfname.lastID, 2, 1, lmainSub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [lmain.lastID, llname.lastID, 3, 1, lmainSub.lastID]
    );

    const evtRec = await db.run("INSERT INTO records(name) VALUES ('Event')");
    const evtId = evtRec.lastID;
    const etitle = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [evtId, 'title', 'text']
    );
    const estart = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [evtId, 'start', 'text']
    );
    const eend = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [evtId, 'end', 'text']
    );
    const eemps = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [evtId, 'employees', 'text']
    );
    const eq = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'quickadd', 'Add Event')",
      [evtId]
    );
    const eqsub = await db.run(
      'INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, ?, ?)',
      [eq.lastID, 'General', 1]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [eq.lastID, eemps.lastID, 1, 0, eqsub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [eq.lastID, etitle.lastID, 2, 0, eqsub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [eq.lastID, estart.lastID, 3, 0, eqsub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [eq.lastID, eend.lastID, 4, 0, eqsub.lastID]
    );
    const eh = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'hover', 'Event Hover')",
      [evtId]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly) VALUES (?, ?, ?, ?)',
      [eh.lastID, etitle.lastID, 1, 1]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly) VALUES (?, ?, ?, ?)',
      [eh.lastID, estart.lastID, 2, 1]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly) VALUES (?, ?, ?, ?)',
      [eh.lastID, eend.lastID, 3, 1]
    );
    const em = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'main', 'Event Details')",
      [evtId]
    );
    const emsub = await db.run(
      'INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, ?, ?)',
      [em.lastID, 'General', 1]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [em.lastID, etitle.lastID, 1, 1, emsub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [em.lastID, estart.lastID, 2, 1, emsub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [em.lastID, eend.lastID, 3, 1, emsub.lastID]
    );

    const pcRec = await db.run("INSERT INTO records(name) VALUES ('Patient Checkin')");
    const pcId = pcRec.lastID;
    const pcemp = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [pcId, 'employee', 'foreign']
    );
    const pcp = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [pcId, 'patient', 'text']
    );
    const pcn = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [pcId, 'notes', 'text']
    );
    const pcc = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [pcId, 'checkin', 'text']
    );
    const pcq = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'quickadd', 'Add Checkin')",
      [pcId]
    );
    const pcqsub = await db.run(
      'INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, ?, ?)',
      [pcq.lastID, 'General', 1]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [pcq.lastID, pcemp.lastID, 1, 0, pcqsub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [pcq.lastID, pcp.lastID, 2, 0, pcqsub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [pcq.lastID, pcn.lastID, 3, 0, pcqsub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [pcq.lastID, pcc.lastID, 4, 0, pcqsub.lastID]
    );
    const pch = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'hover', 'Checkin Hover')",
      [pcId]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly) VALUES (?, ?, ?, ?)',
      [pch.lastID, pcp.lastID, 1, 1]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly) VALUES (?, ?, ?, ?)',
      [pch.lastID, pcn.lastID, 2, 1]
    );
    const pcm = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'main', 'Checkin Details')",
      [pcId]
    );
    const pcmSub = await db.run(
      'INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, ?, ?)',
      [pcm.lastID, 'General', 1]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [pcm.lastID, pcp.lastID, 1, 1, pcmSub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [pcm.lastID, pcn.lastID, 2, 1, pcmSub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [pcm.lastID, pcc.lastID, 3, 1, pcmSub.lastID]
    );
  }

  return db;
}
