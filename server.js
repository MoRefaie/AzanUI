const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Path to the Vite build output
const staticPath = path.join(__dirname, 'AzanUI', 'dist');

// Serve static files
app.use(express.static(staticPath));

// For SPA: serve index.html for all unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});