require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { initializeDatabase } = require('./db');
const { runMigrations } = require('./migrate');
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const categoryRoutes = require('./routes/categories');
const bonsReceptionRoutes = require('./routes/bonsReception');
const bonsSortieRoutes = require('./routes/bonsSortie');

const stockRoutes = require('./routes/stock');


const pvReceptionRoutes = require('./routes/pvReception');
const userManagementRoutes = require('./routes/userManagement');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());
// Increase payload limit for base64 PDFs
app.use(express.json({ limit: '20mb' }));
app.use('/uploads', express.static(require('path').join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bons-reception', bonsReceptionRoutes);
app.use('/api/bons-sortie', bonsSortieRoutes);

app.use('/api/stock', stockRoutes);


app.use('/api/pv-reception', pvReceptionRoutes);
app.use('/api/user-management', userManagementRoutes);

// Example protected route
app.get('/api/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

initializeDatabase()
  .then(() => runMigrations())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });


