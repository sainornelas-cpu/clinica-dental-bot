# 📸 Screenshots para la Demo

Esta carpeta contiene las imágenes que se muestran en la página de demostración.

## Archivos Requeridos

1. **dashboard-view.png** - Captura del Dashboard administrativo (vista de turnos)
2. **whatsapp-chat.png** - Captura de una conversación real con Sarah
3. **mobile-view.png** - Captura de la vista móvil del Dashboard

## Especificaciones

- **Formato**: PNG
- **Dimensiones recomendadas**: 1200x800px (desktop), 400x800px (móvil)
- **Tamaño máximo**: 500KB por imagen

## Cómo Generar Screenshots

### Opción 1: Desde el Ambiente de Desarrollo
```bash
# 1. Iniciar el frontend
cd client && npm run dev

# 2. Abrir http://localhost:5173/dashboard

# 3. Usar herramienta de screenshots del navegador:
#    - Chrome: DevTools (F12) → Cmd+Shift+P → "Capture screenshot"
#    - O usar extensión "Full Page Screen Capture"
```

### Opción 2: Desde Producción
```bash
# 1. Abrir https://[tu-url].railway.app/dashboard
# 2. Tomar screenshot con herramienta preferida
# 3. Guardar en esta carpeta
```

## Nota

Si no hay screenshots, la demo usará placeholders (iconos y gráficos CSS).
