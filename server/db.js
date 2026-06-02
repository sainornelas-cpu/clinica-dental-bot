import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

// Deploy test: 02/06/2026 - Verificar persistencia de volumen (segundo test)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detectar si estamos en Railway (producción)
const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production' || process.env.NODE_ENV === 'production';

// Ruta persistente para Railway (volumen montado en //app/data - nota el doble slash)
// En local usa clinica_dental.db, en producción usa //app/data/clinica_dental.db
const dbPath = isRailway ? '//app/data/clinica_dental.db' : (process.env.DATABASE_URL || path.join(__dirname, '..', 'clinica_dental.db'));

// Asegurar que el directorio del volumen existe antes de conectar
if (dbPath.startsWith('/app/') || dbPath.startsWith('//app/')) {
  const dbDir = path.dirname(dbPath);
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
    console.log(`📁 [DB] Directorio creado: ${dbDir}`);
  }
  console.log(`💾 [DB] Usando volumen persistente: ${dbPath}`);
} else {
  console.log(`💾 [DB] Usando DB local: ${dbPath}`);
}

let db;

export const conectarBaseDeDatos = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  await db.exec(`PRAGMA journal_mode = WAL;`);
  
  // Crear tablas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS mensajes_whatsapp (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_telefono TEXT NOT NULL,
      contenido_mensaje TEXT NOT NULL,
      remitente TEXT NOT NULL CHECK(remitente IN ('usuario', 'asistente')),
      tipo_mensaje TEXT,
      respuesta_ia TEXT,
      procesado INTEGER DEFAULT 0 CHECK(procesado IN (0, 1)),
      recibido_en DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS turnos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_telefono TEXT NOT NULL,
      nombre_paciente TEXT NOT NULL,
      fecha_turno DATETIME NOT NULL,
      tipo_turno TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'confirmado', 'cancelado', 'completado')),
      notas TEXT,
      creado_por TEXT DEFAULT 'whatsapp',
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      cancelado_por TEXT,
      cancelado_en DATETIME,
      modificado_por TEXT,
      actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TRIGGER IF NOT EXISTS actualizar_turnos_actualizado_en
    AFTER UPDATE ON turnos
    FOR EACH ROW
    BEGIN
      UPDATE turnos SET actualizado_en = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
    
    CREATE TABLE IF NOT EXISTS configuracion_clinica (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_clinica TEXT NOT NULL,
      direccion TEXT,
      telefono TEXT,
      email TEXT,
      horarios TEXT,
      servicios TEXT,
      sobre_clinica TEXT,
      webhook_url TEXT,
      fecha_cierre_inicio TEXT,
      fecha_cierre_fin TEXT,
      facebook_url TEXT,
      instagram_url TEXT,
      google_maps_url TEXT
    );
  `);

  // Migración: Agregar nuevas columnas si no existen (para bases de datos existentes)
  try {
    await db.exec(`ALTER TABLE configuracion_clinica ADD COLUMN fecha_cierre_inicio TEXT;`);
  } catch (e) { /* Columna ya existe */ }
  try {
    await db.exec(`ALTER TABLE configuracion_clinica ADD COLUMN fecha_cierre_fin TEXT;`);
  } catch (e) { /* Columna ya existe */ }
  try {
    await db.exec(`ALTER TABLE configuracion_clinica ADD COLUMN facebook_url TEXT;`);
  } catch (e) { /* Columna ya existe */ }
  try {
    await db.exec(`ALTER TABLE configuracion_clinica ADD COLUMN instagram_url TEXT;`);
  } catch (e) { /* Columna ya existe */ }
  try {
    await db.exec(`ALTER TABLE configuracion_clinica ADD COLUMN google_maps_url TEXT;`);
  } catch (e) { /* Columna ya existe */ }

  // Seed de configuración
  const configExistente = await db.get('SELECT COUNT(*) as total FROM configuracion_clinica');
  if (configExistente.total === 0) {
    await db.run(`
      INSERT INTO configuracion_clinica (
        nombre_clinica, direccion, telefono, email, horarios, servicios, sobre_clinica, webhook_url,
        fecha_cierre_inicio, fecha_cierre_fin, facebook_url, instagram_url, google_maps_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Clínica Dental Sonrisa',
      'Av. Corrientes 1234, CABA',
      '+54911-1234-5678',
      'contacto@clinicasonrisa.com',
      'Lunes a Viernes: 9:00 - 18:00',
      JSON.stringify(['Limpieza Dental', 'Ortodoncia', 'Implantes', 'Blanqueamiento', 'Extracción de Muelas']),
      'Somos una clínica dental comprometida con tu sonrisa. Contamos con profesionales de vanguardia y tecnología de punta.',
      null,
      null,
      null,
      null,
      null,
      null
    ]);
  }
  
  console.log('✅ Base de datos conectada e inicializada');
};

export const getDb = () => {
  if (!db) throw new Error('Base de datos no conectada. Llama a conectarBaseDeDatos() primero.');
  return db;
};