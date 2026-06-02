// server/routes/debug.js
// Endpoints de debug para migración y diagnóstico

import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// 🔧 Endpoint para ejecutar migración de columnas
router.get('/migrate', async (req, res) => {
  console.log('🔄 [Debug/Migrate] Iniciando migración vía HTTP...');
  
  try {
    const db = getDb();
    
    const columns = [
      { name: 'creado_por', type: 'TEXT', default: "'whatsapp'" },
      { name: 'cancelado_por', type: 'TEXT', default: null },
      { name: 'cancelado_en', type: 'DATETIME', default: null },
      { name: 'modificado_por', type: 'TEXT', default: null }
    ];
    
    const results = [];
    
    for (const col of columns) {
      try {
        let sql = `ALTER TABLE turnos ADD COLUMN ${col.name} ${col.type}`;
        if (col.default) sql += ` DEFAULT ${col.default}`;
        
        await db.run(sql);
        results.push({ column: col.name, status: 'added' });
        console.log(`✅ [Debug/Migrate] Columna "${col.name}" agregada`);
        
      } catch (e) {
        if (e.message.includes('duplicate column name')) {
          results.push({ column: col.name, status: 'exists' });
          console.log(`⚠️  [Debug/Migrate] Columna "${col.name}" ya existe`);
        } else {
          throw e;
        }
      }
    }
    
    console.log('🎉 [Debug/Migrate] Migración completada');
    
    res.json({ 
      success: true, 
      message: 'Migración aplicada',
      columns: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [Debug/Migrate] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 🔍 Endpoint para ver turnos con logging
router.get('/turnos', async (req, res) => {
  try {
    const db = getDb();
    const turnos = await db.all('SELECT * FROM turnos ORDER BY fecha_turno DESC LIMIT 10');
    
    console.log(`📊 [Debug/Turnos] Devolviendo ${turnos.length} turnos`);
    
    res.json({
      count: turnos.length,
      turnos: turnos.map(t => ({
        ...t,
        _year: new Date(t.fecha_turno).getFullYear()
      }))
    });
    
  } catch (error) {
    console.error('❌ [Debug/Turnos] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;