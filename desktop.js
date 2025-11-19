// 🔧 BLOG SOURCE CONFIG
// Later, you can point this to a real JSON feed (Blogger, WP.com REST, etc.)
// For now, we'll just simulate a single "post" if no API is configured.

const BLOG_API_URL = ""; 
// Example for WordPress.com later:
// const BLOG_API_URL = "https://YOURBLOG.wordpress.com/wp-json/wp/v2/posts?per_page=1";

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
          .css("width", (window.innerWidth - 32))
          .css("height", (window.innerHeight - 98));
      }

      function makeWindowActive(thisid) {
        $("#mSafrain .window").each(function () {
          $(this).css('z-index', parseInt($(this).css('z-index') || 0, 10) - 1);
        });
        $("#window" + thisid).css('z-index', 1000);
        $("#mSafrain .window").removeClass("activeWindow");
        $("#window" + thisid).addClass("activeWindow");
        $("#mSafrain .taskbarPanel").removeClass("activeTab");
        $("#minimPanel" + thisid).addClass("activeTab");
      }

      function minimizeWindow(id) {
        windowTopPos[id] = $("#window" + id).css("top");
        windowLeftPos[id] = $("#window" + id).css("left");

        $("#window" + id).animate({
          top: 800,
          left: 0
        }, 200, function () {
          $("#window" + id).addClass('minimizedWindow');
          $("#minimPanel" + id).addClass('minimizedTab');
          $("#minimPanel" + id).removeClass('activeTab');
        });
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

        $("#window" + id).animate({
          top: windowTopPos[id],
          left: windowLeftPos[id]
        }, 200);
      }

      function setupInteractions() {
        var isMobile = window.innerWidth <= 768;

        try { $("#mSafrain .window").draggable("destroy"); } catch (e) { }
        try { $("#mSafrain .wincontent").resizable("destroy"); } catch (e) { }

        if (!isMobile) {
          $("#mSafrain .wincontent").resizable();
          $("#mSafrain .window").draggable({ cancel: ".wincontent" });
        }
      }

      // Load latest "blog" content into mThoughts
      function loadLatestPoem() {
        var el = document.getElementById('poetryContent');
        if (!el) return;

        if (!BLOG_API_URL) {
          // Fallback static content for now
          el.innerHTML =
            '<h2>And I thought I could finally close the book</h2>' +
            '<div class="date">mThoughts</div>' +
            '<div class="body">' +
            'And I thought I could finally close the book,<br>' +
            'but unknowingly, there are more chapters waiting to be read.<br><br>' +
            '— Matin Safrain' +
            '</div>';
          return;
        }

        // Example for future: fetch from WordPress / Blogger / any JSON feed
        fetch(BLOG_API_URL)
          .then(function (res) { return res.json(); })
          .then(function (data) {
            // You’ll adjust this depending on the API shape later.
            // For now, assume WordPress-like structure if you plug it in.
            if (!Array.isArray(data) || data.length === 0) {
              el.textContent = 'No entries published yet.';
              return;
            }

            var post = data[0];

            var title = (post.title && (post.title.rendered || post.title)) || 'Untitled';
            var content =
              (post.content && (post.content.rendered || post.content)) ||
              (post.body || '') ||
              '';
            var date = post.date ? new Date(post.date) : null;
            var dateStr = date
              ? date.toLocaleDateString('en-SG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : '';

            var html = ''
              + '<h2>' + title + '</h2>'
              + (dateStr ? '<div class="date">' + dateStr + '</div>' : '')
              + '<div class="body">' + content + '</div>';

            el.innerHTML = html;
          })
          .catch(function (err) {
            console.error('Error loading mThoughts:', err);
            el.textContent = 'Unable to load content at the moment.';
          });
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
          '<div class="taskbarPanel" id="minimPanel' + i + '" data-id="' + i + '">' +
          $(this).attr("data-title") + "</div>"
        );

        if ($(this).hasClass("closed")) {
          $("#minimPanel" + i).addClass("closed");
        }

        $(this).attr("id", "window" + (i++));
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
          win.find(".wincontent")
            .height(minimizedHeight[win.attr("data-id")])
            .width(minimizedWidth[win.attr("data-id")]);
        } else {
          win.addClass("fullSizeWindow");
          minimizedHeight[win.attr("data-id")] = win.find(".wincontent").height();
          minimizedWidth[win.attr("data-id")] = win.find(".wincontent").width();
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
