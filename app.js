const STORAGE_KEY = 'mi-ia-personal-messages-v1';
const form = document.querySelector('#chat-form');
const input = document.querySelector('#message-input');
const messages = document.querySelector('#messages');
const welcome = document.querySelector('#welcome');
const sendButton = document.querySelector('#send-button');
const newChatButton = document.querySelector('#new-chat');
const menuToggle = document.querySelector('#menu-toggle');
const sidebar = document.querySelector('.sidebar');

let history = loadHistory();

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(item => item && ['user', 'assistant'].includes(item.role) && typeof item.text === 'string').slice(-80) : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-80)));
  } catch {
    // The chat still works for this session if browser storage is unavailable.
  }
}

function addMessage(role, text) {
  const row = document.createElement('article');
  row.className = `message ${role}`;
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = role === 'assistant' ? '✳' : 'TÚ';
  const body = document.createElement('div');
  body.className = 'message-body';
  body.textContent = text;
  row.append(avatar, body);
  messages.append(row);
}

function renderHistory() {
  messages.replaceChildren();
  welcome.hidden = history.length > 0;
  for (const item of history) addMessage(item.role, item.text);
  messages.scrollTop = messages.scrollHeight;
}

function demoReply(message) {
  const text = message.toLocaleLowerCase('es');
  if (/\b(hola|buenas|buenos días|buenas tardes|hey)\b/.test(text)) {
    return '¡Hola! 👋 Soy la primera versión de tu asistente personal. Todavía no estoy conectada a un modelo de IA real, pero ya podemos probar la interfaz. ¿Qué te gustaría construir primero?';
  }
  if (/\b(meta|metas|organizar|organización|planificar|plan)\b/.test(text)) {
    return '¡Vamos paso a paso! Una buena forma de empezar es elegir una meta principal, dividirla en tareas pequeñas y decidir cuál puedes completar hoy.\n\nNota: esta es una respuesta de demostración. El siguiente paso del proyecto será conectar un modelo de IA real para respuestas más útiles y personalizadas.';
  }
  if (/\b(ia|inteligencia artificial|modelo|programar|código|codigo)\b/.test(text)) {
    return 'Nuestro proyecto ya tiene una interfaz de chat y guarda el historial en este navegador. Para convertirlo en una IA real, el siguiente paso será conectar un modelo de lenguaje mediante un backend seguro. No pondremos claves secretas en los archivos públicos.\n\nEsta respuesta es de demostración, no ha sido generada por un modelo de IA.';
  }
  return '¡Mensaje recibido! Ya funciona el chat de prueba y tu conversación se guarda localmente en este navegador. Por ahora mis respuestas son ejemplos predefinidos; aún no estoy conectada a un modelo de lenguaje. El próximo paso será añadir esa conexión de forma segura.';
}

function sendMessage(text) {
  const clean = text.trim();
  if (!clean) return;
  history.push({ role: 'user', text: clean });
  history.push({ role: 'assistant', text: demoReply(clean) });
  history = history.slice(-80);
  saveHistory();
  renderHistory();
  input.value = '';
  input.style.height = 'auto';
  input.focus();
}

form.addEventListener('submit', event => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
});

input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

document.querySelectorAll('[data-prompt]').forEach(button => {
  button.addEventListener('click', () => sendMessage(button.dataset.prompt || ''));
});

newChatButton.addEventListener('click', () => {
  history = [];
  saveHistory();
  renderHistory();
  input.value = '';
  input.focus();
  sidebar.classList.remove('open');
});

menuToggle?.addEventListener('click', () => sidebar.classList.toggle('open'));

renderHistory();
