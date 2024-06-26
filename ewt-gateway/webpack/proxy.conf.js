function setupProxy({ tls }) {
  return [
    {
      context: ['/api', '/services', '/management', '/v3/api-docs', '/h2-console', '/auth', '/health'],
      target: `http${tls ? 's' : ''}://localhost:9100`,
      secure: false,
      changeOrigin: tls,
    },
  ];
}

module.exports = setupProxy;
