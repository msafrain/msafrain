// desktop.js
// FIXED VERSION — matched exactly to your index.html structure
// No wrapping, no header injection, no HTML modification.

(function () {
  function initDesktopUI($) {
    $(function () {
      if (!$("#mSafrain").length) return;

      var windowIndex = 0;
      var keyToId = {};              // map: data-window-id → numeric id
      var minimizedWidth = [];
      var minimizedHeight = [];
      var windowTopPos = [];
      var windowLeftPos = [];

      /* -----------------------------------
         FULLSCREEN ADJUST
      ----------------------------------- */
      function adjustFullScreenSize() {
        $("#mSafrain .fullSizeWindow .wincontent")
          .css("width", window.innerWidth - 32)
          .css("height", window.innerHeight - 98);
      }

      /* -----------------------------------
         MAKE WINDOW ACTIVE
      ----------------------------------- */
      function makeWindowActive(id) {
        $("#mSafrain .window").css("z-index", 900);
        $("#window" + id).css("z-index", 1000);

        $("#mSafrain .window").removeClass("activeWindow");
        $("#window" + id).addClass("activeWindow");

        $("#mSafrain .taskbarPanel").removeClass("activeTab");
        $("#minimPanel" + id).removeClass("minimizedTab").addClass("activeTab");
      }

      /* -----------------------------------
         MINIMIZE WINDOW
      ----------------------------------- */
      function minimizeWindow(id) {
        windowTopPos[id] = $("#window" + id).css("top");
        windowLeftPos[id] = $("#window" + id).css("left");

        $("#window" + id).animate(
          { top: 800, left: 0 },
          180,
          function () {
            $("#window" + id).addClass("minimizedWindow");
            $("#minimPanel" + id)
              .removeClass("activeTab")
              .addClass("minimizedTab");
          }
        );
      }

      /* -----------------------------------
         CLOSE WINDOW
      ----------------------------------- */
      function closeWindow(id) {
        $("#window" + id).addClass("closed");
        $("#minimPanel" + id).addClass("closed");
      }

      /* -----------------------------------
         OPEN MINIMIZED
      ----------------------------------- */
      function openMinimized(id) {
        $("#window" + id).removeClass("minimizedWindow");
        $("#minimPanel" + id).removeClass("minimizedTab");

        makeWindowActive(id);

        $("#window" + id).animate(
          { top: windowTopPos[id], left: windowLeftPos[id] },
          200
        );
      }

      /* -----------------------------------
         OPEN WINDOW
      ----------------------------------- */
      function openWindow(id) {
        if (id == null) return;

        if ($("#window" + id).hasClass("minimizedWindow")) {
          openMinimized(id);
        } else {
          $("#window" + id).removeClass("closed");
          $("#minimPanel" + id).removeClass("closed");
          makeWindowActive(id);
        }

        // scroll for mobile
        if (window.innerWidth <= 768) {
          var $t = $("#window" + id);
          $("html, body").animate(
            { scrollTop: $t.offset().top - 80 },
            300
          );
        }
      }

      /* -----------------------------------
         INIT WINDOWS
      ----------------------------------- */
      $("#mSafrain .window").each(function () {
        var $win = $(this);

        var key = $win.attr("data-window-id");  // VERY IMPORTANT
        var id = windowIndex;

        // Save mapping
        keyToId[key] = id;

        // Assign DOM id
        $win.attr("id", "window" + id);
        $win.attr("data-id", id);

        // Save window position
        minimizedWidth[id] = $win.width();
        minimizedHeight[id] = $win.height();
        windowTopPos[id] = $win.css("top");
        windowLeftPos[id] = $win.css("left");

        // TASKBAR ENTRY
        var title =
          $win.find(".windowTitle").text().trim() ||
          key ||
          "Window " + id;

        $("#taskbar").append(
          '<div class="taskbarPanel" id="minimPanel' +
            id +
            '" data-id="' +
            id +
            '">' +
            title +
            "</div>"
        );

        if ($win.hasClass("closed")) {
          $("#minimPanel" + id).addClass("closed");
        }

        windowIndex++;
      });

      /* -----------------------------------
         MAKE LAST WINDOW ACTIVE
      ----------------------------------- */
      if (windowIndex > 0) {
        var last = windowIndex - 1;
        $("#window" + last).addClass("activeWindow");
        $("#minimPanel" + last).addClass("activeTab");
      }

      /* -----------------------------------
         RESIZING & DRAG
      ----------------------------------- */
      function setupInteractions() {
        var mobile = window.innerWidth <= 768;

        try {
          $("#mSafrain .window").draggable("destroy");
        } catch (e) {}
        try {
          $("#mSafrain .wincontent").resizable("destroy");
        } catch (e) {}

        if (!mobile) {
          $("#mSafrain .window").draggable({ handle: ".windowHeader" });
          $("#mSafrain .wincontent").resizable();
        }
      }

      setupInteractions();
      adjustFullScreenSize();

      /* -----------------------------------
         EVENTS
      ----------------------------------- */

      // activate window by clicking
      $("#mSafrain").on("mousedown", ".window", function () {
        makeWindowActive($(this).data("id"));
      });

      // close
      $("#mSafrain").on("click", ".winclose", function () {
        closeWindow($(this).closest(".window").data("id"));
      });

      // minimize
      $("#mSafrain").on("click", ".winminimize", function () {
        minimizeWindow($(this).closest(".window").data("id"));
      });

      // maximize
      $("#mSafrain").on("click", ".winmaximize", function () {
        var win = $(this).closest(".window");
        var id = win.data("id");

        if (win.hasClass("fullSizeWindow")) {
          win.removeClass("fullSizeWindow");
          win
            .find(".wincontent")
            .height(minimizedHeight[id])
            .width(minimizedWidth[id]);
        } else {
          minimizedHeight[id] = win.find(".wincontent").height();
          minimizedWidth[id] = win.find(".wincontent").width();
          win.addClass("fullSizeWindow");
          adjustFullScreenSize();
        }
      });

      // taskbar click
      $("#mSafrain").on("click", ".taskbarPanel", function () {
        var id = $(this).data("id");

        if ($(this).hasClass("activeTab")) {
          minimizeWindow(id);
        } else if ($(this).hasClass("minimizedTab")) {
          openMinimized(id);
        } else {
          openWindow(id);
        }
      });

      // launchbar click
      $(document).on("click", ".openWindow", function () {
        var key = $(this).data("window-id");
        openWindow(keyToId[key]);
      });

      // icon click
      $(document).on("click", ".desktop-icon", function () {
        var key = $(this).data("window-id");
        openWindow(keyToId[key]);
      });

      $(window).on("resize", function () {
        setupInteractions();
        adjustFullScreenSize();
      });
    });
  }

  // wait for jquery
  function waitForjQuery() {
    if (window.jQuery) initDesktopUI(window.jQuery);
    else setTimeout(waitForjQuery, 100);
  }
  waitForjQuery();
})();
