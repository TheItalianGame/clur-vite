import { openDb } from './db.js';

async function main() {
  const db = await openDb();

  const empRec = await db.run("INSERT INTO records(name) VALUES ('Employee')");
  const empRecId = empRec.lastID;
  const empField = await db.run(
    'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
    [empRecId, 'name', 'text']
  );
  const empForm = await db.run(
    "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'main', 'Employee')",
    [empRecId]
  );
  const empSub = await db.run(
    'INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, ?, ?)',
    [empForm.lastID, 'General', 1]
  );
  await db.run(
    'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
    [empForm.lastID, empField.lastID, 1, 0, empSub.lastID]
  );

  const leadRec = await db.run("INSERT INTO records(name) VALUES ('Lead')");
  const leadId = leadRec.lastID;
  const f1 = await db.run(
    'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
    [leadId, 'firstname', 'text']
  );
  const f2 = await db.run(
    'INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)',
    [leadId, 'lastname', 'text']
  );
  const f3 = await db.run(
    'INSERT INTO fields(record_id, name, type, ref_table) VALUES (?, ?, ?, ?)',
    [leadId, 'employee', 'foreign', 'employees']
  );
  const qform = await db.run(
    "INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'quickadd', 'Add Lead')",
    [leadId]
  );
  const sub = await db.run(
    'INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, ?, ?)',
    [qform.lastID, 'General', 1]
  );
  await db.run(
    'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
    [qform.lastID, f3.lastID, 1, 0, sub.lastID]
  );
  await db.run(
    'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
    [qform.lastID, f1.lastID, 2, 0, sub.lastID]
  );
  await db.run(
    'INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)',
    [qform.lastID, f2.lastID, 3, 0, sub.lastID]
  );
  console.log('Form data inserted');
}

main();
