// Test directo de la API key sin imports complejos
const API_KEY = process.argv[2];

if (!API_KEY) {
  console.error('❌ Usá: node test-key.mjs sk-proj-tu-clave');
  process.exit(1);
}

console.log('🔍 Probando clave directamente...\n');

const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Respondé solo "OK"' }]
  })
});

const data = await response.json();

if (data.error) {
  console.error('❌ Error de OpenAI:', data.error.message);
  process.exit(1);
} else {
  console.log('✅ ¡ÉXITO! Respuesta:', data.choices[0].message.content);
  console.log('🎉 Tu clave funciona perfectamente.');
}