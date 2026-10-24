/* Original optional developer Easter egg; no payment data or personal info. */
(() => {
  'use strict';
  const STORAGE_KEY = 'xiaosheng-developer-egg-20261024-seen';
  const phone = document.getElementById('phone');
  const screen = document.getElementById('screen');
  if (!phone || !screen) return;

  const wechatQr = 'assets/support/wechat-receive-code.svg';
  const story = [
    '等等！你居然真的在这部手机里发消息了 😂',
    '放心，这是一个可以互动的故事。刚刚那句话只保存在你的浏览器里，不会真的发给小王。',
    '我是这个网站的开发者。0520 的锁屏、微信、相册，还有那些小彩蛋，都是一点一点做出来的。',
    '如果你喜欢《小圣的手机》，愿意的话，可以请我吃包辣条 🌶️',
    '你的支持会让我更有动力打磨 2.0，但这完全是自愿的，不影响任何内容。',
    '谢谢你玩到这里！不管支不支持，都祝你玩得开心 ❤️'
  ];
  let overlay = null;
  let jobs = [];

  function seen() {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
  }
  function markSeen() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* private mode */ }
  }
  function contactMarkup() {
    return `<button type="button" class="wx-contact dev-contact" data-dev-contact aria-label="查看开发者彩蛋">
      <span class="wx-avatar-wrap"><span class="wx-avatar dev-contact-avatar" aria-hidden="true">🌶️</span>${seen() ? '' : '<b class="wx-unread" aria-label="新消息">1</b>'}</span>
      <span class="wx-contact-copy"><strong>开发者</strong><small>有句话想对玩到这里的你说……</small></span>
      <span class="wx-contact-end">彩蛋</span>
    </button>`;
  }
  function insertContact() {
    if (!seen()) return; // Keep the initial developer cameo a surprise until a user sends a message.
    const list = screen.querySelector('#wx-contact-list');
    if (!list || list.querySelector('[data-dev-contact]')) return;
    const input = screen.querySelector('#wx-contact-search');
    if (input && !'开发者 辣条 彩蛋 2.0'.includes(input.value.trim())) return;
    list.insertAdjacentHTML('beforeend', contactMarkup());
  }
  const observer = new MutationObserver(() => insertContact());
  observer.observe(screen, { childList: true, subtree: true });
  insertContact();

  function stopTimers() {
    jobs.forEach(clearTimeout);
    jobs = [];
  }
  function closeChat() {
    stopTimers();
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
    insertContact();
  }
  function donationHtml() {
    return `<div class="dev-payment-options"><div class="dev-payment-option"><strong>微信收款码</strong><span class="dev-wechat-only">仅支持微信支付</span><img class="dev-qr-image" src="${wechatQr}" alt="作者微信个人收款二维码" width="240" height="240" decoding="async"><p class="dev-support-tip">打开微信扫一扫即可自愿支持作者。</p><p class="dev-support-tip">只有一部手机？请截图保存二维码，再打开微信扫一扫，从相册识别。</p><button type="button" class="dev-qr-save" data-dev-save-qr>保存二维码为图片</button></div></div>`;
  }
  function showDonation() {
    if (!overlay || overlay.querySelector('.dev-support-layer')) return;
    const layer = document.createElement('section');
    layer.className = 'dev-support-layer';
    layer.setAttribute('role', 'dialog');
    layer.setAttribute('aria-label', '自愿支持作者');
    layer.innerHTML = `<div class="dev-support-header"><button type="button" data-dev-dismiss-support aria-label="返回聊天">‹</button><strong>给作者投喂一点灵感 🌶️</strong></div><div class="dev-support-content"><div class="dev-support-emoji" aria-hidden="true">🌶️</div>${donationHtml()}<p class="dev-support-foot">支持完全自愿，2.0 的实际更新时间不与支付挂钩。</p><button type="button" class="dev-support-return" data-dev-dismiss-support>返回聊天</button></div>`;
    overlay.appendChild(layer);
    layer.querySelector('[data-dev-dismiss-support]')?.focus({ preventScroll: true });
  }
  function appendMessage(text, index) {
    if (!overlay) return;
    const list = overlay.querySelector('.dev-message-list');
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'dev-message-row';
    const icon = document.createElement('span');
    icon.className = 'dev-message-avatar';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '🌶️';
    const bubble = document.createElement('p');
    bubble.className = 'dev-message-bubble';
    bubble.textContent = text;
    row.append(icon, bubble);
    list.append(row);
    const box = overlay.querySelector('.dev-chat-scroll');
    if (box) box.scrollTop = box.scrollHeight;
    const typing = overlay.querySelector('.dev-typing');
    if (typing) typing.hidden = index === story.length - 1;
    if (index === story.length - 1) {
      const choices = overlay.querySelector('.dev-chat-choices');
      if (choices) choices.hidden = false;
      if (box) box.scrollTop = box.scrollHeight;
    }
  }
  function revealMessages() {
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let delay = 0;
    story.forEach((message, index) => {
      jobs.push(setTimeout(() => appendMessage(message, index), delay));
      delay += reducedMotion ? 0 : 650 + Math.min(message.length * 11, 400);
    });
  }
  function showChat() {
    if (overlay) return;
    markSeen();
    overlay = document.createElement('section');
    overlay.className = 'dev-chat-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '与开发者的聊天彩蛋');
    overlay.innerHTML = `<div class="dev-chat-status"><span>微信 · 彩蛋</span><span>●●● ▰</span></div>
      <header class="dev-chat-header"><button type="button" data-dev-close aria-label="返回微信">‹</button><strong>开发者</strong><span aria-hidden="true">•••</span></header>
      <div class="dev-chat-scroll"><p class="dev-chat-day">今天</p><div class="dev-message-list" aria-live="polite"></div><div class="dev-typing" aria-label="开发者正在输入"><i></i><i></i><i></i></div>
      <div class="dev-chat-choices" hidden><button type="button" class="dev-donate-btn" data-dev-support>🌶️ 请作者吃包辣条</button><button type="button" class="dev-return-btn" data-dev-close>继续探索手机</button></div></div>
      <footer class="dev-chat-footer"><span>📎</span><span>这是作者留言，不会发送真实微信消息</span><span>☺</span></footer>`;
    phone.appendChild(overlay);
    overlay.querySelector('[data-dev-close]')?.focus({ preventScroll: true });
    revealMessages();
    insertContact();
  }
  document.addEventListener('submit', event => {
    if (event.target?.dataset?.form !== 'wx-message' || seen()) return;
    if (!(screen.querySelector('#wx-message-input')?.value || '').trim()) return;
    jobs.push(setTimeout(() => {
      if (document.querySelector('.wx-shell') && !overlay) showChat();
    }, 900));
  }, true);
  function saveWechatQr() {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 720;
        canvas.height = 720;
        const g = canvas.getContext('2d');
        if (!g) throw Error('Canvas unavailable');
        g.fillStyle = '#fff';
        g.fillRect(0, 0, 720, 720);
        g.imageSmoothingEnabled = false;
        g.drawImage(img, 0, 0, 720, 720);
        canvas.toBlob(blob => {
          if (!blob) { window.open(wechatQr, '_blank', 'noopener'); return; }
          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = objectUrl;
          a.download = '小圣的手机_微信收款码.png';
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
        }, 'image/png');
      } catch {
        window.open(wechatQr, '_blank', 'noopener');
      }
    };
    img.onerror = () => window.open(wechatQr, '_blank', 'noopener');
    img.src = wechatQr;
  }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-dev-save-qr]')) {
      saveWechatQr(); return;
    }
    if (event.target.closest('[data-dev-contact]')) {
      event.preventDefault(); event.stopImmediatePropagation(); showChat(); return;
    }
    if (!overlay) return;
    if (event.target.closest('[data-dev-dismiss-support]')) {
      overlay.querySelector('.dev-support-layer')?.remove(); return;
    }
    if (event.target.closest('[data-dev-support]')) { showDonation(); return; }
    if (event.target.closest('[data-dev-close]')) { closeChat(); return; }
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !overlay) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (overlay.querySelector('.dev-support-layer')) overlay.querySelector('.dev-support-layer').remove();
    else closeChat();
  }, true);
})();
