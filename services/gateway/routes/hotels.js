const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(
  '/',
  createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^': '/api' }
  })
);

router.use(
  '/admin',
  auth,
  createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/admin': '/api/admin' }
  })
);

module.exports = router;
