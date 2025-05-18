const express         = require('express');
const axios           = require('axios');
const cors            = require('cors');
const app             = express();

require('dotenv').config();
app.use(cors());

app.get('/api/:path(*)', async (req, res) => {
  const { authorization } = req.headers;

  const token = authorization?.split(' ')[1];
  if (!token || token !== process.env.ACCESS_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const url = req.originalUrl.replace(/^\/api\//, '');
  try {
    const targetUrl = `https://${url.split('?')[0]}`;
    const query = req.url.split('?')[1] ? `?${req.url.split('?')[1]}` : '';
    const fullUrl = `${targetUrl}${query}`;
    const response = await axios.get(fullUrl);
    // return res.status(200).json({ message: 'Proxy is working!' });
    return res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data || error.message;
    return res.status(status).json({ error: 'Proxy error', details: message });
  }
});

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'API is running' });
});

const PORT = process.env.PORT || 3050;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));

module.exports = app;