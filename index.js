require('dotenv').config({ override: true });
const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Conexión a la base de datos de Heimdall
const db = new Database(path.resolve(__dirname, process.env.DB_PATH || ''));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Servir iconos y fondos de la carpeta config original
app.use('/icons', express.static(path.resolve(__dirname, process.env.ICONS_PATH)));
app.use('/backgrounds', express.static(path.resolve(__dirname, process.env.BACKGROUNDS_PATH)));

// Ruta principal: Dashboard
app.get('/', (req, res) => {
    try {
        const items = db.prepare('SELECT * FROM items ORDER BY title ASC').all();
        const backgroundUrl = process.env.BACKGROUND_URL;
        res.render('index', { items, backgroundUrl });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al leer la base de datos');
    }
});

// Ruta de Edición: Listar ítems para editar
app.get('/edit', (req, res) => {
    const items = db.prepare('SELECT * FROM items ORDER BY title').all();
    const backgroundUrl = process.env.BACKGROUND_URL;
    res.render('edit', { items, backgroundUrl });
    // res.render('edit', { items });
});

// Procesar edición (Ejemplo simple)
app.post('/edit/:id', (req, res) => {
    const { title, url } = req.body;
    const { id } = req.params;
    db.prepare('UPDATE items SET title = ?, url = ? WHERE id = ?').run(title, url, id);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`🚀 SimpleDashboard corriendo en http://localhost:${port}`);
});