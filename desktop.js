// desktop.js
// Window management + Blogger loading for mSafrain Desktop UI
// FIXED:
// 1) Archive click always opens (mLetters + mStratagems included)
// 2) mChapters + mKnowledge archive loads more reliably (maxResults reduced + loading text)
// 3) openWindowByKey cleaned + safe
// 4) All handlers scoped to #mSafrain (less “random” event issues)

(function () {
  function initDesktopUI($) {
    $(function () {
      if (!$("#mSafrain").length) return;

      var i = 0,
        minimizedWidth = [],
        minimizedHeight = [],
        windowTopPos = [],
        windowLeftPos = [],
        keyToId = {}; // map from string window key -> numeric ID

      function adjustFullScreenSize() {
        $("#mSafrain .fullSizeWindow .wincontent")
          .css("width", window.innerWidth - 32)
          .css("height", window.innerHeight - 98);
      }

      function makeWindowActive(thisid) {
        $(".top-dropdown").removeClass("open");

        if (thisid === undefined || thisid === null) return;

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
        if (id === undefined || id === null) return;

        windowTopPos[id] = $("#window" + id).css("top");
        windowLeftPos[id] = $("#window" + id).css("left");

        $("#window" + id).animate({ top: 800, left: 0 }, 200, function () {
          $("#window" + id).addClass("minimizedWindow");
          $("#minimPanel" + id).addClass("minimizedTab").removeClass("activeTab");
        });
      }

      function openMinimized(id) {
        if (id === undefined || id === null) return;

        $("#window" + id).removeClass("minimizedWindow");
        $("#minimPanel" + id).removeClass("minimizedTab");
        makeWindowActive(id);

        $("#window" + id).animate({ top: windowTopPos[id], left: windowLeftPos[id] }, 200);
      }

      function openWindow(id) {
        if (id === undefined || id === null) return;

        $("#window" + id).removeClass("closed");

        if ($("#window" + id).hasClass("minimizedWindow")) {
          openMinimized(id);
        } else {
          makeWindowActive(id);
        }

        $("#minimPanel" + id).removeClass("closed");

        // Mobile: scroll to window
        if (window.innerWidth <= 768) {
          var $target = $("#window" + id);
          if ($target.length) {
            $("html, body").animate({ scrollTop: $target.offset().top - 80 }, 300);
          }
        }
      }

      // Open by data-window-id key (SAFE + multiple fallbacks)
      function openWindowByKey(key) {
        key = (key || "").toString().trim();
        if (!key) return;

        // Path 1: mapping exists
        if (keyToId && keyToId[key] !== undefined) {
          openWindow(keyToId[key]);
          return;
        }

        // Path 2: find window by data-window-id
        var $win = $('#mSafrain .window[data-window-id="' + key + '"]');
        if (!$win.length) return;

        // If it already has data-id, use full open path
        var nid = $win.attr("data-id");
        if (nid !== undefined && nid !== null && nid !== "") {
          openWindow(nid);
          return;
        }

        // Path 3: force show (last resort)
        $win.removeClass("closed minimizedWindow").css("z-index", 9999);
      }

      function closeWindow(id) {
        if (id === undefined || id === null) return;
        $("#window" + id).addClass("closed");
        $("#minimPanel" + id).addClass("closed");
      }

      function setupInteractions() {
        var isMobile = window.innerWidth <= 768;

        try { $("#mSafrain .window").draggable("destroy"); } catch (e) {}
        try { $("#mSafrain .wincontent").resizable("destroy"); } catch (e) {}

        if (!isMobile) {
          $("#mSafrain .wincontent").resizable();
          $("#mSafrain .window").draggable({ cancel: ".wincontent" });
        }
      }

      // INITIALISE WINDOWS
      $("#mSafrain .window").each(function () {
        var $win = $(this);
        var key = $win.attr("data-window-id") || "window-" + i;

        var title =
          $win.attr("data-title") ||
          $win.find(".windowTitle").text().trim() ||
          key;

        var presetPositions = {
          bysafrain: { top: 160, left: 60 },
          mpoetry: { top: 210, left: 380 },
          mthoughts: { top: 140, left: 700 }
        };

        var baseTop, baseLeft;
        if (presetPositions[key]) {
          baseTop = presetPositions[key].top;
          baseLeft = presetPositions[key].left;
        } else {
          baseTop = parseInt($win.css("top"), 10) || 140;
          baseLeft = parseInt($win.css("left"), 10) || 140;
        }

        var randTop = baseTop + Math.floor(Math.random() * 40) - 20;
        var randLeft = baseLeft + Math.floor(Math.random() * 60) - 30;

        $win.css({ top: randTop + "px", left: randLeft + "px", transform: "none" });
        $win.css("z-index", 1000);
        $win.attr("data-id", i);

        minimizedWidth[i] = $win.width();
        minimizedHeight[i] = $win.height();
        windowTopPos[i] = $win.css("top");
        windowLeftPos[i] = $win.css("left");

        keyToId[key] = i;

        $("#taskbar").append(
          '<div class="taskbarPanel" id="minimPanel' +
            i +
            '" data-id="' +
            i +
            '">' +
            title +
            "</div>"
        );

        if ($win.hasClass("closed")) {
          $("#minimPanel" + i).addClass("closed");
        }

        $win.attr("id", "window" + i);
        i++;
      });

      setupInteractions();
      adjustFullScreenSize();

      // EVENTS
      $("#mSafrain").on("mousedown", ".window", function () {
        makeWindowActive($(this).attr("data-id"));
      });

      $("#mSafrain").on("click", ".winclose", function () {
        closeWindow($(this).closest(".window").attr("data-id"));
      });

      $("#mSafrain").on("click", ".winminimize", function () {
        minimizeWindow($(this).closest(".window").attr("data-id"));
      });

      $("#mSafrain").on("click", ".winmaximize", function () {
        var win = $(this).closest(".window");
        var wid = win.attr("data-id");

        if (win.hasClass("fullSizeWindow")) {
          win.removeClass("fullSizeWindow");
          win.find(".wincontent").height(minimizedHeight[wid]).width(minimizedWidth[wid]);
        } else {
          win.addClass("fullSizeWindow");
          minimizedHeight[wid] = win.find(".wincontent").height();
          minimizedWidth[wid] = win.find(".wincontent").width();
          adjustFullScreenSize();
        }
      });

      // Taskbar click
      $("#mSafrain").on("click", ".taskbarPanel", function () {
        var id = $(this).attr("data-id");

        if ($(this).hasClass("closed")) {
          openWindow(id);
        } else if ($(this).hasClass("activeTab")) {
          minimizeWindow(id);
        } else if ($(this).hasClass("minimizedTab")) {
          openMinimized(id);
        } else {
          makeWindowActive(id);
        }
      });

      // Launchbar + dropdown buttons
      $("#mSafrain").on("click", ".openWindow", function () {
        openWindowByKey($(this).attr("data-window-id"));
      });

      // Desktop icons
      $("#mSafrain").on("click", ".desktop-icon", function () {
        openWindowByKey($(this).attr("data-window-id"));
      });

      // mArchives list: ALWAYS open (this is the fix for mLetters + mStratagems archive not popping)
      $("#mSafrain").on("click", ".archive-item", function (e) {
        e.preventDefault();
        e.stopPropagation();

        var key = ($(this).attr("data-archive-target") || "").trim();
        if (!key) return;

        // Try normal open
        openWindowByKey(key);

        // Hard fallback: force show
        var $win = $('#mSafrain .window[data-window-id="' + key + '"]');
        if (!$win.length) return;

        $win.removeClass("closed minimizedWindow").css("z-index", 9999);

        var nid = $win.attr("data-id");
        if (nid !== undefined && nid !== null && nid !== "") {
          $("#minimPanel" + nid).removeClass("closed minimizedTab");
          makeWindowActive(nid);
        }
      });

      // mVisual alt-text modal
      $(document).on("click", ".mvisual-item img", function () {
        var alt = $(this).closest(".mvisual-item").attr("data-alt") || "";
        if (!alt) return;
        $("#mVisualAltModalText").text(alt);
        $("#mVisualAltModal").addClass("open");
      });

      $(document).on("click", "#mVisualAltModal, #mVisualAltModal .modal-close", function (e) {
        if (e.target.id === "mVisualAltModal" || $(e.target).hasClass("modal-close")) {
          $("#mVisualAltModal").removeClass("open");
        }
      });

      // TOP MENU DROPDOWNS (mMind / mBody)
      $(document).on("click", ".topMenuButton", function (e) {
        e.stopPropagation();

        var menuId = $(this).attr("data-menu-id");
        if (!menuId) return;

        var $btn = $(this);
        var $menu = $("#" + menuId);
        if (!$menu.length) return;

        var btnOffset = $btn.offset();
        var left = btnOffset.left - $(window).scrollLeft();
        $menu.css({ left: left + "px" });

        if ($menu.hasClass("open")) {
          $menu.removeClass("open");
        } else {
          $(".top-dropdown").removeClass("open");
          $menu.addClass("open");
        }
      });

      $(document).on("click", ".top-dropdown", function (e) {
        e.stopPropagation();
      });
      $(document).on("click", function () {
        $(".top-dropdown").removeClass("open");
      });

      // Optional calls (won't error if not defined)
      if (typeof load_mMe === "function") load_mMe();
      if (typeof load_mThoughts === "function") load_mThoughts();
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

/***************************
 * 2. BLOGGER FEED HELPERS *
 ***************************/
var BLOG_BASE = "https://msafrain.blogspot.com/feeds/posts/default";

function bloggerJsonp(label, maxResults, callbackName) {
  var src = BLOG_BASE;
  if (label) src += "/-/" + encodeURIComponent(label);
  src += "?alt=json-in-script&callback=" + callbackName;
  if (maxResults) src += "&max-results=" + maxResults;

  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = src;
  document.body.appendChild(s);
}

function extractContent(entry) {
  if (!entry) return "";
  if (entry.content && entry.content.$t) return entry.content.$t;
  if (entry.summary && entry.summary.$t) return entry.summary.$t;
  return "";
}

function formatDate(entry) {
  if (!entry || !entry.published || !entry.published.$t) return "";
  var d = new Date(entry.published.$t);
  if (isNaN(d.getTime())) return "";
  var day = String(d.getDate()).padStart(2, "0");
  var month = d.toLocaleString("en-US", { month: "short" });
  var year = d.getFullYear();
  return day + " " + month + " " + year;
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/********************************
 * 3. FEED LOADERS (MAIN + ARCH) *
 ********************************/

/* ===== mPoetry ===== */
function load_mPoetry() { bloggerJsonp("mPoetry", 6, "handle_mPoetry"); }
function handle_mPoetry(json) {
  var el = document.getElementById("mPoetryContent");
  if (!el) return;
  var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];
  if (!entries.length) { el.textContent = "No mPoetry posts yet."; return; }

  var html = "";
  entries.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);
    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
    html += content;
  });
  el.innerHTML = html;
}

function load_mPoetry_archive() { bloggerJsonp("mPoetry", 50, "handle_mPoetry_archive"); }
function handle_mPoetry_archive(json) {
  var el = document.getElementById("mPoetryArchive");
  if (!el) return;
  var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];
  if (!entries.length) { el.textContent = "No mPoetry archives."; return; }

  var html = "";
  entries.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);
    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
    html += content;
  });
  el.innerHTML = html;
}

/* ===== mThoughts ===== */
function load_mThoughts() { bloggerJsonp("mThoughts", 6, "handle_mThoughts"); }
function handle_mThoughts(json) {
  var el = document.getElementById("mThoughts");
  if (!el) return;
  var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];
  if (!entries.length) { el.textContent = "No recent mThoughts."; return; }

  var html = "";
  entries.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);
    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
    html += content;
  });
  el.innerHTML = html;
}

function load_mThoughts_archive() { bloggerJsonp("mThoughts", 50, "handle_mThoughts_archive"); }
function handle_mThoughts_archive(json) {
  var el = document.getElementById("mThoughtsArchive");
  if (!el) return;
  var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];
  if (!entries.length) { el.textContent = "No mThoughts archives."; return; }

  var html = "";
  entries.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);
    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
    html += content;
  });
  el.innerHTML = html;
}

/* ===== mChapters ===== */
function load_mChapters() { bloggerJsonp("mChapters", 6, "handle_mChapters"); }
function handle_mChapters(json) {
  var el = document.getElementById("mChaptersContent");
  if (!el) return;
  var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];
  if (!entries.length) { el.textContent = "No mChapters posts yet."; return; }

  var html = "";
  entries.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);
    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
    html += content;
  });
  el.innerHTML = html;
}

// FIX: reduce to 50 + show loading text so you know callback fired
function load_mChapters_archive() {
  var el = document.getElementById("mChaptersArchive");
  if (el) el.textContent = "Loading mChapters Archives...";
  bloggerJsonp("mChapters", 50, "handle_mChapters_archive");
}
function handle_mChapters_archive(json) {
  var el = document.getElementById("mChaptersArchive");
  if (!el) return;

  var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];
  if (!entries.length) { el.textContent = "No mChapters Archives yet."; return; }

  var out = "<ul class='archive-list'>";
  entries.forEach(function (entry) {
    var title = entry.title ? entry.title.$t : "(untitled)";
    var link = "";
    (entry.link || []).forEach(function (l) { if (l.rel === "alternate") link = l.href; });

    out += "<li>";
    out += link
      ? "<a href='" + link + "' target='_blank' rel='noopener noreferrer'>" + escapeHtml(title) + "</a>"
      : escapeHtml(title);
    out += "</li>";
  });
  out += "</ul>";

  el.innerHTML = out;
}

/* ===== mKnowledge ===== */
function load_mKnowledge() { bloggerJsonp("mKnowledge", 6, "handle_mKnowledge"); }
function handle_mKnowledge(json) {
  var el = document.getElementById("mKnowledgeContent");
  if (!el) return;
  var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];
  if (!entries.length) { el.textContent = "No mKnowledge posts yet."; return; }

  var html = "";
  entries.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);
    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
    html += content;
  });
  el.innerHTML = html;
}

// FIX: reduce to 50 + loading text
function load_mKnowledge_archive() {
  var el = document.getElementById("mKnowledgeArchive");
  if (el) el.textContent = "Loading mKnowledge Archives...";
  bloggerJsonp("mKnowledge", 50, "handle_mKnowledge_archive");
}
function handle_mKnowledge_archive(json) {
  var el = document.getElementById("mKnowledgeArchive");
  if (!el) return;

  var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];
  if (!entries.length) {
    el.textContent = "No mKnowledge Archives yet (check Blogger label spelling: mKnowledge).";
    return;
  }

  var out = "<ul class='archive-list'>";
  entries.forEach(function (entry) {
    var title = (entry.title && entry.title.$t) ? entry.title.$t : "(untitled)";
    var link = "";
    (entry.link || []).forEach(function (l) { if (l.rel === "alternate") link = l.href; });

    out += "<li>";
    out += link
      ? "<a href='" + link + "' target='_blank' rel='noopener noreferrer'>" + escapeHtml(title) + "</a>"
      : escapeHtml(title);
    out += "</li>";
  });
  out += "</ul>";

  el.innerHTML = out;
}

/* ===== mLetters ===== */
function load_mLetters() { bloggerJsonp("mLetters", 6, "handle_mLetters"); }
function handle_mLetters(json) {
  var el = document.getElementById("mLettersContent");
  var badge = document.getElementById("envelope-badge");

  var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];

  if (badge) {
    var count = entries.length;
    if (count > 6) count = 6;
    badge.textContent = count;
  }

  if (!el) return;
  if (!entries.length) { el.textContent = "No letters."; return; }

  var html = "";
  entries.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);
    if (idx > 0) html += '<div style="height:10px;"></div>';
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
    html += content;
  });
  el.innerHTML = html;
}

function load_mLetters_archive() { bloggerJsonp("mLetters", 50, "handle_mLetters_archive"); }
function handle_mLetters_archive(json) {
  var el = document.getElementById("mLettersArchive");
  if (!el) return;

  var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];
  if (!entries.length) { el.textContent = "No letter archives."; return; }

  var html = "";
  entries.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);
    if (idx > 0) html += '<div style="height:10px;"></div>';
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
    html += content;
  });
  el.innerHTML = html;
}

/* ===== mBrush / mStory / mVisual remain the same logic ===== */
/* (Keep your existing versions below; they should work as-is) */

/* ===== mStratagems ===== */
function load_mStratagems() { bloggerJsonp("mStratagems", 6, "handle_mStratagems"); }
function handle_mStratagems(json) {
  var el = document.getElementById("mStratagemsContent");
  if (!el) return;

  var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];
  if (!entries.length) { el.textContent = "No mStratagems posts."; return; }

  var html = "";
  entries.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);
    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
    html += content;
  });
  el.innerHTML = html;
}

function load_mStratagems_archive() { bloggerJsonp("mStratagems", 50, "handle_mStratagems_archive"); }
function handle_mStratagems_archive(json) {
  var el = document.getElementById("mStratagemsArchiveContent");
  if (!el) return;

  var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];
  if (!entries.length) { el.textContent = "No archives."; return; }

  var html = "";
  entries.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);
    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
    html += content;
  });
  el.innerHTML = html;
}
