require('dotenv').config({ override: true });
const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const axios = require('axios');
const https = require('https');
const AdmZip = require('adm-zip');

const app = express();
const port = process.env.PORT || 3000;

// Agente HTTPS para ignorar errores de certificados (común en servidores locales)
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

// Configuración de multer para subida de iconos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.resolve(__dirname, 'public/icons');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const hash = crypto.createHash('sha256').update(file.originalname).digest('hex');
        cb(null, `${hash}${ext}`);
    }
});
const upload = multer({ storage });

// Configuración de multer para fondos de pantalla
const bgStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.resolve(__dirname, 'public/backgrounds');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const hash = crypto.createHash('sha256').update(file.originalname).digest('hex');
        cb(null, `bg_${hash}${ext}`);
    }
});
const uploadBg = multer({ storage: bgStorage });

// Conexión a la base de datos de Heimdall
let db = new Database(path.resolve(__dirname, process.env.DB_PATH || ''));

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
        // Obtener fondo de la base de datos si existe, sino usar el del .env
        const bgSetting = db.prepare("SELECT value FROM settings WHERE key = 'background_image'").get();
        const backgroundUrl = bgSetting && bgSetting.value ? `/backgrounds/${bgSetting.value}` : process.env.BACKGROUND_URL;
        res.render('index', { items, backgroundUrl });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al leer la base de datos');
    }
});

// Ruta de Edición: Listar ítems para editar
app.get('/edit', (req, res) => {
    const items = db.prepare('SELECT * FROM items ORDER BY title').all();
    const bgSetting = db.prepare("SELECT value FROM settings WHERE key = 'background_image'").get();
    const backgroundUrl = bgSetting && bgSetting.value ? `/backgrounds/${bgSetting.value}` : process.env.BACKGROUND_URL;
    
    // Listar fondos disponibles
    const bgDir = path.resolve(__dirname, 'public/backgrounds');
    let availableBackgrounds = [];
    if (fs.existsSync(bgDir)) {
        availableBackgrounds = fs.readdirSync(bgDir).filter(f => f.startsWith('bg_'));
    }
    
    res.render('edit', { items, backgroundUrl, availableBackgrounds });
});

// Cambiar fondo de pantalla
app.post('/set-background', (req, res) => {
    const { background } = req.body;
    db.prepare("UPDATE settings SET value = ? WHERE key = 'background_image'").run(background);
    res.redirect('/edit');
});

// Subir nuevo fondo de pantalla
app.post('/upload-background', uploadBg.single('bgFile'), (req, res) => {
    if (req.file) {
        db.prepare("UPDATE settings SET value = ? WHERE key = 'background_image'").run(req.file.filename);
    }
    res.redirect('/edit');
});

// Procesar edición (Ejemplo simple)
app.post('/edit/:id', (req, res) => {
    const { title, url } = req.body;
    const { id } = req.params;
    db.prepare('UPDATE items SET title = ?, url = ? WHERE id = ?').run(title, url, id);
    res.redirect('/');
});

// Eliminar aplicación
app.post('/delete/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM items WHERE id = ?').run(id);
    res.redirect('/edit');
});

// Agregar nueva aplicación
app.post('/add', upload.single('iconFile'), (req, res) => {
    const { title, url } = req.body;
    let iconPath = null;

    if (req.file) {
        iconPath = `icons/${req.file.filename}`;
    }

    db.prepare('INSERT INTO items (title, url, icon) VALUES (?, ?, ?)').run(title, url, iconPath);
    res.redirect('/');
});

// API para verificar estado de una aplicación
app.get('/check-status', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: 'offline' });

    try {
        // Petición rápida con timeout de 3 segundos e ignorando errores de SSL
        await axios.get(url, { 
            timeout: 3000, 
            validateStatus: (status) => status >= 200 && status < 400,
            headers: { 'User-Agent': 'SimpleDashboard-HealthCheck/1.0' },
            httpsAgent: httpsAgent
        });
        res.json({ status: 'online' });
    } catch (error) {
        res.json({ status: 'offline' });
    }
});

// Exportar configuración completa (ZIP)
app.get('/export', (req, res) => {
    const zip = new AdmZip();
    const dbFile = path.resolve(__dirname, process.env.DB_PATH);
    const iconsDir = path.resolve(__dirname, 'public/icons');
    const bgDir = path.resolve(__dirname, 'public/backgrounds');

    if (fs.existsSync(dbFile)) zip.addLocalFile(dbFile);
    if (fs.existsSync(iconsDir)) zip.addLocalFolder(iconsDir, 'icons');
    if (fs.existsSync(bgDir)) zip.addLocalFolder(bgDir, 'backgrounds');

    const fileName = `SimpleDashboard_Backup_${new Date().toISOString().split('T')[0]}.zip`;
    const buffer = zip.toBuffer();

    res.set('Content-Type', 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename=${fileName}`);
    res.set('Content-Length', buffer.length);
    res.send(buffer);
});

// Importar configuración (ZIP)
app.post('/import', upload.single('importFile'), (req, res) => {
    if (!req.file) return res.status(400).send('No se subió ningún archivo');

    try {
        const zip = new AdmZip(req.file.path);
        const targetPath = path.resolve(__dirname, 'public');

        // Cerrar BD temporalmente para reemplazar el archivo
        db.close();

        zip.extractAllTo(targetPath, true);

        // Volver a abrir la conexión
        db = new Database(path.resolve(__dirname, process.env.DB_PATH || ''));
        
        // Eliminar el archivo temporal subido
        fs.unlinkSync(req.file.path);

        res.redirect('/edit?imported=true');
    } catch (error) {
        console.error('Error en importación:', error);
        res.status(500).send('Error al procesar el archivo de respaldo');
    }
});

app.listen(port, () => {
    console.log(`🚀 SimpleDashboard corriendo en http://localhost:${port}`);
});