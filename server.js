const corsOptions = {
  origin: 'http://example.com', // Replace with your allowed origin
  optionsSuccessStatus: 200
};










});  console.log('Server is running on port 5000');app.listen(5000, () => {// ...existing code...app.use(cors());app.use(cors(corsOptions));
const express = require('express');
const cors = require('cors');
const app = express();

// ...existing code...