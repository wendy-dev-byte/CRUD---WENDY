import db from './database';
 
const tabelas = db.prepare(`
  SELECT name FROM sqlite_master
  WHERE type = 'table'
`).all();
console.log('Tabelas encontradas:', tabelas);

const inserir = db.prepare(
  'INSERT INTO alunos (nome, email) VALUES (?, ?)'
);
inserir.run('WENDY', 'claraaa@email.com');







