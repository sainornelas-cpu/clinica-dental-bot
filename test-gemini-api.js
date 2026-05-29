import { GoogleGenerativeAI } from '@google/generative-ai';

// Reemplazá con tu clave REAL de Gemini
const API_KEY = AIzaSyALtO77Z5NtYlnnCpDhCK2YpOjR4AQbHHo;

console.log('🔍 Probando API de Gemini...\n');

try {
  // Inicializar
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  console.log('✅ Modelo cargado: gemini-1.5-flash');
  console.log('📤 Enviando mensaje de prueba...\n');
  
  // Mensaje de prueba simple
  const result = await model.generateContent('Respondé solo "OK" si funcionás correctamente');
  
  const respuesta = result.response.text();
  
  console.log('✅ ¡ÉXITO! Gemini respondió:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(respuesta);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Probá con un mensaje más complejo
  console.log('🧪 Probando función de agendamiento...\n');
  const result2 = await model.generateContent('Sos Sarah, recepcionista de una clínica dental. Un paciente te dice "Hola, quiero agendar una limpieza dental". Respondé de forma amable y profesional en español rioplatense.');
  
  console.log('✅ Respuesta de Sarah:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(result2.response.text());
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('🎉 ¡Gemini funciona perfectamente!');
  
} catch (error) {
  console.error('❌ Error al probar Gemini:');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error(error.message);
  
  if (error.status) {
    console.error('\n📡 Status HTTP:', error.status);
  }
  
  if (error.errorDetails) {
    console.error('\n🔍 Detalles:', JSON.stringify(error.errorDetails, null, 2));
  }
  
  console.error('\n💡 Soluciones posibles:');
  console.error('1. Verificá que la clave sea correcta (sin espacios ni comillas)');
  console.error('2. Generá una NUEVA clave en: https://aistudio.google.com/app/apikey');
  console.error('3. Verificá que la API esté habilitada en Google Cloud Console');
  console.error('4. Esperá 1-2 minutos después de crear la clave (propagación)');
}