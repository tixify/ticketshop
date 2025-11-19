// integrate.js - Custom Tixify Embed (Updated)
// Multi-shop | 600px container | Horizontal + vertical padding | No scrollbars | Branded header & centered footer | iframe-resizer

(function () {
  'use strict';

  // --- CONFIG ---
  var PARENT_CDN = 'https://cdn.jsdelivr.net/npm/@iframe-resizer/parent@5.5.7';

  var DEFAULT_OPTIONS = {
    checkOrigin: false,
    direction: 'none', // iframe takes care of its own scrolling
    log: false,
    scrolling: true,
  };

  // --- STYLES ---
  function injectStyles() {
    if (document.getElementById('tixify-embed-styles')) return;
    var css = `
      .tixify-shop-container {
        max-width: 600px;
        width: 100%;
        margin: 0 auto;
        position: relative;
        padding: 10px;
        box-sizing: border-box;
        background: #fff;
      }
      .iframe-pad-wrap {
        padding-left: 2%;
        padding-right: 2%;
        box-sizing: border-box;
        background: #fff;
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
      .tixify-iframe {
        width: 100%;
        height: 800px;
        display: block;
        border-radius: 0.75rem;
        border: 1px solid #cec1cf;
        box-sizing: border-box;
        background: #fff;
      }
      .footer__row {
        margin: .75rem 0;
        text-align: center;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
      }
      .footer__row__logo {
        position: relative;
        z-index: 5;
        display: flex;
        align-items: center;
        gap: .25rem;
      }
      .footer__row__logo a {
        text-decoration: none;
        color: inherit;
      }
      .footer__row__logo a:hover {
        text-decoration: none;
      }
      .footer__row__logo span {
        font-size: 0.875rem;
      }
      .footer__row__logo img {
        height: 1.25rem;
        vertical-align: middle;
      }
      @media (max-width: 720px) {
        .tixify-shop-container {
          padding: 5px;
        }
        .iframe-pad-wrap {
          padding-left: 1%;
          padding-right: 1%;
        }
      }
    `;
    var style = document.createElement('style');
    style.id = 'tixify-embed-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // --- LOAD IFRAME-RESIZER LIB ---
  function loadParentLibOnce(cb) {
    if (typeof window.iframeResize === 'function') return cb();
    if (document.querySelector('script[data-tixify-iframes-resizer]')) {
      // Already loading, just wait for it
      var wait = setInterval(function () {
        if (typeof window.iframeResize === 'function') {
          clearInterval(wait); cb();
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

  // --- CORE EMBED FUNCTION ---
  function findContainers() {
    return document.querySelectorAll('.shop-frame, #shop-frame');
  }

  function createIframeBlock(container) {
    var url = container.getAttribute('data-url');
    if (!url) {
      console.warn('Tixify Integrate: missing data-url', container);
      return null;
    }

    // Avoid duplicates
    if (container.querySelector('.tixify-shop-container')) return null;

    var borderColor = container.getAttribute('data-border-color') || '#cec1cf';

    // --- Structure ---
    var wrapper = document.createElement('div');
    wrapper.className = 'tixify-shop-container';

    // --- Header ---
    var header = document.createElement('div');
    header.className = 'branded-header';
    header.innerHTML = `
      <div class="branded-header__logo">
        <img src="https://tixifylive.s3.us-east-1.amazonaws.com/assets/tixify-logo.svg" alt="Tixify logo">
      </div>
    `;

    // --- Iframe with horizontal padding via wrapper ---
    var iframePadWrap = document.createElement('div');
    iframePadWrap.className = 'iframe-pad-wrap';

    var iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.className = 'tixify-iframe';
    iframe.title = 'Tixify Shop';
    iframe.style.border = '1px solid ' + borderColor;
    iframe.setAttribute('scrolling', 'no'); // No scrollbars
    iframe.setAttribute('allowfullscreen', '');

    iframePadWrap.appendChild(iframe);

    // --- Footer ---
    var footer = document.createElement('div');
    footer.className = 'footer__row';
    footer.innerHTML = `
      <div class="footer__row__logo">
        <a target="_blank" href="https://tixify.live/">
          <span>Powered by</span>
          <img src="https://tixifylive.s3.us-east-1.amazonaws.com/assets/tixify-logo.svg" alt="Powered by Tixify">
        </a>
      </div>
    `;

    // --- Assemble ---
    wrapper.appendChild(header);
    wrapper.appendChild(iframePadWrap);
    wrapper.appendChild(footer);

    container.appendChild(wrapper);

    return iframe;
  }

  // --- INITIALIZE ALL EMBEDS ---
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

  // --- DOM READY ---
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
  window.TixifyShopEmbed = { init: init };
})();