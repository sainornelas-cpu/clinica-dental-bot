import { GoogleGenerativeAI } from '@google/generative-ai';

// Reemplaza con tu clave nueva real
const API_KEY = "AIzaSyTU_CLAVE_NUEVA_AQUI_xxxxxxxxxxxxxxxxxxxx";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

console.log('🔑 Probando clave...');
try {
  const result = await model.generateContent('Respondé solo "OK"');
  console.log('✅ ÉXITO:', result.response.text());
} catch (e) {
  console.error('❌ Error:', e.message);
  if (e.status) console.error('📡 Status:', e.status);
}