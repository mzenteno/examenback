import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import express, { json } from 'express';
import indexRoutes from './routes/index.js';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', indexRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});