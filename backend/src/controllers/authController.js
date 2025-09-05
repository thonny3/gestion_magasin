const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findByUsername, createUser } = require('../models/User');

const { JWT_SECRET = 'changeme-super-secret' } = process.env;

async function register(req, res) {
  try {
    const { username, password, role } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    // Only admin can create users
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can create users' });
    }

    const newUserRole = role === 'admin' ? 'admin' : 'user';

    const existing = await findByUsername(username);
    if (existing) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await createUser(username, passwordHash, newUserRole);
    return res.status(201).json({ id: created.id, username: created.username, role: created.role });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    const user = await findByUsername(username);
    if (!user) {
      return res.status(404).json({ message: "Le nom d'utilisateur n'existe pas" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
}

module.exports = { register, login };


