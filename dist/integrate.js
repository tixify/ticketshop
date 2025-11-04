(function () {
  function init() {
    // Support both ID and class
    var containers = document.querySelectorAll("#shop-frame, .shop-frame");
    if (!containers.length) {
      console.warn("Tixify Integrate: No shop container found (#shop-frame or .shop-frame)");
      return;
    }

    // Load iframe-resizer once
    function loadResizer(callback) {
      if (typeof iFrameResize !== "undefined") {
        callback();
        return;
      }

      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/iframe-resizer/js/iframeResizer.min.js";
      script.onload = callback;
      document.head.appendChild(script);
    }

    // Create iframes for all containers
    function setupIframes() {
      containers.forEach(function (container) {
        var url = container.getAttribute("data-url");
        if (!url) {
          console.warn("Tixify Integrate: Missing data-url for container", container);
          return;
        }

        // Avoid duplicate iframes if re-initialized
        if (container.querySelector("iframe")) return;

        var iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style.width = "100%";
        iframe.style.border = "0";
        iframe.style.display = "block";
        iframe.setAttribute("scrolling", "no");
        iframe.setAttribute("allowfullscreen", "");

        container.appendChild(iframe);

        iFrameResize(
          {
            log: false,
            checkOrigin: false,
            heightCalculationMethod: "max",
          },
          iframe
        );
      });
    }

    // Load resizer, then setup
    loadResizer(setupIframes);
  }

  // Wait for DOM to be ready
  if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
