// 🚨 CRÍTICO: Cargar variables de entorno ANTES de cualquier otro import
import dotenv from 'dotenv';
dotenv.config();

// Ahora sí, el resto de imports
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { conectarBaseDeDatos } from './db.js';
import webhookRouter from './routes/webhook.js';
import turnosRouter from './routes/turnos.js';
import debugRouter from './routes/debug.js';
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
    app.use('/api/debug', debugRouter);
    app.use('/api/mensajes', mensajesRouter);
    app.use('/api/configuracion', configuracionRouter);

    app.use((err, req, res, next) => {
      console.error('❌ Error global:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    });

    // 🔧 PRODUCCIÓN: Servir frontend estático
    console.log('🔍 [DEBUG] NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 [DEBUG] process.cwd():', process.cwd());
    console.log('🔍 [DEBUG] __dirname:', __dirname);

    // Buscar client/dist en múltiples rutas posibles
    const possiblePaths = [
      path.join(process.cwd(), 'client', 'dist'),
      path.join(process.cwd(), 'dist'),
      path.join(__dirname, '..', 'client', 'dist'),
      path.join(__dirname, 'client', 'dist'),
      '/app/client/dist',
      '/app/dist'
    ];

    let foundPath = null;
    console.log('🔍 [DEBUG] Buscando client/dist en rutas posibles...');

    for (const p of possiblePaths) {
      console.log(`🔍 [DEBUG] Verificando: ${p}`);
      if (fs.existsSync(p)) {
        foundPath = p;
        console.log(`✅ [DEBUG] ENCONTRADO client/dist en: ${p}`);
        const files = fs.readdirSync(p);
        console.log('📁 [DEBUG] Archivos en dist:', files.slice(0, 10)); // Mostrar primeros 10
        break;
      }
    }

    if (!foundPath) {
      console.error('❌ [DEBUG] client/dist NO encontrado en ninguna ruta');
      // Mostrar qué existe en process.cwd()
      try {
        const cwdFiles = fs.readdirSync(process.cwd());
        console.log('📂 [DEBUG] Contenido de process.cwd():', cwdFiles);
      } catch (e) {
        console.error('❌ [DEBUG] No se pudo leer process.cwd():', e.message);
      }
    }

    if (foundPath) {
      app.use(express.static(foundPath));
      console.log('🌐 [DEBUG] Static files habilitados en:', foundPath);

      // SPA routing: todas las rutas no-API van a index.html
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }

        const indexPath = path.join(foundPath, 'index.html');
        console.log(`🔍 [DEBUG] Request: ${req.path} → ${indexPath}`);
        res.sendFile(indexPath);
      });
      console.log('✅ Frontend estático habilitado (modo producción)');
    } else {
      console.warn('⚠️ Frontend estático NO habilitado - no se encontró client/dist');
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