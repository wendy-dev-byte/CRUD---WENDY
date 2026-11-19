import express, { Request, Response } from 'express';
import Database from 'better-sqlite3';
 
const app = express();
const PORTA = 3000;
const db = new Database('escola.db');
 
db.exec(`
  CREATE TABLE IF NOT EXISTS alunos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
  );
`);
 
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
 
app.post('/alunos', (req: Request, res: Response) => {
  const nome = String(req.body.nome ?? '').trim();
  const email = String(req.body.email ?? '').trim();
 
  if (!nome || !email) {
    return res.status(400).send('Preencha nome e e-mail.');
  }
 
  try {
    const inserir = db.prepare(
      'INSERT INTO alunos (nome, email) VALUES (?, ?)'
    );
    inserir.run(nome, email);
    return res.send('Aluno cadastrado com sucesso! <a href="/cadastro.html">Voltar</a>');
  } catch (erro) {
    console.error(erro);
    return res.status(400).send(
      'Não foi possível cadastrar. Verifique se o e-mail já existe.'
    );
  }
});
 
app.listen(PORTA, () => {
  console.log(`Servidor em http://localhost:${PORTA}/cadastro.html`);
});




