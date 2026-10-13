const CHAT_KEY = 'luciana-chat-v1';
const TASKS_KEY = 'luciana-tasks-v1';
const NOTES_KEY = 'luciana-notes-v1';

const form = document.querySelector('#chat-form');
const input = document.querySelector('#message-input');
const messages = document.querySelector('#messages');
const welcome = document.querySelector('#welcome');
const newChatButton = document.querySelector('#new-chat');
const menuToggle = document.querySelector('#menu-toggle');
const sidebar = document.querySelector('.sidebar');

let history = loadList(CHAT_KEY, item => item && ['user', 'assistant'].includes(item.role) && typeof item.text === 'string').slice(-80);
let tasks = loadList(TASKS_KEY, item => item && typeof item.text === 'string' && typeof item.done === 'boolean');
let notes = loadList(NOTES_KEY, item => item && typeof item.text === 'string');

function loadList(key, isValid) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter(isValid) : [];
  } catch {
    return [];
  }
}

function saveList(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Works for this session if storage is unavailable. */ }
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
  history.forEach(item => addMessage(item.role, item.text));
  messages.scrollTop = messages.scrollHeight;
}

function taskList() {
  if (!tasks.length) return 'Todavía no tienes tareas guardadas. Escribe: añadir tarea comprar pan';
  const lines = tasks.map((task, i) => `${i + 1}. ${task.done ? '✅' : '⬜'} ${task.text}`);
  return 'Estas son tus tareas:\n' + lines.join('\n') + '\n\nPara completar una, escribe: completar tarea 1';
}

function noteList() {
  if (!notes.length) return 'Todavía no tienes notas guardadas. Escribe: nota recordar llamar al dentista';
  return 'Tus notas guardadas:\n' + notes.map((note, i) => `${i + 1}. ${note.text}`).join('\n');
}

function assistantReply(message) {
  const text = message.trim();
  const lower = text.toLocaleLowerCase('es');

  let match = text.match(/^(?:añadir|agregar|crear|apuntar|recuérdame|recuerdame)(?: una)? tarea\s*[:\-]?\s*(.+)$/i);
  if (match) {
    const taskText = match[1].trim();
    tasks.push({ text: taskText, done: false, createdAt: new Date().toISOString() });
    saveList(TASKS_KEY, tasks);
    return `¡Listo! Guardé esta tarea:\n“${taskText}”\n\nPuedes ver todas escribiendo “mis tareas”.`;
  }

  if (/^(mis tareas|ver tareas|lista de tareas|qué tareas tengo|que tareas tengo)$/i.test(lower)) return taskList();

  match = lower.match(/^(?:completar|terminar|marcar|hacer) tarea\s*(\d+)$/i);
  if (match) {
    const index = Number(match[1]) - 1;
    if (!tasks[index]) return `No encuentro la tarea ${match[1]}. Escribe “mis tareas” para ver la lista.`;
    tasks[index].done = true;
    saveList(TASKS_KEY, tasks);
    return `¡Bien hecho! Marcaste como completada: “${tasks[index].text}” ✅`;
  }

  match = lower.match(/^(?:eliminar|borrar) tarea\s*(\d+)$/i);
  if (match) {
    const index = Number(match[1]) - 1;
    if (!tasks[index]) return `No encuentro la tarea ${match[1]}. Escribe “mis tareas” para ver la lista.`;
    const removed = tasks.splice(index, 1)[0];
    saveList(TASKS_KEY, tasks);
    return `Eliminé la tarea: “${removed.text}”.`;
  }

  match = text.match(/^(?:nota|guardar nota|apunta|apuntar nota)\s*[:\-]?\s*(.+)$/i);
  if (match) {
    notes.push({ text: match[1].trim(), createdAt: new Date().toISOString() });
    saveList(NOTES_KEY, notes);
    return `Guardé tu nota:\n“${match[1].trim()}”\n\nPuedes consultarlas escribiendo “mis notas”.`;
  }

  if (/^(mis notas|ver notas|lista de notas|qué notas tengo|que notas tengo)$/i.test(lower)) return noteList();

  if (/^(ayuda|comandos|qué puedes hacer|que puedes hacer)$/i.test(lower)) {
    return 'Por ahora puedo ayudarte con tareas y notas. Prueba estos comandos:\n\n• añadir tarea estudiar inglés\n• mis tareas\n• completar tarea 1\n• eliminar tarea 1\n• nota mi idea para el proyecto\n• mis notas\n\nFunciono sin una API ni un modelo externo. Mis funciones son reglas programadas, así que todavía no comprendo cualquier pregunta libre.';
  }

  if (/\b(hola|buenas|buenos días|buenas tardes|hey)\b/i.test(lower)) {
    return '¡Hola! 👋 Soy Luciana, tu asistente personal en construcción. Ya puedo guardar tareas y notas en este navegador. Escribe “ayuda” para ver lo que puedo hacer.';
  }

  if (/\b(organizar|organización|planificar|plan|metas)\b/i.test(lower)) {
    return 'Podemos empezar por dividir tu objetivo en tareas pequeñas. Por ejemplo, escribe “añadir tarea investigar mi idea” y después “añadir tarea dedicarle 20 minutos”. Escribe “mis tareas” para ver tu lista.';
  }

  return 'Quiero ayudarte, pero todavía no tengo un modelo de IA que entienda cualquier mensaje. De momento puedo guardar y gestionar tareas y notas usando comandos. Escribe “ayuda” para ver ejemplos.';
}

function sendMessage(text) {
  const clean = text.trim();
  if (!clean) return;
  history.push({ role: 'user', text: clean });
  history.push({ role: 'assistant', text: assistantReply(clean) });
  history = history.slice(-80);
  saveList(CHAT_KEY, history);
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
  saveList(CHAT_KEY, history);
  renderHistory();
  input.value = '';
  input.focus();
  sidebar.classList.remove('open');
});

menuToggle?.addEventListener('click', () => sidebar.classList.toggle('open'));

renderHistory();