(function () {
  'use strict';

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
        scrollbar-width: none;      /* Firefox */
      }
      .tixify-iframe::-webkit-scrollbar {
        display: none;              /* Chrome, Safari, Opera */
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

  function createIframeBlock(container) {
    var url = container.getAttribute('data-url');
    if (!url) {
      console.warn('Tixify Integrate: missing data-url', container);
      return null;
    }
    if (container.querySelector('.tixify-shop-container')) return null;

    var borderColor = container.getAttribute('data-border-color') || '#cec1cf';

    // --- height logic ---
    var iframeHeight = container.getAttribute('data-iframe-height') || '800px';
    // Add 100px to container height (parse px value)
    var numericHeight = parseInt(iframeHeight.replace('px', ''), 10) || 800;
    var containerHeight = (numericHeight + 100) + 'px';

    // --- Structure ---
    var wrapper = document.createElement('div');
    wrapper.className = 'tixify-shop-container';
    wrapper.style.height = containerHeight;

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
    iframe.setAttribute('scrolling', 'yes'); // allow scroll
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.height = iframeHeight;
    iframe.style.overflow = "auto"; // scrollable (CSS hides scrollbars)

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
    containers.forEach(function (container) {
      createIframeBlock(container);
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