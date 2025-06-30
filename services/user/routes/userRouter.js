const express = require('express');
const router = express.Router();
router.use(express.json());
const { registerUser, loginUser, getMe } = require('../controllers/userController');
const verifyJWT = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', verifyJWT, getMe);

module.exports = router;
