// desktop.js
// Window management for mSafrain Desktop UI

(function () {
  function initDesktopUI($) {
    $(function () {
      if (!$("#mSafrain").length) return;

      var i = 0,
        minimizedWidth = [],
        minimizedHeight = [],
        windowTopPos = [],
        windowLeftPos = [],
        id;

      // Map from string window IDs (data-window-id) to numeric IDs
      var windowIdMap = {};

      function adjustFullScreenSize() {
        $("#mSafrain .fullSizeWindow .wincontent")
          .css("width", window.innerWidth - 32)
          .css("height", window.innerHeight - 98);
      }

      function makeWindowActive(thisid) {
        $("#mSafrain .window").each(function () {
          $(this).css(
            "z-index",
            parseInt($(this).css("z-index") || 0, 10) - 1
          );
        });
        $("#window" + thisid).css("z-index", 1000);
        $("#mSafrain .window").removeClass("activeWindow");
        $("#window" + thisid).addClass("activeWindow");
        $("#mSafrain .taskbarPanel").removeClass("activeTab");
        $("#minimPanel" + thisid).addClass("activeTab");
      }

      function minimizeWindow(id) {
        windowTopPos[id] = $("#window" + id).css("top");
        windowLeftPos[id] = $("#window" + id).css("left");

        $("#window" + id).animate(
          {
            top: 800,
            left: 0,
          },
          200,
          function () {
            $("#window" + id).addClass("minimizedWindow");
            $("#minimPanel" + id).addClass("minimizedTab");
            $("#minimPanel" + id).removeClass("activeTab");
          }
        );
      }

      function openWindow(id) {
        if ($("#window" + id).hasClass("minimizedWindow")) {
          openMinimized(id);
        } else {
          makeWindowActive(id);
          $("#window" + id).removeClass("closed");
          $("#minimPanel" + id).removeClass("closed");
        }
      }

      function closeWindwow(id) {
        $("#window" + id).addClass("closed");
        $("#minimPanel" + id).addClass("closed");
      }

      function openMinimized(id) {
        $("#window" + id).removeClass("minimizedWindow");
        $("#minimPanel" + id).removeClass("minimizedTab");
        makeWindowActive(id);

        $("#window" + id).animate(
          {
            top: windowTopPos[id],
            left: windowLeftPos[id],
          },
          200
        );
      }

      function setupInteractions() {
        var isMobile = window.innerWidth <= 768;

        try {
          $("#mSafrain .window").draggable("destroy");
        } catch (e) {}
        try {
          $("#mSafrain .wincontent").resizable("destroy");
        } catch (e) {}

        if (!isMobile) {
          $("#mSafrain .wincontent").resizable();
          $("#mSafrain .window").draggable({ cancel: ".wincontent" });
        }
      }

      // Helper: resolve numeric window ID from an element (button/panel)
      function getNumericIdFromTarget($el) {
        var winTarget = $el.attr("data-window-target");
        if (winTarget && windowIdMap.hasOwnProperty(winTarget)) {
          return windowIdMap[winTarget];
        }
        // Fallback to old behaviour: use data-id (numeric)
        var dataId = $el.attr("data-id");
        if (typeof dataId !== "undefined") {
          return dataId;
        }
        return null;
      }

      // INITIALISE WINDOWS
      $("#mSafrain .window").each(function () {
        var $win = $(this);

        $win.css("z-index", 1000);

        // String ID for this window (from HTML), or generate a fallback
        var stringId = $win.attr("data-window-id") || "window-" + i;

        // Numeric ID for internal logic
        $win.attr("data-id", i);
        minimizedWidth[i] = $win.width();
        minimizedHeight[i] = $win.height();
        windowTopPos[i] = $win.css("top");
        windowLeftPos[i] = $win.css("left");

        // Store mapping from string ID -> numeric ID
        windowIdMap[stringId] = i;

        // TASKBAR PANEL: include both numeric and string references
        $("#taskbar").append(
          '<div class="taskbarPanel" id="minimPanel' +
            i +
            '" data-id="' +
            i +
            '" data-window-target="' +
            stringId +
            '">' +
            $win.attr("data-title") +
            "</div>"
        );

        if ($win.hasClass("closed")) {
          $("#minimPanel" + i).addClass("closed");
        }

        $win.attr("id", "window" + i);
        i++;

        $win.wrapInner('<div class="wincontent"></div>');
        $win.prepend(
          '<div class="windowHeader"><strong>' +
            $win.attr("data-title") +
            '</strong><span class="winminimize">–</span><span class="winmaximize">□</span><span class="winclose">x</span></div>'
        );
      });

      $("#minimPanel" + (i - 1)).addClass("activeTab");
      $("#window" + (i - 1)).addClass("activeWindow");

      setupInteractions();
      adjustFullScreenSize();

      // EVENTS
      $("#mSafrain .window").mousedown(function () {
        makeWindowActive($(this).attr("data-id"));
      });

      $("#mSafrain").on("click", ".winclose", function () {
        closeWindwow($(this).parent().parent().attr("data-id"));
      });

      $("#mSafrain").on("click", ".winminimize", function () {
        minimizeWindow($(this).parent().parent().attr("data-id"));
      });

      $("#mSafrain").on("click", ".taskbarPanel", function () {
        var numericId = getNumericIdFromTarget($(this));
        if (numericId === null) return;

        if ($(this).hasClass("activeTab")) {
          minimizeWindow(numericId);
        } else if ($(this).hasClass("minimizedTab")) {
          openMinimized(numericId);
        } else {
          makeWindowActive(numericId);
        }
      });

      $("#mSafrain").on("click", ".openWindow", function () {
        var numericId = getNumericIdFromTarget($(this));
        if (numericId === null) return;
        openWindow(numericId);
      });

      $("#mSafrain").on("click", ".winmaximize", function () {
        var win = $(this).parent().parent();
        var id = win.attr("data-id");
        if (win.hasClass("fullSizeWindow")) {
          win.removeClass("fullSizeWindow");
          win
            .find(".wincontent")
            .height(minimizedHeight[id])
            .width(minimizedWidth[id]);
        } else {
          win.addClass("fullSizeWindow");
          minimizedHeight[id] = win.find(".wincontent").height();
          minimizedWidth[id] = win.find(".wincontent").width();
          adjustFullScreenSize();
        }
      });

      $(window).on("resize", function () {
        setupInteractions();
        adjustFullScreenSize();
      });
    });
  }

  function waitForjQuery() {
    if (window.jQuery && typeof window.jQuery === "function") {
      initDesktopUI(window.jQuery);
    } else {
      setTimeout(waitForjQuery, 100);
    }
  }

  waitForjQuery();
})();
