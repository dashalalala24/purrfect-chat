const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));

app.use((_, res) => {
  res.status(200).sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
