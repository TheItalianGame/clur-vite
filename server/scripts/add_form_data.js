import { openDb, seedForms } from '../db.js';

(async () => {
  const db = await openDb();
  await seedForms(db);
  console.log('Form data inserted');
})();
