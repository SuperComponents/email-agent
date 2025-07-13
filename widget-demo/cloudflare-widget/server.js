const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS for all origins
app.use(cors());

// Serve static files from dist and public directories
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the loader script
app.get('/loader.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'loader.js'));
});

app.listen(PORT, () => {
  console.log(`Cloudflare widget server running on http://localhost:${PORT}`);
}); 