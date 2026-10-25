/* Voluntary creator support, opened only from WeChat’s Me page. */
(() => {
  'use strict';
  const phone = document.getElementById('phone');
  const screen = document.getElementById('screen');
  if (!phone || !screen) return;
  const wechatQr = 'assets/payment/wechat_099_official_user_image.png?v=c21531196852';
  let overlay = null, lastFocus = null;
  let previousScreenInert = false, previousHomeInert = false;
  const home = document.getElementById('home-indicator');
  function closeChat() {
    if (!overlay) return;
    overlay.remove(); overlay = null;
    screen.inert = previousScreenInert;
    if (home) home.inert = previousHomeInert;
    const target = lastFocus?.isConnected ? lastFocus : screen.querySelector('[data-dev-support]');
    target?.focus({ preventScroll: true });
  }
  function showDonation() {
    if (overlay) return;
    lastFocus = document.activeElement;
    previousScreenInert = screen.inert;
    previousHomeInert = home?.inert || false;
    screen.inert = true;
    if (home) home.inert = true;
    overlay = document.createElement('section');
    overlay.className = 'dev-chat-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '自愿支持开发者');
    overlay.innerHTML = `<div class="dev-support-page"><header class="dev-support-header"><button type="button" data-dev-close aria-label="返回微信我的页面">‹</button><h2>支持开发者</h2></header><div class="dev-support-content"><p class="dev-support-tip">请作者吃包辣条 🌶️ · ¥0.99</p><p class="dev-support-recipient">支持本网站开发者 · 完全自愿</p><a class="dev-qr-open" href="${wechatQr}" target="_blank" rel="noopener" aria-label="点按放大二维码"><img class="dev-qr-image" src="${wechatQr}" width="1209" height="1536" alt="开发者提供的绿色微信收款图，标示金额¥0.99" decoding="async"><span>点按放大 · 可长按保存</span></a></div><footer class="dev-support-actions"><a class="dev-qr-save" href="${wechatQr}" download="小圣的手机_微信支持0.99.png" target="_blank" rel="noopener">保存二维码</a><button type="button" class="dev-support-return" data-dev-close>返回「我」</button></footer></div>`;
    phone.appendChild(overlay);
    overlay.querySelector('[data-dev-close]').focus({ preventScroll: true });
  }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-dev-support]')) {
      event.preventDefault(); event.stopImmediatePropagation(); showDonation(); return;
    }
    if (overlay && event.target.closest('[data-dev-close]')) {
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
