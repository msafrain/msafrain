// desktop.js
// Window management for mSafrain Desktop UI
// Simple + stable: numeric IDs only, mobile scroll-to-window

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

      function isMobile() {
        return window.innerWidth <= 768;
      }

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
        // Remember original position (desktop only)
        windowTopPos[id] = $("#window" + id).css("top");
        windowLeftPos[id] = $("#window" + id).css("left");

        if (isMobile()) {
          // Mobile: just slide up and mark minimized
          $("#window" + id).addClass("minimizedWindow").slideUp(200);
          $("#minimPanel" + id)
            .addClass("minimizedTab")
            .removeClass("activeTab");
        } else {
          // Desktop: animate to bottom
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

        if (isMobile()) {
          $("#window" + id).slideDown(200, function () {
            makeWindowActive(id);
          });
        } else {
          makeWindowActive(id);
          $("#window" + id).animate(
            {
              top: windowTopPos[id],
              left: windowLeftPos[id],
            },
            200
          );
        }
      }

      function setupInteractions() {
        var mobile = isMobile();

        try {
          $("#mSafrain .window").draggable("destroy");
        } catch (e) {}
        try {
          $("#mSafrain .wincontent").resizable("destroy");
        } catch (e) {}

        if (!mobile) {
          $("#mSafrain .wincontent").resizable();
          $("#mSafrain .window").draggable({ cancel: ".wincontent" });
        }
      }

      // MOBILE: open + scroll to window
      function mobileFocusWindow(id) {
        var $win = $("#window" + id);
        if (!$win.length) return;

        $win.removeClass("closed minimizedWindow").show();
        $("#minimPanel" + id)
          .removeClass("closed minimizedTab")
          .addClass("activeTab");

        var offsetTop = $win.offset().top;
        $("html, body").animate({ scrollTop: offsetTop - 80 }, 300);
      }

      // INITIALISE WINDOWS
      $("#mSafrain .window").each(function () {
        $(this).css("z-index", 1000);
        $(this).attr("data-id", i);

        minimizedWidth[i] = $(this).width();
        minimizedHeight[i] = $(this).height();
        windowTopPos[i] = $(this).css("top");
        windowLeftPos[i] = $(this).css("left");

        // Taskbar tab
        $("#taskbar").append(
          '<div class="taskbarPanel" id="minimPanel' +
            i +
            '" data-id="' +
            i +
            '">' +
            $(this).attr("data-title") +
            "</div>"
        );

        if ($(this).hasClass("closed")) {
          $("#minimPanel" + i).addClass("closed");
        }

        $(this).attr("id", "window" + i);
        i++;

        $(this).wrapInner('<div class="wincontent"></div>');
        $(this).prepend(
          '<div class="windowHeader"><strong>' +
            $(this).attr("data-title") +
            '</strong><span class="winminimize">–</span><span class="winmaximize">□</span><span class="winclose">x</span></div>'
        );
      });

      // Last window active by default
      $("#minimPanel" + (i - 1)).addClass("activeTab");
      $("#window" + (i - 1)).addClass("activeWindow");

      setupInteractions();
      adjustFullScreenSize();

      // EVENTS
      $("#mSafrain .window").mousedown(function () {
        if (!isMobile()) {
          makeWindowActive($(this).attr("data-id"));
        }
      });

      $("#mSafrain").on("click", ".winclose", function () {
        closeWindwow($(this).parent().parent().attr("data-id"));
      });

      $("#mSafrain").on("click", ".winminimize", function () {
        var id = $(this).parent().parent().attr("data-id");
        minimizeWindow(id);
      });

      // Taskbar click
      $("#mSafrain").on("click", ".taskbarPanel", function () {
        id = $(this).attr("data-id");

        if (isMobile()) {
          mobileFocusWindow(id);
          return;
        }

        if ($(this).hasClass("activeTab")) {
          minimizeWindow(id);
        } else if ($(this).hasClass("minimizedTab")) {
          openMinimized(id);
        } else {
          makeWindowActive(id);
        }
      });

      // TOP LAUNCHBAR (works anywhere in DOM)
      $(document).on("click", ".openWindow", function () {
        var id = $(this).attr("data-id");
        if (typeof id === "undefined") return;

        if (isMobile()) {
          mobileFocusWindow(id);
        } else {
          openWindow(id);
        }
      });

      $("#mSafrain").on("click", ".winmaximize", function () {
        var win = $(this).parent().parent();
        var wid = win.attr("data-id");
        if (win.hasClass("fullSizeWindow")) {
          win.removeClass("fullSizeWindow");
          win
            .find(".wincontent")
            .height(minimizedHeight[wid])
            .width(minimizedWidth[wid]);
        } else {
          win.addClass("fullSizeWindow");
          minimizedHeight[wid] = win.find(".wincontent").height();
          minimizedWidth[wid] = win.find(".wincontent").width();
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
