// desktop.js
// Window management + Blogger loading for mSafrain Desktop UI

/****************************
 * 1. DESKTOP WINDOW SYSTEM *
 ****************************/
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
          { top: 800, left: 0 },
          200,
          function () {
            $("#window" + id).addClass("minimizedWindow");
            $("#minimPanel" + id)
              .addClass("minimizedTab")
              .removeClass("activeTab");
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
          { top: windowTopPos[id], left: windowLeftPos[id] },
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
        var $win = $(this);
        var key = $win.attr("data-window-id") || "window-" + i;

        // title priority: data-title > .windowTitle text > key
        var title =
          $win.attr("data-title") ||
          $win.find(".windowTitle").text().trim() ||
          key;

        $win.css("z-index", 1000);
        $win.attr("data-id", i);

        minimizedWidth[i] = $win.width();
        minimizedHeight[i] = $win.height();
        windowTopPos[i] = $win.css("top");
        windowLeftPos[i] = $win.css("left");

        keyToId[key] = i;

        // taskbar tab
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

        // your HTML already has .windowHeader and .wincontent
      });

            // Make mThoughts (single) the active window by default if present
      var defaultKey = "mthoughts-single";
      var defaultId = keyToId[defaultKey];
      if (typeof defaultId === "undefined") {
        defaultId = i > 0 ? i - 1 : null;
      }
      if (defaultId !== null) {
        $("#minimPanel" + defaultId).addClass("activeTab");
        $("#window" + defaultId).addClass("activeWindow");
      }

      // Ensure "By mSafrain" opens on load (not closed)
      var byId = keyToId["bysafrain"];
      if (typeof byId !== "undefined") {
        $("#window" + byId).removeClass("closed");
        $("#minimPanel" + byId).removeClass("closed");
      }

      setupInteractions();
      adjustFullScreenSize();

      // EVENTS
      $("#mSafrain").on("mousedown", ".window", function () {
        makeWindowActive($(this).attr("data-id"));
      });

            $("#mSafrain").on("click", ".winclose", function () {
        var id = $(this).closest(".window").attr("data-id");
        closeWindwow(id);
      });

      $("#mSafrain").on("click", ".winminimize", function () {
        var id = $(this).closest(".window").attr("data-id");
        minimizeWindow(id);
      });

      $("#mSafrain").on("click", ".taskbarPanel", function () {
        var id = $(this).attr("data-id");

        if ($(this).hasClass("activeTab")) {
          minimizeWindow(id);
        } else if ($(this).hasClass("minimizedTab")) {
          openMinimized(id);
        } else {
          makeWindowActive(id);
        }
      });

            // Launchbar buttons
      $(document).on("click", ".openWindow", function () {
        var key = $(this).attr("data-window-id");

        // Special handling: "mArchives" opens all archive windows
        if (key === "marchives") {
          [
            "mthoughts-archive",
            "mvisual-archive",
            "mobservation-archive",
            "mstratagems-archive",
            "mletters-archive",
          ].forEach(function (k) {
            var idArchive = keyToId[k];
            if (typeof idArchive !== "undefined" && idArchive !== null) {
              openWindow(idArchive);
            }
          });
          return; // done
        }

        var id = keyToId[key];
        if (typeof id === "undefined" || id === null) return;

        openWindow(id);

        if (window.innerWidth <= 768) {
          var $target = $("#window" + id);
          if ($target.length) {
            $("html, body").animate(
              { scrollTop: $target.offset().top - 80 },
              300
            );
          }
        }
      });

      // Desktop icons (mEnvelope etc.)
      $(document).on("click", ".desktop-icon", function () {
        var key = $(this).attr("data-window-id");
        var id = keyToId[key];
        if (typeof id === "undefined" || id === null) return;

        openWindow(id);

        if (window.innerWidth <= 768) {
          var $target = $("#window" + id);
          if ($target.length) {
            $("html, body").animate(
              { scrollTop: $target.offset().top - 80 },
              300
            );
          }
        }
      });

            $("#mSafrain").on("click", ".winmaximize", function () {
        var win = $(this).closest(".window");
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

/***************************
 * 2. BLOGGER FEED HELPERS *
 ***************************/
var BLOG_BASE = "https://msafrain.blogspot.com/feeds/posts/summary";

/**
 * Inject a JSONP script tag for Blogger.
 * label: string or null (for all posts)
 * maxResults: number or null
 * callbackName: global function name as string
 */
function bloggerJsonp(label, maxResults, callbackName) {
  var src = BLOG_BASE;
  if (label) {
    src += "/-/" + encodeURIComponent(label);
  }
  src += "?alt=json-in-script&callback=" + callbackName;
  if (maxResults) {
    src += "&max-results=" + maxResults;
  }

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

/******************************
 * 3. mThoughts – SINGLE/LIST *
 ******************************/
function load_mThoughts_single() {
  bloggerJsonp("mThoughts", 1, "handle_mThoughts_single");
}

function handle_mThoughts_single(json) {
  var el = document.getElementById("mThoughtsSingle");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No posts yet.";
    return;
  }

  var entry = json.feed.entry[0];
  var content = extractContent(entry);
  var dateStr = formatDate(entry);

  var html = "";
  if (dateStr) {
    html += '<div class="post-date">' + dateStr + "</div>";
  }
  html += content;

  el.innerHTML = html;
}

function load_mThoughts_recent() {
  bloggerJsonp("mThoughts", 6, "handle_mThoughts_recent");
}

function handle_mThoughts_recent(json) {
  var el = document.getElementById("mThoughtsRecent");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No recent mThoughts.";
    return;
  }

  var html = "";
  json.feed.entry.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);
    if (idx > 0) html += "<hr>";
    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:4px;">' + dateStr + "</div>";
    }
    html += content;
  });

  el.innerHTML = html;
}

function load_mThoughts_archive() {
  // bigger number for archive
  bloggerJsonp("mThoughts", 50, "handle_mThoughts_archive");
}

function handle_mThoughts_archive(json) {
  var el = document.getElementById("mThoughtsArchive");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No archives.";
    return;
  }

  var html = "";
  json.feed.entry.forEach(function (entry) {
    var title = entry.title && entry.title.$t ? entry.title.$t : "(untitled)";
    var dateStr = formatDate(entry);
    html += '<div class="archive-item">';
    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:2px;">' + dateStr + "</div>";
    }
    html += "<div>" + title + "</div>";
    html += "</div>";
  });

  el.innerHTML = html;
}

/*************************
 * 4. mVisual / others   *
 *************************/
function load_mVisual() {
  bloggerJsonp("mVisual", 6, "handle_mVisual");
}

ffunction handle_mVisual(json) {
  var el = document.getElementById("mVisualContent");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mVisual posts.";
    return;
  }

  var html = "";
  json.feed.entry.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);

    // Parse HTML to extract first image
    var temp = document.createElement("div");
    temp.innerHTML = content;
    var img = temp.querySelector("img");

    if (idx > 0) html += "<hr>";
    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:4px;">' + dateStr + "</div>";
    }

    if (img && img.src) {
      html +=
        '<div class="mvisual-item"><img src="' +
        img.src +
        '" alt=""></div>';
    } else {
      // Fallback: no image, show original content
      html += content;
    }
  });

  el.innerHTML = html;
}

function load_mVisual_archive() {
  bloggerJsonp("mVisual", 50, "handle_mVisual_archive");
}

function handle_mVisual_archive(json) {
  var el = document.getElementById("mVisualArchive");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No archives.";
    return;
  }

  var html = "";
  json.feed.entry.forEach(function (entry) {
    var title = entry.title && entry.title.$t ? entry.title.$t : "(untitled)";
    var dateStr = formatDate(entry);
    html += '<div class="archive-item">';
    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:2px;">' + dateStr + "</div>";
    }
    html += "<div>" + title + "</div>";
    html += "</div>";
  });

  el.innerHTML = html;
}

/**********************
 * 5. mObservation    *
 **********************/
function load_mObservation() {
  bloggerJsonp("mObservation", 6, "handle_mObservation");
}

function handle_mObservation(json) {
  var el = document.getElementById("mObservationContent");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mObservation posts.";
    return;
  }

  var html = "";
  json.feed.entry.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);
    if (idx > 0) html += "<hr>";
    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:4px;">' + dateStr + "</div>";
    }
    html += content;
  });

  el.innerHTML = html;
}

function load_mObservation_archive() {
  bloggerJsonp("mObservation", 50, "handle_mObservation_archive");
}

function handle_mObservation_archive(json) {
  var el = document.getElementById("mObservationArchiveContent");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No archives.";
    return;
  }

  var html = "";
  json.feed.entry.forEach(function (entry) {
    var title = entry.title && entry.title.$t ? entry.title.$t : "(untitled)";
    var dateStr = formatDate(entry);
    html += '<div class="archive-item">';
    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:2px;">' + dateStr + "</div>";
    }
    html += "<div>" + title + "</div>";
    html += "</div>";
  });

  el.innerHTML = html;
}

/*******************
 * 6. mStratagems  *
 *******************/
function load_mStratagems() {
  bloggerJsonp("mStratagems", 6, "handle_mStratagems");
}

function handle_mStratagems(json) {
  var el = document.getElementById("mStratagemsContent");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mStratagems posts.";
    return;
  }

  var html = "";
  json.feed.entry.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);
    if (idx > 0) html += "<hr>";
    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:4px;">' + dateStr + "</div>";
    }
    html += content;
  });

  el.innerHTML = html;
}

function load_mStratagems_archive() {
  bloggerJsonp("mStratagems", 50, "handle_mStratagems_archive");
}

function handle_mStratagems_archive(json) {
  var el = document.getElementById("mStratagemsArchiveContent");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No archives.";
    return;
  }

  var html = "";
  json.feed.entry.forEach(function (entry) {
    var title = entry.title && entry.title.$t ? entry.title.$t : "(untitled)";
    var dateStr = formatDate(entry);
    html += '<div class="archive-item">';
    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:2px;">' + dateStr + "</div>";
    }
    html += "<div>" + title + "</div>";
    html += "</div>";
  });

  el.innerHTML = html;
}

/**************
 * 7. mLetters *
 **************/
function load_mLetters() {
  // label assumed "mLetters"
  bloggerJsonp("mLetters", 6, "handle_mLetters");
}

function handle_mLetters(json) {
  var el = document.getElementById("mLettersContent");
  var badge = document.getElementById("envelope-badge");

  if (badge) {
    var count =
      json && json.feed && json.feed.entry ? json.feed.entry.length : 0;
    if (count > 6) count = 6;
    badge.textContent = count;
  }

  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No letters.";
    return;
  }

    var html = "";
  json.feed.entry.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);

    // Instead of a line, just add spacing between letters
    if (idx > 0) {
      html += '<div style="height:10px;"></div>';
    }

    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:4px;">' + dateStr + "</div>";
    }
    html += content;
  });

  el.innerHTML = html;
}

function load_mLetters_archive() {
  bloggerJsonp("mLetters", 50, "handle_mLetters_archive");
}

function handle_mLetters_archive(json) {
   var el = document.getElementById("mLettersArchive");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No letter archives.";
    return;
  }

  var html = "";
  json.feed.entry.forEach(function (entry) {
    var title = entry.title && entry.title.$t ? entry.title.$t : "(untitled)";
    var dateStr = formatDate(entry);
    html += '<div class="archive-item">';
    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:2px;">' + dateStr + "</div>";
    }
    html += "<div>" + title + "</div>";
    html += "</div>";
  });

  el.innerHTML = html;
}
