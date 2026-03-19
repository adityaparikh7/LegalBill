import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { initDatabase } from './db';
import clientsRouter from './routes/clients';
import invoicesRouter from './routes/invoices';
import dashboardRouter from './routes/dashboard';
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
// API Routes
app.use('/api/clients', clientsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/dashboard', dashboardRouter);
// Serve React build in production
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});
// Initialize DB and start server
initDatabase();
app.listen(PORT, () => {
  console.log(`🚀 LexLedger server running on http://localhost:${PORT}`);
});
export default app;