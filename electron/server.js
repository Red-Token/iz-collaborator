import express from 'express';
import { handler } from './build/handler.js'; 
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'build', 'client')));

app.use(handler);

export const startServer = () => {
  return app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};