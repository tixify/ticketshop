// integrate.js - Tixify Embed v5
// Multiple shops | 700px container | Scrollable iframe | Custom border | Branded header & footer

(function () {
  'use strict';

  var PARENT_CDN = 'https://cdn.jsdelivr.net/npm/@iframe-resizer/parent@5.5.7';

  var DEFAULT_OPTIONS = {
    checkOrigin: false,
    direction: 'none', // iframe scrolls itself
    log: false,
    scrolling: true,
  };

  function findContainers() {
    return document.querySelectorAll('#shop-frame, .shop-frame');
  }

  function injectStyles() {
    if (document.getElementById('tixify-embed-styles')) return;
    var css = `
      .tixify-shop-container {
        max-width: 700px;
        width: 100%;
        margin: 0 auto;
        position: relative;
      }
      .branded-header {
        text-align: center;
        margin-bottom: 1.5rem;
        padding: 0 .875rem;
      }
      .branded-header__logo {
        height: 1.5rem;
        margin-bottom: 1rem;
      }
      .branded-header__logo img {
        height: 100%;
        max-width: 100%;
        display: inline-block;
      }
      .footer__row {
        margin: .75rem 0;
        text-align: left;
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
      }
      .footer__row__logo {
        position: relative;
        z-index: 5;
      }
      .footer__row__logo img {
        height: 1.25rem;
        vertical-align: middle;
        margin-left: .25rem;
      }
      @media (max-width: 720px) {
        .tixify-shop-container {
          max-width: 100%;
          padding: 0 1rem;
        }
      }
    `;
    var style = document.createElement('style');
    style.id = 'tixify-embed-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function createIframeBlock(container) {
    var url = container.getAttribute('data-url');
    if (!url) {
      console.warn('Tixify Integrate: missing data-url', container);
      return null;
    }

    // Avoid duplicates
    if (container.querySelector('.tixify-shop-container')) return;

    var borderColor = container.getAttribute('data-border-color') || '#cec1cf';

    // Create wrapper
    var wrapper = document.createElement('div');
    wrapper.className = 'tixify-shop-container';

    // --- Header ---
    var header = document.createElement('div');
    header.className = 'branded-header';
    header.innerHTML = `
      <div class="branded-header__logo">
        <img src="https://cdn.openticket.tech/whitelabels/tixify.shop/graphics/logo.svg" alt="Tixify logo">
      </div>
    `;

    // --- Iframe ---
    var iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.title = 'Tixify Shop';
    iframe.style.width = '100%';
    iframe.style.height = '800px';
    iframe.style.border = '1px solid ' + borderColor;
    iframe.style.borderRadius = '0.75rem';
    iframe.style.display = 'block';
    iframe.setAttribute('scrolling', 'yes');
    iframe.setAttribute('allowfullscreen', '');

    // --- Footer ---
    var footer = document.createElement('div');
    footer.className = 'footer__row';
    footer.innerHTML = `
      <div class="footer__row__logo">
        <a target="_blank" href="https://tixify.live/">
          <span>Powered by</span>
          <img src="https://cdn.openticket.tech/whitelabels/tixify.shop/graphics/logo.svg" alt="Powered by Tixify">
        </a>
      </div>
    `;

    // Build final structure
    wrapper.appendChild(header);
    wrapper.appendChild(iframe);
    wrapper.appendChild(footer);
    container.appendChild(wrapper);

    return iframe;
  }

  function loadParentLibOnce(cb) {
    if (typeof window.iframeResize === 'function') return cb();

    if (document.querySelector('script[data-tixify-iframes-resizer]')) {
      var wait = setInterval(function () {
        if (typeof window.iframeResize === 'function') {
          clearInterval(wait);
          cb();
        }
      }, 50);
      setTimeout(function () { clearInterval(wait); }, 10000);
      return;
    }

    var s = document.createElement('script');
    s.src = PARENT_CDN;
    s.async = true;
    s.defer = true;
    s.setAttribute('data-tixify-iframes-resizer', '1');
    s.onload = cb;
    s.onerror = function () {
      console.error('Tixify Integrate: failed to load iframe-resizer parent script');
      cb(new Error('iframe-resizer load failed'));
    };
    document.head.appendChild(s);
  }

  function init() {
    injectStyles();

    var containers = findContainers();
    if (!containers.length) return;

    var iframes = [];
    containers.forEach(function (container) {
      var iframe = createIframeBlock(container);
      if (iframe) iframes.push(iframe);
    });

    if (!iframes.length) return;

    loadParentLibOnce(function () {
      try {
        var bindFn = window.iframeResize || (window.iframeResize && window.iframeResize.default);
        if (typeof bindFn !== 'function') {
          console.warn('Tixify Integrate: iframeResize() not found after loading.');
          return;
        }
        bindFn(DEFAULT_OPTIONS, iframes);
      } catch (e) {
        console.error('Tixify Integrate: iframe-resizer init error', e);
      }
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

  window.TixifyShopEmbed = { init: init };
})();
