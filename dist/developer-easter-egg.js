/* Original optional developer Easter egg; no payment data or personal info. */
(() => {
  'use strict';
  const STORAGE_KEY = 'xiaosheng-developer-egg-20261024-seen';
  const phone = document.getElementById('phone');
  const screen = document.getElementById('screen');
  if (!phone || !screen) return;

  const wechatQr = 'assets/support/wechat-099.png';
  const story = '嘿，你发现彩蛋啦！🌶️\n《小圣的手机》制作不易，喜欢的话请作者吃包辣条（¥0.99），支持 2.0 更新～\n完全自愿，谢谢你来玩 ❤️';
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
    return `<figure class="dev-payment-figure">
      <img class="dev-payment-poster" src="${wechatQr}" alt="用户提供的微信0.99元固定金额收款码：仅支持微信支付" width="900" height="1143" decoding="async" loading="eager" data-dev-expand-qr>
      <figcaption>微信扫码支付 ¥0.99 · 完全自愿</figcaption>
    </figure>
    <p class="dev-support-tip dev-payment-help">只有一部手机？保存收款图，再打开微信扫一扫从相册识别。</p>
    <button type="button" class="dev-qr-save" data-dev-save-qr>保存微信收款图</button>`;
  }
  function showDonation() {
    if (!overlay || overlay.querySelector('.dev-support-layer')) return;
    const layer = document.createElement('section');
    layer.className = 'dev-support-layer';
    layer.setAttribute('role', 'dialog');
    layer.setAttribute('aria-label', '微信自愿支持作者零点九九元');
    layer.innerHTML = `<header class="dev-support-header"><button type="button" data-dev-dismiss-support aria-label="返回开发者聊天">‹</button><strong>🌶️ 请作者吃包辣条 · ¥0.99</strong></header>
      <div class="dev-support-content">${donationHtml()}
        <button type="button" class="dev-support-return" data-dev-finish-support>继续玩</button>
        <p class="dev-support-foot">支持完全自愿，不影响游戏内容，也不会自动扣款。</p>
      </div>`;
    overlay.appendChild(layer);
    layer.querySelector('[data-dev-dismiss-support]')?.focus({ preventScroll: true });
  }
  function showChat() {
    if (overlay) return;
    markSeen();
    overlay = document.createElement('section');
    overlay.className = 'dev-chat-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '与开发者的聊天彩蛋');
    overlay.innerHTML = `<div class="dev-chat-status"><span>微信</span><span>●●● ▰</span></div>
      <header class="dev-chat-header"><button type="button" data-dev-close aria-label="返回微信">‹</button><strong>开发者</strong><span aria-hidden="true">•••</span></header>
      <div class="dev-chat-scroll"><p class="dev-chat-day">今天</p>
        <div class="dev-message-list"><div class="dev-message-row"><span class="dev-message-avatar" aria-hidden="true">🌶️</span><p class="dev-message-bubble"></p></div></div>
        <div class="dev-chat-choices">
          <button type="button" class="dev-donate-btn" data-dev-support>🌶️ ¥0.99 请作者吃包辣条</button>
          <button type="button" class="dev-return-btn" data-dev-close>继续玩</button>
        </div>
      </div>
      <footer class="dev-chat-footer">这是游戏内的作者留言 · 支持完全自愿</footer>`;
    overlay.querySelector('.dev-message-bubble').textContent = story;
    phone.appendChild(overlay);
    overlay.querySelector('[data-dev-close]')?.focus({ preventScroll: true });
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
    const a = document.createElement('a');
    a.href = wechatQr;
    a.download = 'xiaosheng-wechat-099.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Some mobile browsers and WeChat WebViews open the image rather than downloading it.
    // The original non-distorted image also supports long-press-to-save.
  }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-dev-save-qr]')) {
      saveWechatQr(); return;
    }
    if (event.target.closest('[data-dev-finish-support]')) { closeChat(); return; }
    if (event.target.closest('[data-dev-expand-qr]')) { saveWechatQr(); return; }
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
