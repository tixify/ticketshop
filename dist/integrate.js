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
    wrapper.style.height = containerHeight; // set the container height

    // --- (optional) Header/Footer - keep as needed ---

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
    iframe.style.height = iframeHeight; // set iframe height from attribute

    // Hide scrollbars visually, but keep scrollable
    iframe.style.overflow = "auto";

    iframePadWrap.appendChild(iframe);

    // --- Assemble ---
    wrapper.appendChild(iframePadWrap);

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