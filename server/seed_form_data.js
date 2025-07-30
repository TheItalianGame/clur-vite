import { openDb } from './db.js';

const db = await openDb();

await db.exec(`DELETE FROM formfields; DELETE FROM formsubtabs; DELETE FROM formrecords; DELETE FROM fields; DELETE FROM records;`);

const recRes = await db.run("INSERT INTO records(name, table_name) VALUES ('employee', 'employees')");
const recId = recRes.lastID;
const fldRes = await db.run("INSERT INTO fields(record_id, name, type) VALUES (?, 'name', 'text')", [recId]);
const fldId = fldRes.lastID;
const quickRes = await db.run("INSERT INTO formrecords(record_id, form_type, label) VALUES (?, 'quickadd', 'Add Employee')", [recId]);
const hoverRes = await db.run("INSERT INTO formrecords(record_id, form_type, label) VALUES (?, 'hover', 'Employee Info')", [recId]);
const summaryRes = await db.run("INSERT INTO formrecords(record_id, form_type, label) VALUES (?, 'summary', 'Employee Summary')", [recId]);
const subRes = await db.run("INSERT INTO formsubtabs(form_id, label, ord) VALUES (?, 'General', 1)", [summaryRes.lastID]);
const subId = subRes.lastID;
await db.run("INSERT INTO formfields(form_id, field_id, ord, readonly, label) VALUES (?, ?, 1, 0, 'Name')", [quickRes.lastID, fldId]);
await db.run("INSERT INTO formfields(form_id, field_id, ord, readonly, label) VALUES (?, ?, 1, 1, 'Name')", [hoverRes.lastID, fldId]);
await db.run("INSERT INTO formfields(form_id, field_id, subtab_id, ord, readonly, label) VALUES (?, ?, ?, 1, 1, 'Name')", [summaryRes.lastID, fldId, subId]);

await db.close();
