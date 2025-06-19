const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();


router.use(
  '/pictures',
  createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
    '^': '/pictures'
    }
  })
);

router.use(
  '/admin',
  auth,
  isAdmin,
  createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^': '/api/hotel/admin' }
  })
);

router.use(
  '/',
  createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^': '/api/hotel' }
  })
);

module.exports = router;
