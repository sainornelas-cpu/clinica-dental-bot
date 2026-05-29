// 🚨 CRÍTICO: Cargar variables de entorno ANTES de cualquier otro import
import dotenv from 'dotenv';
dotenv.config();

// Ahora sí, el resto de imports
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { conectarBaseDeDatos } from './db.js';
import webhookRouter from './routes/webhook.js';
import turnosRouter from './routes/turnos.js';
import mensajesRouter from './routes/mensajes.js';
import configuracionRouter from './routes/configuracion.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar DB (async) antes de levantar el servidor
conectarBaseDeDatos()
  .then(() => {
    app.use('/api/webhook', webhookRouter);
    app.use('/api/turnos', turnosRouter);
    app.use('/api/mensajes', mensajesRouter);
    app.use('/api/configuracion', configuracionRouter);

    app.use((err, req, res, next) => {
      console.error('❌ Error global:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    });

    // 🔧 PRODUCCIÓN: Servir frontend estático
    if (process.env.NODE_ENV === 'production') {
      // Usar process.cwd() para Railway (más robusto que __dirname)
      const distPath = path.join(process.cwd(), 'client', 'dist');
      console.log('📁 Serving static files from:', distPath);
      console.log('📁 process.cwd():', process.cwd());
      console.log('📁 __dirname:', __dirname);

      app.use(express.static(distPath));

      // SPA routing: todas las rutas no-API van a index.html
      app.get('*', (req, res, next) => {
        if (!req.path.startsWith('/api')) {
          res.sendFile(path.join(distPath, 'index.html'));
        } else {
          next();
        }
      });
      console.log('🌐 Frontend estático habilitado (modo producción)');
    }

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Fatal: No se pudo conectar a la base de datos:', err);
    process.exit(1);
  });