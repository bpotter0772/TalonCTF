module.exports = function getUser(req) {
  const header = req.headers['x-ms-client-principal'];
  if (!header) return null;

  const decoded = JSON.parse(Buffer.from(header, 'base64').toString('utf8'));
  return decoded;
};