/* Optional creator message. The supplied PNG is displayed/downloaded unchanged. */
(() => {
  'use strict';
  const STORAGE_KEY = 'xiaosheng-developer-egg-20261024-seen';
  const phone = document.getElementById('phone');
  const screen = document.getElementById('screen');
  if (!phone || !screen) return;
  const wechatQr = 'assets/payment/wechat_099_official_user_image.png?v=c21531196852';
  const story = '嘿，你发现彩蛋啦！🌶️\n《小圣的手机》制作不易，喜欢的话请作者吃包辣条（¥0.99），支持 2.0 更新～\n完全自愿，谢谢你来玩 ❤️';
  let overlay = null, pending = false, memorySeen = false, lastFocus = null;
  let previousScreenInert = false, previousHomeInert = false;
  const home = document.getElementById('home-indicator');
  function seen() {
    try { return memorySeen || localStorage.getItem(STORAGE_KEY) === '1'; }
    catch { return memorySeen; }
  }
  function markSeen() {
    memorySeen = true;
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* Keep this visit one-time. */ }
  }
  function closeChat() {
    if (!overlay) return;
    overlay.remove(); overlay = null;
    screen.inert = previousScreenInert;
    if (home) home.inert = previousHomeInert;
    const target = lastFocus?.isConnected ? lastFocus : screen.querySelector('#wx-message-input');
    target?.focus({ preventScroll: true });
  }
  function showChat() {
    if (overlay) return;
    markSeen();
    lastFocus = document.activeElement;
    previousScreenInert = screen.inert;
    previousHomeInert = home?.inert || false;
    screen.inert = true;
    if (home) home.inert = true;
    overlay = document.createElement('section');
    overlay.className = 'dev-chat-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '开发者留言');
    overlay.innerHTML = `<header class="dev-chat-header"><button type="button" data-dev-close aria-label="返回微信">‹</button><strong>开发者</strong><span aria-hidden="true">•••</span></header><div class="dev-chat-scroll"><p class="dev-chat-day">今天</p><div class="dev-message-row"><span class="dev-message-avatar" aria-hidden="true">🌶️</span><p class="dev-message-bubble"></p></div><div class="dev-chat-choices"><button type="button" class="dev-donate-btn" data-dev-support>🌶️ ¥0.99 请作者吃包辣条</button><button type="button" class="dev-return-btn" data-dev-close>继续玩</button></div></div>`;
    overlay.querySelector('.dev-message-bubble').textContent = story;
    phone.appendChild(overlay);
    overlay.querySelector('[data-dev-close]').focus({ preventScroll: true });
  }
  function showDonation() {
    if (!overlay) return;
    overlay.setAttribute('aria-label', '自愿支持开发者');
    overlay.innerHTML = `<div class="dev-support-page"><header class="dev-support-header"><button type="button" data-dev-close aria-label="返回继续玩">‹</button><h2>请作者吃包辣条 🌶️</h2></header><div class="dev-support-content"><p class="dev-support-tip">¥0.99 · 仅微信支付 · 自愿支持</p><p class="dev-support-recipient">支持对象：本网站开发者</p><a class="dev-qr-open" href="${wechatQr}" target="_blank" rel="noopener" aria-label="点按放大二维码"><img class="dev-qr-image" src="${wechatQr}" width="1209" height="1536" alt="开发者提供的绿色微信收款图，标示金额¥0.99" decoding="async"><span>点按放大 · 可长按保存</span></a></div><footer class="dev-support-actions"><a class="dev-qr-save" href="${wechatQr}" download="小圣的手机_微信支持0.99.png" target="_blank" rel="noopener">保存二维码</a><button type="button" class="dev-support-return" data-dev-close>返回继续玩</button></footer></div>`;
    overlay.querySelector('[data-dev-close]').focus({ preventScroll: true });
  }
  // Capture text before the main app saves/rerenders it; verify the sent bubble after submission.
  document.addEventListener('submit', event => {
    if (event.target?.dataset?.form !== 'wx-message' || seen() || pending || screen.querySelector('.wx-room h1')?.textContent !== '小王') return;
    const text = (screen.querySelector('#wx-message-input')?.value || '').trim();
    if (!text) return;
    pending = true;
    setTimeout(() => {
      const sent = [...screen.querySelectorAll('.wx-message.outgoing .wx-text-bubble')].at(-1);
      if (event.defaultPrevented && sent?.textContent === text) {
        markSeen();
        setTimeout(() => {
          pending = false;
          if (screen.querySelector('.wx-room') && !overlay && !document.querySelector('#modal-root [role="dialog"]')) showChat();
              }, 750);
      } else pending = false;
    }, 0);
  }, true);
  document.addEventListener('click', event => {
    if (!overlay) return;
    if (event.target.closest('[data-dev-support]')) {
      event.preventDefault(); event.stopImmediatePropagation(); showDonation(); return;
    }
    if (event.target.closest('[data-dev-close]')) {
      event.preventDefault(); event.stopImmediatePropagation(); closeChat();
    }
  }, true);
  document.addEventListener('keydown', event => {
    if (!overlay) return;
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopImmediatePropagation(); closeChat(); return;
    }
    if (event.key === 'Tab') {
      const controls = [...overlay.querySelectorAll('button,a[href]')];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }, true);
})();
