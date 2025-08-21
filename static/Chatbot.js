const openBtn = document.getElementById('chatbot-button');
const panel = document.querySelector('.chatbot-panel');
const closeBtn = document.getElementById('cb-close');
const clearBtn = document.getElementById('cb-clear');
const messagesEl = document.querySelector('.cb-messages');
const form = document.querySelector('.cb-input');
const textarea = document.getElementById('cb-text');
const sendBtn = document.getElementById('cb-send');

const OPEN_CLASS = 'open';
let welcomeSent = false;

function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `cb-message ${role === 'user' ? 'user' : 'bot'}`;
    div.innerHTML = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function openPanel() {
    panel.style.display = 'flex';
    panel.getBoundingClientRect();
    panel.classList.add(OPEN_CLASS);

    if (!welcomeSent) {
        setTimeout(() => {
            appendMessage('bot', '👋 Hello! I\'m your game assistant. How can I help you today?');
        }, 300);
        welcomeSent = true;
    }
}

function closePanel() {
    panel.classList.remove(OPEN_CLASS);
    const onEnd = (e) => {
        if (e.propertyName === 'right' || e.propertyName === 'transform') {
            panel.style.display = 'none';
            panel.removeEventListener('transitionend', onEnd);
        }
    };
    panel.addEventListener('transitionend', onEnd);
}

openBtn?.addEventListener('click', () => {
    panel.classList.contains(OPEN_CLASS) ? closePanel() : openPanel();
});

closeBtn?.addEventListener('click', closePanel);

clearBtn?.addEventListener('click', () => {
    messagesEl.innerHTML = '';
    setTimeout(() => {
        appendMessage('bot', '👋 Hello! I\'m your game assistant. How can I help you today?');
    }, 300);
});

async function sendMessage() {
    const text = textarea.value.trim();
    if (!text) return;
    appendMessage('user', text);
    textarea.value = '';
    textarea.focus();

    appendMessage('bot', 'Please Wait.........');

    try {
        const res = await fetch('/ai_query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();

        const botMsgs = document.querySelectorAll('.cb-message.bot');
        if (botMsgs.length) botMsgs[botMsgs.length - 1].remove();

        if (data && data.reply) {
            appendMessage('bot', data.reply);
        } else if (data && data.error) {
            appendMessage('bot', 'ERROR: ' + data.error);
        } else {
            appendMessage('bot', 'Sorry; there is no response from the server');
        }
    } catch (err) {
        console.error(err);
        const botMsgs2 = document.querySelectorAll('.cb-message.bot');
        if (botMsgs2.length) botMsgs2[botMsgs2.length - 1].remove();
        appendMessage('bot', 'Connection Failed');
    }
}

form?.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});
sendBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    sendMessage();
});
textarea?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains(OPEN_CLASS)) closePanel();
});
