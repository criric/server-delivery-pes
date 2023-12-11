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

// Rota POST para adicionar um item ao carrinho
app.post('/api/cart', async (req, res) => {
  const { item_menu_id } = req.body;

  try {
    // Verificar se o usuário e o item do menu existem
    const [itemRows] = await connection.query('SELECT * FROM ITEM_MENU WHERE id = ?', [item_menu_id]);

    if ( itemRows.length !== 1) {
      return res.status(404).send('Usuário ou item do menu não encontrado');
    }

    // Adicionar o item ao carrinho
    const [result] = await connection.query(
      'INSERT INTO CART (item_menu_id) VALUES (?)',
      [item_menu_id]
    );

    const newItemCartId = result.insertId;

    res.status(201).json({ id: newItemCartId, message: 'Item adicionado ao carrinho com sucesso!' });
  } catch (error) {
    console.error('Erro geral na rota /api/cart:', error);
    console.error('Erro ao adicionar item ao carrinho:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// Rota GET para obter os itens do carrinho de um usuário
app.get('/api/cart', async (req, res) => {
  try {
    // Obter todos os itens do carrinho
    const [itemRows] = await connection.query(
      'SELECT ITEM_MENU.* FROM ITEM_MENU ' +
      'JOIN CART ON ITEM_MENU.id = CART.item_menu_id'
    );

    res.json(itemRows);
  } catch (error) {
    console.error('Erro ao obter os itens do carrinho:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.delete('/api/cart/:item_menu_id', async (req, res) => {
  const itemMenuId = req.params.item_menu_id;

  try {
    const [result] = await connection.query('DELETE FROM CART WHERE item_menu_id = ?', [itemMenuId]);

    if (result.affectedRows === 1) {
      res.json({ item_menu_id: itemMenuId, message: 'Item do carrinho excluído com sucesso!' });
    } else {
      res.status(404).send('Item do carrinho não encontrado');
    }
  } catch (error) {
    console.error('Erro ao excluir o item do carrinho pelo ID:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// Rota GET para obter os endereços de um cliente
app.get('/api/address', async (req, res) => {
  const fixedClientId = '12345678910'; // Substitua pelo CPF do cliente específico

  try {
    // Execute a lógica necessária para obter o endereço do banco de dados
    // (por exemplo, usando o pool de conexões MySQL)

    // Substitua o trecho abaixo pelo código específico para obter os dados do banco de dados
    const [rows] = await connection.query('SELECT * FROM ADDRESS WHERE client_id = ?', [fixedClientId]);

    if (rows.length === 1) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Endereço não encontrado para o cliente específico');
    }
  } catch (error) {
    console.error('Erro ao obter endereço:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

const fixedClientId = '12345678910'; // Substitua pelo CPF do cliente específico

app.post('/api/address', async (req, res) => {
  const { cep, street, number, complement } = req.body;

  try {
    // Execute a lógica necessária para verificar se já existe um endereço para o cliente no banco de dados
    const [existingRows] = await connection.query('SELECT * FROM ADDRESS WHERE client_id = ?', [fixedClientId]);

    if (existingRows.length === 1) {
      // Se já existe um endereço, atualize os dados
      await connection.query('UPDATE ADDRESS SET cep=?, street=?, number=?, complement=? WHERE client_id=?',
        [cep, street, number, complement, fixedClientId]);

      res.json({ message: 'Endereço atualizado com sucesso!' });
    } else {
      // Se não existe um endereço, crie um novo
      await connection.query('INSERT INTO ADDRESS (client_id, cep, street, number, complement) VALUES (?, ?, ?, ?, ?)',
        [fixedClientId, cep, street, number, complement]);

      res.json({ message: 'Endereço cadastrado com sucesso!' });
    }
  } catch (error) {
    console.error('Erro durante a requisição:', error);
    res.status(500).send('Erro interno do servidor');
  }
});


app.listen(port, () => {
  console.log(`Servidor está rodando em http://localhost:${port}`);
});
