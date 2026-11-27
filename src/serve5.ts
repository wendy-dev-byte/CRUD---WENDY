
import express, { Request, Response } from 'express';
import Database from 'better-sqlite3';

const app = express();
const PORTA = 3000;
const db = new Database('escola.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        preco REAL NOT NULL CHECK (preco > 0),
        quantidade INTEGER NOT NULL CHECK (quantidade >= 0)
    );
`);

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.post('/produtos', (req: Request, res: Response) => {
    const nome = String(req.body.nome ?? '').trim();
    const preco = Number(req.body.preco);
    const quantidade = Number(req.body.quantidade);

    if (!nome || !Number.isFinite(preco) || preco <= 0 ||
        !Number.isInteger(quantidade) || quantidade < 0) {
        return res.status(400).send('Dados inválidos. Volte e confira o formulário.');
    }

    const inserir = db.prepare(`
        INSERT INTO produtos (nome, preco, quantidade)
        VALUES (?, ?, ?)
    `);

    inserir.run(nome, preco, quantidade);
    return res.send('Produto cadastrado! <a href="/cadastro.html">Voltar</a>');
});

app.get('/produtos', (_req: Request, res: Response) => {
    const produtos = db.prepare(
        'SELECT * FROM produtos ORDER BY nome'
    ).all() as { id: number; nome: string; preco: number; quantidade: number }[];

    const linhas = produtos.map((p) => `
        <tr>
            <td>${p.id}</td>
            <td>${escapeHtml(p.nome)}</td>
            <td>R$ ${p.preco.toFixed(2)}</td>
            <td>${p.quantidade}</td>
        </tr>
    `).join('');

    return res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><meta charset="UTF-8"><title>Produtos</title></head>
        <body>
            <h1>Produtos cadastrados</h1>
            <table border="1">
                <tr><th>ID</th><th>Nome</th><th>Preço</th><th>Quantidade</th></tr>
                ${linhas}
            </table>
            <p><a href="/cadastro.html">Voltar ao cadastro</a></p>
        </body>
        </html>
    `);
});

app.post('/produtos/excluir', (req: Request, res: Response) => {
    const id = Number(req.body.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).send('Código inválido.');
    }

    const resultado = db.prepare(
        'DELETE FROM produtos WHERE id = ?'
    ).run(id);

    if (resultado.changes === 0) {
        return res.status(404).send('Produto não encontrado.');
    }

    return res.send('Produto excluído! <a href="/cadastro.html">Voltar</a>');
});

function escapeHtml(valor: string): string {
    return valor.replace(/[&<>"']/g, (caractere) => {
        const mapa: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return mapa[caractere];
    });
}

app.listen(PORTA, () => {
    console.log(`Acesse http://localhost:${PORTA}/cadastro.html`);
});
