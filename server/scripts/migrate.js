// server/scripts/migrate.js
// Script de migración: agregar columnas faltantes a la tabla turnos
// Versión CORREGIDA: inicializa DB correctamente

// 🔧 IMPORTANTE: Inicializar dotenv y conectar DB antes de usar getDb
import dotenv from 'dotenv';
dotenv.config();

import { conectarBaseDeDatos, getDb } from '../db.js';

// Forzar logs inmediatos
console.log = (...args) => process.stdout.write(args.join(' ') + '\n');
console.error = (...args) => process.stderr.write(args.join(' ') + '\n');

const runMigration = async () => {
  console.log('🔄 [MIGRATE] Iniciando migración de base de datos...');
  
  try {
    // ✅ PASO CRÍTICO: Conectar la base de datos primero
    console.log('📦 [MIGRATE] Conectando a DB...');
    await conectarBaseDeDatos();
    console.log('✅ [MIGRATE] DB conectada exitosamente');
    
    const db = getDb();
    
    // Lista de columnas a agregar
    const columns = [
      { name: 'creado_por', type: 'TEXT', default: "'whatsapp'" },
      { name: 'cancelado_por', type: 'TEXT', default: null },
      { name: 'cancelado_en', type: 'DATETIME', default: null },
      { name: 'modificado_por', type: 'TEXT', default: null }
    ];
    
    for (const col of columns) {
      try {
        let sql = `ALTER TABLE turnos ADD COLUMN ${col.name} ${col.type}`;
        if (col.default) sql += ` DEFAULT ${col.default}`;
        
        console.log(`🔧 [MIGRATE] Ejecutando: ${sql}`);
        await db.run(sql);
        console.log(`✅ [MIGRATE] Columna "${col.name}" agregada`);
        
      } catch (e) {
        if (e.message.includes('duplicate column name')) {
          console.log(`⚠️  [MIGRATE] Columna "${col.name}" ya existe, saltando...`);
        } else {
          console.error(`❌ [MIGRATE] Error con columna "${col.name}":`, e.message);
          throw e;
        }
      }
    }
    
    console.log('🎉 [MIGRATE] Migración completada exitosamente');
    return { success: true };
    
  } catch (error) {
    console.error('❌ [MIGRATE] Error crítico en migración:', error.message);
    console.error('📋 [MIGRATE] Stack:', error.stack);
    throw error;
    
  } finally {
    // Cerrar conexión si existe
    const db = getDb();
    if (db && typeof db.close === 'function') {
      db.close();
      console.log('🔌 [MIGRATE] DB cerrada');
    }
  }
};

// Ejecutar inmediatamente
console.log('🚀 [MIGRATE] Script iniciado');
runMigration()
  .then(result => {
    console.log('✅ [MIGRATE] Proceso terminado:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 [MIGRATE] Proceso fallido');
    process.exit(1);
  });

export { runMigration };