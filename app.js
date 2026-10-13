const CHAT_KEY = 'luciana-chat-v1';
const TASKS_KEY = 'luciana-tasks-v1';
const NOTES_KEY = 'luciana-notes-v1';
const PROFILE_KEY = 'luciana-profile-v1';
const MEMORY_KEY = 'luciana-memory-v1';

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
let profile = loadList(PROFILE_KEY, item => item && typeof item.key === 'string' && typeof item.value === 'string');
let memories = loadList(MEMORY_KEY, item => item && typeof item.text === 'string' && typeof item.createdAt === 'string');

const DEFAULT_PROFILE = [
  { key: 'trato', value: 'directo y sin rodeos' },
  { key: 'explicaciones', value: 'paso a paso desde cero' },
  { key: 'prioridad', value: 'un poco de todo' }
];
if (profile.length === 0) {
  profile = DEFAULT_PROFILE.map(item => ({ ...item, updatedAt: new Date().toISOString() }));
  saveList(PROFILE_KEY, profile);
}

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

function memoryList() {
  if (!memories.length) return 'Todavía no tengo recuerdos personales guardados. Puedes decirme: recuerda que estoy aprendiendo inglés.';
  return 'Estos son tus recuerdos guardados:\n' + memories.map((item, i) => `${i + 1}. ${item.text}`).join('\n') + '\n\nPuedes borrar uno con: olvida recuerdo 1';
}

function profileSummary() {
  const labels = { trato: 'Cómo hablarme', explicaciones: 'Cómo explicarme', prioridad: 'Mis prioridades' };
  return profile.map((item, i) => `${i + 1}. ${labels[item.key] || item.key}: ${item.value}`).join('\n');
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

  match = text.match(/^(?:recuerda que|recuerda|guarda en mi memoria)\s+(.+)$/i);
  if (match) {
    const memoryText = match[1].trim();
    memories.push({ text: memoryText, createdAt: new Date().toISOString() });
    memories = memories.slice(-100);
    saveList(MEMORY_KEY, memories);
    return 'Lo guardaré en mi memoria de este navegador:\n“' + memoryText + '”\n\nPuedes consultarlo escribiendo “mis recuerdos” o “qué recuerdas de mí”.';
  }

  if (/^(mis recuerdos|ver recuerdos|qué recuerdas de mí|que recuerdas de mi|qué recuerdas|que recuerdas)$/i.test(lower)) {
    return memoryList() + '\n\nTambién tengo estas preferencias guardadas:\n' + profileSummary();
  }

  match = lower.match(/^(?:olvida|borrar|eliminar) recuerdo\s*(\d+)$/i);
  if (match) {
    const index = Number(match[1]) - 1;
    if (!memories[index]) return 'No encuentro el recuerdo ' + match[1] + '. Escribe “mis recuerdos” para ver la lista.';
    const removed = memories.splice(index, 1)[0];
    saveList(MEMORY_KEY, memories);
    return 'He olvidado este recuerdo de este navegador:\n“' + removed.text + '”';
  }

  if (/^(mis preferencias|mi perfil)$/i.test(lower)) {
    return profile.length ? 'Estas son tus preferencias guardadas:\n' + profileSummary() + '\n\nPuedes cambiar una con: cambiar trato a amistoso, cambiar explicaciones a breve o cambiar prioridad a aprendizaje.' : 'Aún no hay preferencias guardadas.';
  }

  match = lower.match(/^cambiar (trato|explicaciones|prioridad) a (.+)$/i);
  if (match) {
    const key = match[1];
    const value = match[2].trim();
    const allowed = {
      trato: ['directo y sin rodeos', 'amistoso', 'formal', 'directo'],
      explicaciones: ['paso a paso desde cero', 'breve', 'detallado', 'con ejemplos'],
      prioridad: ['un poco de todo', 'productividad', 'negocio', 'aprendizaje']
    };
    if (!allowed[key].includes(value)) return 'Esa opción todavía no está configurada. Prueba “mis preferencias” para ver tu perfil actual y las opciones disponibles.';
    const existing = profile.find(item => item.key === key);
    if (existing) { existing.value = value; existing.updatedAt = new Date().toISOString(); }
    else profile.push({ key, value, updatedAt: new Date().toISOString() });
    saveList(PROFILE_KEY, profile);
    return 'Preferencia actualizada. Guardé: ' + key + ' = ' + value + '.\n\nEscribe “mis preferencias” para revisar tu perfil.';
  }

  if (/^(ayuda|comandos|qué puedes hacer|que puedes hacer)$/i.test(lower)) {
    return 'Voy directo: puedo gestionar tareas, notas y preferencias.\n\nTareas: “añadir tarea estudiar inglés”, “mis tareas”, “completar tarea 1” o “eliminar tarea 1”.\n\nNotas: “nota mi idea para el proyecto” y “mis notas”.\n\nMemoria: “recuerda que estoy aprendiendo inglés”, “mis recuerdos”, “olvida recuerdo 1” o “mis preferencias”.\n\nNo uso un modelo externo; entiendo los comandos que están programados.';
  }

  if (/\b(hola|buenas|buenos días|buenas tardes|hey)\b/i.test(lower)) {
    return '¡Hola! Soy Luciana, tu asistente personal. Puedo guardar tareas, notas y recordar tus preferencias en este navegador. Escribe “ayuda” para ver mis comandos.';
  }

  if (/\b(organizar|organización|planificar|plan|metas|objetivo|empezar un negocio|reventa|reselling)\b/i.test(lower)) {
    return 'Vamos paso a paso desde cero.\n\n1. Define qué quieres conseguir.\n2. Escribe una primera acción pequeña y concreta.\n3. Guárdala con “añadir tarea [tu acción]”.\n4. Consulta tu plan con “mis tareas”.\n\nSi me dices tu objetivo concreto, puedo orientarte mejor dentro de las funciones que tengo programadas.';
  }

  if (/\b(gracias|muchas gracias|te lo agradezco)\b/i.test(lower)) {
    return 'De nada. Dime qué quieres hacer ahora y lo vemos paso a paso.';
  }

  if (/\b(quién eres|quien eres|qué eres|que eres)\b/i.test(lower)) {
    return 'Soy Luciana, una asistente personal en desarrollo. Guardo tareas, notas y preferencias en este navegador. Para ser transparente: por ahora no tengo un modelo de IA, así que respondo mediante reglas y comandos programados.';
  }

  if (/\b(preferencia|preferencias|memoria|recordar)\b/i.test(lower)) {
    return 'Puedo guardar recuerdos explícitos y preferencias en este navegador. Escribe “recuerda que...” para guardar algo, “mis recuerdos” para consultarlos o “olvida recuerdo 1” para borrarlo.';
  }

  if (/\b(tarea|tareas|pendiente|pendientes)\b/i.test(lower)) {
    return 'Para gestionar pendientes, escribe “añadir tarea” seguido de lo que necesitas hacer. Para ver la lista, escribe “mis tareas”. Para marcar la primera como terminada, escribe “completar tarea 1”.';
  }

  if (/\b(nota|notas|idea|ideas)\b/i.test(lower)) {
    return 'Puedo guardar ideas como notas. Escribe “nota” seguido de tu idea y después usa “mis notas” para consultarlas.';
  }

  // Respuestas más útiles para peticiones comunes expresadas de forma natural.
  if (/\b(qu[eé] me recomiendas|por d[oó]nde empiezo|no s[eé] por d[oó]nde empezar|ay[uú]dame a empezar)\b/i.test(lower)) {
    const memoryContext = memories.length ? '\n\nTendré en cuenta lo que me has contado: ' + memories.slice(-3).map(item => item.text).join('; ') + '.' : '';
    return 'Empecemos por algo pequeño. Dime cuál es tu objetivo principal ahora mismo y te ayudo a dividirlo en pasos concretos. Si ya me lo contaste antes, puedo revisar tus recuerdos con “mis recuerdos”.' + memoryContext;
  }

  if (/\b(ganar dinero por internet|ganar dinero en internet|hacer dinero por internet|dinero online|ingresos por internet|ganar plata por internet|ganar plata en internet)\b/i.test(lower)) {
    return '¡Vamos a empezar desde cero! Hay varias opciones reales para explorar: reventa de productos, ofrecer servicios digitales sencillos o crear contenido. No necesitas invertir dinero de inmediato.\n\nMi recomendación es comparar las opciones según tu presupuesto, tiempo y habilidades antes de elegir. Para orientarte mejor, dime: ¿quieres empezar sin invertir nada, o tienes un pequeño presupuesto para probar?';
  }

  if (/\b(quiero aprender|estoy aprendiendo|quiero mejorar|mi objetivo es|mi meta es)\b/i.test(lower)) {
    const memoryContext = memories.length ? '\n\nRecuerdos que pueden ayudarme a orientarte: ' + memories.slice(-3).map(item => item.text).join('; ') + '.' : '';
    return 'Perfecto, vamos a convertirlo en un plan práctico. Primero definimos qué quieres conseguir, luego elegimos una acción pequeña para hoy y la dividimos en pasos. Si me dices un poco más sobre tu objetivo, te propondré un siguiente paso concreto. Puedes guardar el objetivo con “recuerda que...” y la acción con “añadir tarea ...”.' + memoryContext;
  }

  if (/\b(c[oó]mo est[aá]s|qu[eé] tal|c[oó]mo va todo)\b/i.test(lower)) {
    return '¡Todo listo por aquí! ¿Qué te gustaría avanzar hoy: aprender algo, organizar tus tareas o trabajar en un proyecto?';
  }

  if (/\b(qui[eé]ro hablar|podemos hablar|esc[uú]chame|tengo una idea|tengo un problema)\b/i.test(lower)) {
    return 'Claro, cuéntame. Te leeré y trataré de ayudarte con lo que pueda. Si se trata de algo importante que quieras conservar, puedo guardarlo como recuerdo cuando me lo pidas explícitamente.';
  }

  if (/\b(negocio|emprender|emprendimiento|vender por internet|reventa|reselling)\b/i.test(lower)) {
    return 'Vamos paso a paso. Para empezar un negocio de reventa, primero elige una categoría de producto, comprueba la demanda y calcula todos los costes antes de comprar inventario. Si me dices tu presupuesto y qué productos te interesan, te ayudo a organizar un plan inicial.';
  }

  return 'Voy directo: todavía no comprendo mensajes libres como una IA conversacional. Sí puedo ayudarte con tareas, notas, preferencias y planes sencillos. Prueba “ayuda” o cuéntame si quieres organizar un objetivo, guardar una nota o gestionar tareas.';
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