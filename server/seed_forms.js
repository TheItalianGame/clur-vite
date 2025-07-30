import { openDb } from './db.js';

async function run() {
  const db = await openDb();

  const defs = {
    Lead: {
      fields: [
        { name: 'employee_id', type: 'integer', foreign_table: 'employees' },
        { name: 'firstname', type: 'text' },
        { name: 'lastname', type: 'text' },
        { name: 'created', type: 'text' },
      ],
      forms: {
        quickadd: [
          { field: 'employee_id', label: 'Employee', readonly: 0, order: 1 },
          { field: 'firstname', label: 'First Name', readonly: 0, order: 2 },
          { field: 'lastname', label: 'Last Name', readonly: 0, order: 3 },
        ],
        hover: [
          { field: 'firstname', label: 'First Name', readonly: 1, order: 1 },
          { field: 'lastname', label: 'Last Name', readonly: 1, order: 2 },
          { field: 'created', label: 'Created', readonly: 1, order: 3 },
        ],
        main: [
          { field: 'employee_id', label: 'Employee', readonly: 0, order: 1 },
          { field: 'firstname', label: 'First Name', readonly: 0, order: 2 },
          { field: 'lastname', label: 'Last Name', readonly: 0, order: 3 },
          { field: 'created', label: 'Created', readonly: 0, order: 4 },
        ],
      },
    },
    Event: {
      fields: [
        { name: 'title', type: 'text' },
        { name: 'start', type: 'text' },
        { name: 'end', type: 'text' },
        { name: 'created', type: 'text' },
      ],
      forms: {
        quickadd: [
          { field: 'title', label: 'Title', readonly: 0, order: 1 },
          { field: 'start', label: 'Start', readonly: 0, order: 2 },
          { field: 'end', label: 'End', readonly: 0, order: 3 },
        ],
        hover: [
          { field: 'title', label: 'Title', readonly: 1, order: 1 },
          { field: 'start', label: 'Start', readonly: 1, order: 2 },
          { field: 'end', label: 'End', readonly: 1, order: 3 },
        ],
        main: [
          { field: 'title', label: 'Title', readonly: 0, order: 1 },
          { field: 'start', label: 'Start', readonly: 0, order: 2 },
          { field: 'end', label: 'End', readonly: 0, order: 3 },
          { field: 'created', label: 'Created', readonly: 0, order: 4 },
        ],
      },
    },
    'Patient Checkin': {
      fields: [
        { name: 'employee_id', type: 'integer', foreign_table: 'employees' },
        { name: 'patient', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'checkin', type: 'text' },
        { name: 'created', type: 'text' },
      ],
      forms: {
        quickadd: [
          { field: 'employee_id', label: 'Employee', readonly: 0, order: 1 },
          { field: 'patient', label: 'Patient', readonly: 0, order: 2 },
          { field: 'notes', label: 'Notes', readonly: 0, order: 3 },
          { field: 'checkin', label: 'Checkin', readonly: 0, order: 4 },
        ],
        hover: [
          { field: 'patient', label: 'Patient', readonly: 1, order: 1 },
          { field: 'checkin', label: 'Checkin', readonly: 1, order: 2 },
          { field: 'notes', label: 'Notes', readonly: 1, order: 3 },
        ],
        main: [
          { field: 'employee_id', label: 'Employee', readonly: 0, order: 1 },
          { field: 'patient', label: 'Patient', readonly: 0, order: 2 },
          { field: 'checkin', label: 'Checkin', readonly: 0, order: 3 },
          { field: 'notes', label: 'Notes', readonly: 0, order: 4 },
          { field: 'created', label: 'Created', readonly: 0, order: 5 },
        ],
      },
    },
  };

  for (const [recName, recDef] of Object.entries(defs)) {
    await db.run('INSERT OR IGNORE INTO records(name) VALUES (?)', [recName]);
    const recRow = await db.get('SELECT id FROM records WHERE name=?', [recName]);
    const recId = recRow.id;
    for (const f of recDef.fields) {
      await db.run(
        'INSERT OR IGNORE INTO fields(record_id, name, type, foreign_table) VALUES (?,?,?,?)',
        [recId, f.name, f.type, f.foreign_table || null],
      );
    }
    for (const [formType, fields] of Object.entries(recDef.forms)) {
      await db.run(
        'INSERT OR IGNORE INTO form_records(record_id, form_type, label) VALUES (?,?,?)',
        [recId, formType, `${recName} ${formType}`],
      );
      const fr = await db.get(
        'SELECT id FROM form_records WHERE record_id=? AND form_type=?',
        [recId, formType],
      );
      for (const fld of fields) {
        const fldRow = await db.get(
          'SELECT id FROM fields WHERE record_id=? AND name=?',
          [recId, fld.field],
        );
        await db.run(
          'INSERT OR REPLACE INTO form_fields(form_record_id, field_id, label, readonly, sort_order) VALUES (?,?,?,?,?)',
          [fr.id, fldRow.id, fld.label, fld.readonly, fld.order],
        );
      }
    }
  }
  console.log('Form data seeded');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
