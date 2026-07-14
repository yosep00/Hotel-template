import fs from 'fs';

const token = process.env.SUPABASE_TOKEN;
const ref = 'tllhcgdbyecsnvkapqqh';
const sqlFile = process.argv[2];

if (!token) {
  console.error('Falta SUPABASE_TOKEN');
  process.exit(1);
}
if (!sqlFile) {
  console.error('Uso: node run_sql.mjs <archivo.sql>');
  process.exit(1);
}

const sql = fs.readFileSync(sqlFile, 'utf8').replace(/^\uFEFF/, '');

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

console.log('HTTP', res.status);
console.log(await res.text());
