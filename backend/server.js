const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db'); // Import the database configuration
const app = express();
const port = 3000;
const saltRounds = 10;

app.use(cors());
app.use(express.json());

app.get('/passwords', (req, res) => {
  db.all('SELECT id, website, username, password FROM passwords', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/passwords', (req, res) => {
  const { website, username, password } = req.body;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    db.run('INSERT INTO passwords (website, username, password) VALUES (?, ?, ?)', [website, username, hash], function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID, website, username, password });
    });
  });
});


app.delete('/passwords/:id', (req, res) => {
  db.run('DELETE FROM passwords WHERE id = ?', req.params.id, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(204).send();
  });
});

app.listen(port, () => {
  console.log(`Password manager backend listening at http://localhost:${port}`);
});
