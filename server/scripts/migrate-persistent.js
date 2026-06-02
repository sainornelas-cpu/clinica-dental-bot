/**
 * Script de migración para DB persistente en Railway
 * Ejecutar en: railway shell
 * Comando: node server/scripts/migrate-persistent.js
 */

import { conectarBaseDeDatos, getDb } from '../db.js';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  console.log('🔄 [Persistent/Migrate] Iniciando migración en DB persistente...');

  try {
    await conectarBaseDeDatos();
    const db = getDb();

    // Verificar tabla turnos
    const tablas = await db.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='turnos'"
    );

    if (tablas.length === 0) {
      console.log('⚠️ Tabla turnos no existe. Creando...');

      await db.run(`
        CREATE TABLE turnos (
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
        )
      `);
      console.log('✅ Tabla turnos creada en DB persistente');
    } else {
      console.log('✅ Tabla turnos existe en DB persistente');
    }

    // Obtener columnas actuales
    const columnas = await db.all('PRAGMA table_info(turnos)');
    const nombresColumnas = columnas.map(c => c.name);

    console.log('📋 Columnas actuales:', nombresColumnas.join(', '));

    // Columnas a agregar
    const columnasFaltantes = [
      { nombre: 'creado_por', tipo: "TEXT DEFAULT 'whatsapp'" },
      { nombre: 'cancelado_por', tipo: 'TEXT' },
      { nombre: 'cancelado_en', tipo: 'DATETIME' },
      { nombre: 'modificado_por', tipo: 'TEXT' }
    ];

    for (const columna of columnasFaltantes) {
      if (!nombresColumnas.includes(columna.nombre)) {
        try {
          const sql = `ALTER TABLE turnos ADD COLUMN ${columna.nombre} ${columna.tipo}`;
          await db.run(sql);
          console.log(`✅ Columna '${columna.nombre}' agregada en DB persistente`);
        } catch (e) {
          if (e.message.includes('duplicate column name')) {
            console.log(`⚠️ Columna '${columna.nombre}' ya existe`);
          } else {
            console.error(`❌ Error con ${columna.nombre}:`, e.message);
          }
        }
      } else {
        console.log(`⚠️ Columna '${columna.nombre}' ya existe en DB persistente`);
      }
    }

    // Verificar resultado final
    const columnasFinales = await db.all('PRAGMA table_info(turnos)');
    console.log('📋 Columnas finales:', columnasFinales.map(c => c.name).join(', '));

    // Contar turnos
    const count = await db.get('SELECT COUNT(*) as total FROM turnos');
    console.log(`📊 Total turnos en DB persistente: ${count.total}`);

    console.log('🎉 Migración en DB persistente COMPLETADA');

  } catch (error) {
    console.error('❌ [Persistent/Migrate] Error crítico:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    try {
      const db = getDb();
      if (db && typeof db.close === 'function') {
        await db.close();
        console.log('🔌 [Persistent/Migrate] DB cerrada');
      }
    } catch (e) {
      // Ignorar error al cerrar
    }
    process.exit(0);
  }
})();
