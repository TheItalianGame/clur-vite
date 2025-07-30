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

  const evtRec = await db.run("INSERT INTO records(name) VALUES ('Event')");
  const evtId = evtRec.lastID;
  const t = await db.run('INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)', [evtId, 'title', 'text']);
  const s = await db.run('INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)', [evtId, 'start', 'text']);
  const e = await db.run('INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)', [evtId, 'end', 'text']);
  const emps = await db.run('INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)', [evtId, 'employees', 'text']);
  const eq = await db.run("INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'quickadd', 'Add Event')", [evtId]);
  const eqsub = await db.run('INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, ?, ?)', [eq.lastID, 'General', 1]);
  await db.run('INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)', [eq.lastID, emps.lastID, 1, 0, eqsub.lastID]);
  await db.run('INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)', [eq.lastID, t.lastID, 2, 0, eqsub.lastID]);
  await db.run('INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)', [eq.lastID, s.lastID, 3, 0, eqsub.lastID]);
  await db.run('INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)', [eq.lastID, e.lastID, 4, 0, eqsub.lastID]);

  const pcRec = await db.run("INSERT INTO records(name) VALUES ('Patient Checkin')");
  const pcId = pcRec.lastID;
  const pce = await db.run('INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)', [pcId, 'employee', 'foreign']);
  const pcp = await db.run('INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)', [pcId, 'patient', 'text']);
  const pcn = await db.run('INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)', [pcId, 'notes', 'text']);
  const pcc = await db.run('INSERT INTO fields(record_id, name, type) VALUES (?, ?, ?)', [pcId, 'checkin', 'text']);
  const pcform = await db.run("INSERT INTO formrecord(record_id, form_type, title) VALUES (?, 'quickadd', 'Add Checkin')", [pcId]);
  const pcsub = await db.run('INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, ?, ?)', [pcform.lastID, 'General', 1]);
  await db.run('INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)', [pcform.lastID, pce.lastID, 1, 0, pcsub.lastID]);
  await db.run('INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)', [pcform.lastID, pcp.lastID, 2, 0, pcsub.lastID]);
  await db.run('INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)', [pcform.lastID, pcn.lastID, 3, 0, pcsub.lastID]);
  await db.run('INSERT INTO formfields(form_id, field_id, ord, readonly, subtab_id) VALUES (?, ?, ?, ?, ?)', [pcform.lastID, pcc.lastID, 4, 0, pcsub.lastID]);
  console.log('Form data inserted');
}

main();
