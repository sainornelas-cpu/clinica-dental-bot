import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'clinica_dental.db');

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
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
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
      webhook_url TEXT
    );
  `);
  
  // Seed de configuración
  const configExistente = await db.get('SELECT COUNT(*) as total FROM configuracion_clinica');
  if (configExistente.total === 0) {
    await db.run(`
      INSERT INTO configuracion_clinica (
        nombre_clinica, direccion, telefono, email, horarios, servicios, sobre_clinica, webhook_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Clínica Dental Sonrisa',
      'Av. Corrientes 1234, CABA',
      '+54911-1234-5678',
      'contacto@clinicasonrisa.com',
      'Lunes a Viernes: 9:00 - 18:00',
      JSON.stringify(['Limpieza Dental', 'Ortodoncia', 'Implantes', 'Blanqueamiento', 'Extracción de Muelas']),
      'Somos una clínica dental comprometida con tu sonrisa. Contamos con profesionales de vanguardia y tecnología de punta.',
      null
    ]);
  }
  
  console.log('✅ Base de datos conectada e inicializada');
};

export const getDb = () => {
  if (!db) throw new Error('Base de datos no conectada. Llama a conectarBaseDeDatos() primero.');
  return db;
};