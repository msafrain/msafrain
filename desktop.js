// desktop.js
// mSafrain Desktop UI + mThoughts (Blogger feed)

// 🔧 CHANGE THIS to your real Blogger blog name.
// If your blog is https://msafrain.blogspot.com,
// then BLOG_FEED_URL becomes:
const BLOG_FEED_URL =
  "https://YOURBLOGNAME.blogspot.com/feeds/posts/default?alt=json-in-script&callback=handleBloggerFeed";

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
          $(this).css("z-index", parseInt($(this).css("z-index") || 0, 10) - 1);
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

      // === mThoughts: Blogger feed ===

      // Global JSONP callback for Blogger
      window.handleBloggerFeed = function (data) {
        var el = document.getElementById("poetryContent");
        if (!el) return;

        try {
          if (!data.feed || !data.feed.entry || !data.feed.entry.length) {
            el.textContent = "No entries published yet.";
            return;
          }

          var entry = data.feed.entry[0]; // latest post
          var title = entry.title && entry.title.$t ? entry.title.$t : "Untitled";

          var content =
            entry.content && entry.content.$t
              ? entry.content.$t
              : entry.summary && entry.summary.$t
              ? entry.summary.$t
              : "";

          var dateStr = "";
          if (entry.published && entry.published.$t) {
            var d = new Date(entry.published.$t);
            dateStr = d.toLocaleDateString("en-SG", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          }

          el.innerHTML =
            "<h2>" +
            title +
            "</h2>" +
            (dateStr ? '<div class="date">' + dateStr + "</div>" : "") +
            '<div class="body">' +
            content +
            "</div>";
        } catch (err) {
          console.error("Error parsing Blogger feed:", err);
          el.textContent = "Unable to load mThoughts.";
        }
      };

      function loadLatestPoem() {
        var el = document.getElementById("poetryContent");
        if (!el) return;

        // Fallback while loading
        el.textContent = "Loading latest piece...";

        // Inject Blogger JSONP script
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.src = BLOG_FEED_URL;
        s.referrerPolicy = "no-referrer-when-downgrade";
        document.body.appendChild(s);
      }

      // === INITIALISE WINDOWS ===
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
      loadLatestPoem();

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
