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
        if (typeof id === "undefined" || id === null) return;

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

      // INITIALISE WINDOWS
      $("#mSafrain .window").each(function () {
        $(this).css("z-index", 1000);
        $(this).attr("data-id", i);
        minimizedWidth[i] = $(this).width();
        minimizedHeight[i] = $(this).height();
        windowTopPos[i] = $(this).css("top");
        windowLeftPos[i] = $(this).css("left");

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
        id = $(this).attr("data-id");

        if ($(this).hasClass("activeTab")) {
          minimizeWindow(id);
        } else if ($(this).hasClass("minimizedTab")) {
          openMinimized(id);
        } else {
          makeWindowActive(id);
        }
      });

      // 🔴 IMPORTANT CHANGE: listen on document, not just #mSafrain
      $(document).on("click", ".openWindow", function () {
        var wid = $(this).attr("data-id");
        openWindow(wid);
      });

      $("#mSafrain").on("click", ".winmaximize", function () {
        var win = $(this).parent().parent();
        var did = win.attr("data-id");
        if (win.hasClass("fullSizeWindow")) {
          win.removeClass("fullSizeWindow");
          win
            .find(".wincontent")
            .height(minimizedHeight[did])
            .width(minimizedWidth[did]);
        } else {
          win.addClass("fullSizeWindow");
          minimizedHeight[did] = win.find(".wincontent").height();
          minimizedWidth[did] = win.find(".wincontent").width();
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
})();      function openMinimized(id) {
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

      // INITIALISE WINDOWS
      $("#mSafrain .window").each(function () {
        $(this).css("z-index", 1000);
        $(this).attr("data-id", i);
        minimizedWidth[i] = $(this).width();
        minimizedHeight[i] = $(this).height();
        windowTopPos[i] = $(this).css("top");
        windowLeftPos[i] = $(this).css("left");

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
        id = $(this).attr("data-id");

        if ($(this).hasClass("activeTab")) {
          minimizeWindow(id);
        } else if ($(this).hasClass("minimizedTab")) {
          openMinimized(id);
        } else {
          makeWindowActive(id);
        }
      });

      $("#mSafrain").on("click", ".openWindow", function () {
        openWindow($(this).attr("data-id"));
      });

      $("#mSafrain").on("click", ".winmaximize", function () {
        var win = $(this).parent().parent();
        if (win.hasClass("fullSizeWindow")) {
          win.removeClass("fullSizeWindow");
          win
            .find(".wincontent")
            .height(minimizedHeight[win.attr("data-id")])
            .width(minimizedWidth[win.attr("data-id")]);
        } else {
          win.addClass("fullSizeWindow");
          minimizedHeight[win.attr("data-id")] = win
            .find(".wincontent")
            .height();
          minimizedWidth[win.attr("data-id")] = win
            .find(".wincontent")
            .width();
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
