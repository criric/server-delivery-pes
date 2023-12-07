const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 5000;

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'teste',
});

app.use(cors());
app.use(express.json());

// Rota GET para obter todos os itens
app.get('/api/itens', async (req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM ITEM_MENU');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao obter itens:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// Rota POST para criar um novo item
app.post('/api/itens', async (req, res) => {
  const { name, description, category, price, manager_id, date_update } = req.body;

  try {
    const [result] = await connection.query(
      'INSERT INTO ITEM_MENU (name, description, category, price, manager_id, date_update) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, category, price, manager_id, date_update]
    );

    const newItemId = result.insertId;

    res.status(201).json({ id: newItemId, message: 'Item criado com sucesso!' });
  } catch (error) {
    console.error('Erro ao criar um novo item:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.get('/api/itens/:id', async (req, res) => {
  const itemId = req.params.id;

  try {
    const [rows] = await connection.query('SELECT * FROM ITEM_MENU WHERE id = ?', [itemId]);

    if (rows.length === 1) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Item não encontrado');
    }
  } catch (error) {
    console.error('Erro ao obter o item pelo ID:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.put('/api/itens/:id', async (req, res) => {
  const itemId = req.params.id;
  const { name, description, category, price, manager_id, date_update } = req.body;

  try {
    const [result] = await connection.query(
      'UPDATE ITEM_MENU SET name = ?, description = ?, category = ?, price = ?, manager_id = ?, date_update = ? WHERE id = ?',
      [name, description, category, price, manager_id, date_update, itemId]
    );

    if (result.affectedRows === 1) {
      res.json({ id: itemId, message: 'Item atualizado com sucesso!' });
    } else {
      res.status(404).send('Item não encontrado');
    }
  } catch (error) {
    console.error('Erro ao editar o item pelo ID:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// Rota DELETE para excluir um item pelo ID
app.delete('/api/itens/:id', async (req, res) => {
  const itemId = req.params.id;

  try {
    const [result] = await connection.query('DELETE FROM ITEM_MENU WHERE id = ?', [itemId]);

    if (result.affectedRows === 1) {
      res.json({ id: itemId, message: 'Item excluído com sucesso!' });
    } else {
      res.status(404).send('Item não encontrado');
    }
  } catch (error) {
    console.error('Erro ao excluir o item pelo ID:', error);
    res.status(500).send('Erro interno do servidor');
  }
});


app.listen(port, () => {
  console.log(`Servidor está rodando em http://localhost:${port}`);
});
