const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(
  '/',
  auth,
  createProxyMiddleware({
    target: 'http://localhost:3006',
    changeOrigin: true,
    pathRewrite: { '^/api/rating': '' }
  })
);

module.exports = router;
