const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(
  '/',
  auth,
  createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/api/cars': '' }
  })
);

module.exports = router;
