const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'config.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    brandName: 'TerraLink Service',
    primaryColor: '#3fa66b',
    logoFile: null,
    devices: [
      { barcode: '6923650123456', serial: 'ZLHZL020ET0B00027' },
      { barcode: '6923650123457', serial: 'ZLHZL021ET0B00058' },
      { barcode: '6923650123458', serial: 'ZLHZL019ET0B00112' },
      { barcode: '6923650123459', serial: 'ZLHZL022ET0B00075' },
      { barcode: '6923650123460', serial: 'ZLHZL018ET0B00203' },
      { barcode: '6923650123461', serial: 'ZLHZL023ET0B00019' },
      { barcode: '6923650123462', serial: 'ZLHZL020ET0B00088' },
      { barcode: '6923650123463', serial: 'ZLHZL024ET0B00041' }
    ]
  }, null, 2));
}

function readDB() { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
function writeDB(db) { fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2)); }

app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({ dest: UPLOAD_DIR, limits: { fileSize: 5 * 1024 * 1024 } });

app.get('/api/config', (req, res) => res.json(readDB()));

app.post('/api/config', (req, res) => {
  const db = readDB();
  const { brandName, primaryColor, devices } = req.body;
  if (brandName !== undefined) db.brandName = brandName;
  if (primaryColor !== undefined) db.primaryColor = primaryColor;
  if (Array.isArray(devices)) db.devices = devices;
  writeDB(db);
  res.json(db);
});

app.post('/api/config/logo', upload.single('logo'), (req, res) => {
  const db = readDB();
  if (!req.file) return res.status(400).json({ error: 'no_file' });
  if (db.logoFile) { try { fs.unlinkSync(path.join(UPLOAD_DIR, db.logoFile)); } catch (e) {} }
  const ext = path.extname(req.file.originalname) || '.png';
  const finalName = req.file.filename + ext;
  fs.renameSync(req.file.path, path.join(UPLOAD_DIR, finalName));
  db.logoFile = finalName;
  writeDB(db);
  res.json(db);
});

app.listen(PORT, () => {
  console.log('Machinery Service App server running on port ' + PORT);
  console.log('Admin panel: /admin.html');
});
