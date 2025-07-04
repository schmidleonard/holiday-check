const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

router.use(
  '/src',
  createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: {
    '^': '/src'
    }
  })
);

router.use(
  '/admin',
  auth,
  isAdmin,
  createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: { '^': '/api/flight/admin' }
  })
);

router.use(
  '/',
  createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: { '^': '/api/flight' }
  })
);

module.exports = router;
