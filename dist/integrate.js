(function () {

  'use strict';

  // --- Add iframe-resizer parent script dynamically (if not already loaded) ---
  function loadIframeResizerParent(callback) {
    if (typeof window.iframeResize === 'function') return callback && callback();
    if (document.getElementById('tixify-iframe-resizer-parent')) {
      // Already loading, wait
      var wait = setInterval(function () {
        if (typeof window.iframeResize === 'function') { clearInterval(wait); callback && callback(); }
      }, 50);
      setTimeout(function () { clearInterval(wait); }, 10000);
      return;
    }
    var s = document.createElement('script');
    s.id = 'tixify-iframe-resizer-parent';
    s.src = 'https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js';
    s.async = true;
    s.onload = function () { callback && callback(); };
    document.head.appendChild(s);
  }

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
        background: transparent !important;
      }
      .iframe-pad-wrap {
        padding-left: 2%;
        padding-right: 2%;
        box-sizing: border-box;
        background: transparent !important;
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
        display: block;
        border-radius: 0.75rem;
        border: 1px solid #cec1cf;
        box-sizing: border-box;
        background: transparent !important;
        overflow: auto;
        /* No scrollbars: */
        scrollbar-width: none;
      }
      .tixify-iframe::-webkit-scrollbar {
        display: none;
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

  // --- CORE EMBED FUNCTION ---
  function findContainers() {
    return document.querySelectorAll('.shop-frame, #shop-frame');
  }

  function createIframeBlock(container, idx) {
    var url = container.getAttribute('data-url');
    if (!url) {
      console.warn('Tixify Integrate: missing data-url', container);
      return null;
    }
    if (container.querySelector('.tixify-shop-container')) return null;

    var borderColor = container.getAttribute('data-border-color') || '#cec1cf';

    // Structure
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
    iframe.setAttribute('frameborder', '0');
    iframe.style.border = '1px solid ' + borderColor;
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('scrolling', 'no');
    var iframeID = 'tixifyIframe-' + idx;
    iframe.id = iframeID;
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

    // Direct JS Resizer (same-domain optimization)
    iframe.onload = function() {
      try {
        var innerDoc = iframe.contentWindow.document;
        var height = innerDoc.body ? innerDoc.body.scrollHeight : 0;
        iframe.style.height = height + 'px';
        wrapper.style.height = (height + 100) + 'px';
      } catch (e) {
        // If direct resize fails, iframe-resizer will handle it if available
        if (typeof window.iframeResize === 'function') {
          window.iframeResize({
            checkOrigin: false,
            log: false,
            license: "GPLv3",
            heightCalculationMethod: 'auto',
            onResized: function(data) {
              iframe.style.height = data.height + 'px';
              wrapper.style.height = (parseInt(data.height, 10) + 100) + 'px';
            }
          }, iframe);
        } else {
          iframe.style.height = '800px';
          wrapper.style.height = '900px';
        }
      }
    };

    // Also resize on window resize
    window.addEventListener('resize', function() {
      try {
        var innerDoc = iframe.contentWindow.document;
        var height = innerDoc.body ? innerDoc.body.scrollHeight : 0;
        iframe.style.height = height + 'px';
        wrapper.style.height = (height + 100) + 'px';
      } catch (e) {
        // fallback (no-op; iframe-resizer will handle)
      }
    });

    // Always try to initialize iframe-resizer in case cross-domain scenario
    loadIframeResizerParent(function() {
      if (typeof window.iframeResize === 'function') {
        window.iframeResize({
          checkOrigin: false,
          log: false,
          license: "GPLv3",
          heightCalculationMethod: 'auto',
          onResized: function(data) {
            iframe.style.height = data.height + 'px';
            wrapper.style.height = (parseInt(data.height, 10) + 100) + 'px';
          }
        }, iframe);
      }
    });

    return iframe;
  }

  // --- INITIALIZE ALL EMBEDS ---
  function init() {
    injectStyles();
    var containers = findContainers();
    if (!containers.length) return;
    containers.forEach(function (container, idx) {
      createIframeBlock(container, idx);
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