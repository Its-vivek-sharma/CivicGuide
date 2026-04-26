/**
 * CivicGuide — Chat Module (Stub)
 * Handles the AI Election Assistant chat interface.
 * Full Gemini API integration will be added in Step 4.
 */

'use strict';

const ChatModule = (() => {

  let isLoading = false;

  /**
   * Validate chat message before sending.
   * @param {string} message
   * @returns {{ valid: boolean, message: string }}
   */
  function validateMessage(message) {
    const result = CivicUtils.validateInput(message, 500);
    if (!result.valid) return result;

    // Block empty whitespace-only messages
    if (message.trim().length < 2) {
      return { valid: false, message: 'Please enter a meaningful question.' };
    }
    return { valid: true, message: '' };
  }

  /**
   * Append a chat message to the container.
   * @param {string} text - Sanitized message text
   * @param {'user'|'bot'} sender
   */
  /**
   * Convert basic markdown to HTML for bot responses.
   * Handles **bold**, *italic*, bullet lists (*, -), and line breaks.
   */
  function formatMarkdown(text) {
    if (!text) return '';
    let html = text;
    // Escape any raw HTML first
    html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* (but not bullet points)
    html = html.replace(/(?<!\n|^)\*([^\*\n]+)\*/g, '<em>$1</em>');
    // Bullet lists: lines starting with * or -
    html = html.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul class="chat-list">$1</ul>');
    // Numbered lists: lines starting with 1. 2. etc
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    // Line breaks for remaining newlines (but not inside lists)
    html = html.replace(/\n/g, '<br>');
    // Clean up double <br> after lists
    html = html.replace(/<\/ul><br>/g, '</ul>');
    html = html.replace(/<br><ul/g, '<ul');
    return html;
  }

  function appendMessage(text, sender) {
    const container = document.getElementById('chat-container');
    if (!container) return;

    // Remove welcome message on first interaction
    const welcome = document.getElementById('chat-welcome');
    if (welcome) welcome.remove();

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message chat-message-${sender}`;
    msgDiv.setAttribute('role', 'article');
    msgDiv.setAttribute('aria-label', `${sender === 'user' ? 'You' : 'Assistant'} said`);

    const avatar = sender === 'user' ? '👤' : '🤖';
    // Format bot messages with markdown, keep user messages as plain text
    const formattedText = sender === 'bot' ? formatMarkdown(text) : text;
    msgDiv.innerHTML = `
      <div class="chat-message-avatar" aria-hidden="true">${avatar}</div>
      <div class="chat-message-bubble">${formattedText}</div>`;

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  }

  /**
   * Handle form submission (stub — no API call yet).
   * @param {Event} e
   */
  function handleSubmit(e) {
    e.preventDefault();
    if (isLoading) return;

    const input = document.getElementById('chat-input');
    if (!input) return;

    const raw = input.value;
    const validation = validateMessage(raw);
    if (!validation.valid) {
      input.setAttribute('aria-invalid', 'true');
      return;
    }

    const sanitized = CivicUtils.sanitizeInput(raw.trim());
    appendMessage(sanitized, 'user');
    input.value = '';
    input.setAttribute('aria-invalid', 'false');

    // Stub bot response (will be replaced with Gemini API)
    isLoading = true;
    
    // Add loading indicator
    const loadingId = 'loading-' + Date.now();
    const container = document.getElementById('chat-container');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message chat-message-bot';
    loadingDiv.id = loadingId;
    loadingDiv.innerHTML = `<div class="chat-message-avatar" aria-hidden="true">🤖</div><div class="chat-message-bubble">Thinking...</div>`;
    if (container) {
      container.appendChild(loadingDiv);
      container.scrollTop = container.scrollHeight;
    }

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: sanitized })
    })
    .then(res => res.json())
    .then(data => {
      const loader = document.getElementById(loadingId);
      if (loader) loader.remove();
      
      if (data.error) {
        appendMessage('Sorry, there was an error processing your request.', 'bot');
      } else {
        appendMessage(data.reply, 'bot');
      }
    })
    .catch(err => {
      const loader = document.getElementById(loadingId);
      if (loader) loader.remove();
      console.error('Chat API Error:', err);
      appendMessage('Sorry, I am having trouble connecting to the server.', 'bot');
    })
    .finally(() => {
      isLoading = false;
    });
  }

  /**
   * Initialize chat module.
   */
  function init() {
    const form = document.getElementById('chat-form');
    if (form) form.addEventListener('submit', handleSubmit);
  }

  return { init, validateMessage, appendMessage, handleSubmit };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatModule;
}
