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

    const eventRec = await db.run("INSERT INTO records(name) VALUES ('Event')");
    const eventId = eventRec.lastID;
    const etitle = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [eventId, 'title', 'text']
    );
    const estart = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [eventId, 'start', 'text']
    );
    const eend = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [eventId, 'end', 'text']
    );
    const eemps = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [eventId, 'employees', 'text']
    );
    const equick = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'quickadd', 'Add Event')",
      [eventId]
    );
    const eqsub = await db.run(
      'INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, ?, ?)',
      [equick.lastID, 'General', 1]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [equick.lastID, etitle.lastID, 1, 0, eqsub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [equick.lastID, estart.lastID, 2, 0, eqsub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [equick.lastID, eend.lastID, 3, 0, eqsub.lastID]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
      [equick.lastID, eemps.lastID, 4, 0, eqsub.lastID]
    );
    const ehover = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'hover', 'Event Hover')",
      [eventId]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly) VALUES (?, ?, ?, ?)',
      [ehover.lastID, etitle.lastID, 1, 1]
    );
    const emain = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'main', 'Event Details')",
      [eventId]
    );
    const emainSub = await db.run(
      'INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, ?, ?)',
      [emain.lastID, 'General', 1]
    );
    for (const [idx, fid] of [etitle.lastID, estart.lastID, eend.lastID, eemps.lastID].entries()) {
      await db.run(
        'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
        [emain.lastID, fid, idx + 1, 1, emainSub.lastID]
      );
    }

    const checkRec = await db.run("INSERT INTO records(name) VALUES ('Patient Checkin')");
    const checkId = checkRec.lastID;
    const cemp = await db.run(
      'INSERT INTO fields(record_id, name, type, ref_table) VALUES (?, ?, ?, ?)',
      [checkId, 'employee', 'foreign', 'employees']
    );
    const cpatient = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [checkId, 'patient', 'text']
    );
    const cnotes = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [checkId, 'notes', 'text']
    );
    const ccheck = await db.run(
      'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
      [checkId, 'checkin', 'text']
    );
    const cquick = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'quickadd', 'Add Checkin')",
      [checkId]
    );
    const cqsub = await db.run(
      'INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, ?, ?)',
      [cquick.lastID, 'General', 1]
    );
    for (const [idx, fid] of [cemp.lastID, cpatient.lastID, cnotes.lastID, ccheck.lastID].entries()) {
      await db.run(
        'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
        [cquick.lastID, fid, idx + 1, 0, cqsub.lastID]
      );
    }
    const chover = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'hover', 'Checkin Hover')",
      [checkId]
    );
    await db.run(
      'INSERT INTO formfields(form_id, field_id, ord, readonly) VALUES (?, ?, ?, ?)',
      [chover.lastID, cpatient.lastID, 1, 1]
    );
    const cmain = await db.run(
      "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'main', 'Checkin Details')",
      [checkId]
    );
    const cmainSub = await db.run(
      'INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, ?, ?)',
      [cmain.lastID, 'General', 1]
    );
    for (const [idx, fid] of [cemp.lastID, cpatient.lastID, cnotes.lastID, ccheck.lastID].entries()) {
      await db.run(
        'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
        [cmain.lastID, fid, idx + 1, 1, cmainSub.lastID]
      );
    }
  }

  return db;
}
