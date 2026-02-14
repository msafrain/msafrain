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
        $(".top-dropdown").removeClass("open");
        
        if (typeof thisid === "undefined" || thisid === null) return;

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
        if (typeof id === "undefined" || id === null) return;

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

      function openMinimized(id) {
        if (typeof id === "undefined" || id === null) return;

        $("#window" + id).removeClass("minimizedWindow");
        $("#minimPanel" + id).removeClass("minimizedTab");
        makeWindowActive(id);

        $("#window" + id).animate(
          { top: windowTopPos[id], left: windowLeftPos[id] },
          200
        );
      }

      function openWindow(id) {
        if (typeof id === "undefined" || id === null) return;

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
            $("html, body").animate(
              { scrollTop: $target.offset().top - 80 },
              300
            );
          }
        }
      }

      function closeWindow(id) {
        if (typeof id === "undefined" || id === null) return;

        $("#window" + id).addClass("closed");
        $("#minimPanel" + id).addClass("closed");
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

      /// INITIALISE WINDOWS
$("#mSafrain .window").each(function () {
  var $win = $(this);
  var key = $win.attr("data-window-id") || "window-" + i;

  var title =
    $win.attr("data-title") ||
    $win.find(".windowTitle").text().trim() ||
    key;

  // preset base positions for main windows
  var presetPositions = {
    bysafrain: { top: 160, left: 60 },
    mpoetry:   { top: 210, left: 380 },
    mthoughts: { top: 140, left: 700 }
  };

  var baseTop, baseLeft;

  if (presetPositions[key]) {
    baseTop  = presetPositions[key].top;
    baseLeft = presetPositions[key].left;
  } else {
    baseTop  = parseInt($win.css("top"), 10)  || 140;
    baseLeft = parseInt($win.css("left"), 10) || 140;
  }

  // small random jitter for messy aesthetic (BUT no tilt)
  var randTop  = baseTop  + Math.floor(Math.random() * 40) - 20;
  var randLeft = baseLeft + Math.floor(Math.random() * 60) - 30;

  $win.css({
    top: randTop + "px",
    left: randLeft + "px",
    transform: "none"          // make sure there is ZERO rotation
  });

  $win.css("z-index", 1000);
  $win.attr("data-id", i);

  minimizedWidth[i]  = $win.width();
  minimizedHeight[i] = $win.height();
  windowTopPos[i]    = $win.css("top");
  windowLeftPos[i]   = $win.css("left");

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

// Ensure all windows start correctly
var defaultKey = "bysafrain";
var defaultId = keyToId[defaultKey];

if (typeof defaultId === "undefined") {
  // fallback: take first non-closed window
  for (var k in keyToId) {
    if (!$("#window" + keyToId[k]).hasClass("closed")) {
      defaultId = keyToId[k];
      break;
    }
  }
}

setupInteractions();
adjustFullScreenSize();
      
      // EVENTS
      $("#mSafrain").on("mousedown", ".window", function () {
        makeWindowActive($(this).attr("data-id"));
      });

      $("#mSafrain").on("click", ".winclose", function () {
        var id = $(this).closest(".window").attr("data-id");
        closeWindow(id);
      });

      $("#mSafrain").on("click", ".winminimize", function () {
        var id = $(this).closest(".window").attr("data-id");
        minimizeWindow(id);
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

            // Launchbar buttons (top buttons)
      $(document).on("click", ".openWindow", function () {
        var key = $(this).attr("data-window-id");
        var id = keyToId[key];
        if (typeof id === "undefined") return;
        openWindow(id);
      });

                       // Clicking items inside the mArchives window opens that archive
     $(document).on("click", "#mArchivesList li", function () {
  var key = $(this).attr("data-archive-target");
  var id = keyToId[key];
  if (typeof id === "undefined") return;
  openWindow(id);
});

      // Desktop icons (mEnvelope etc.)
      $(document).on("click", ".desktop-icon", function () {
        var key = $(this).attr("data-window-id");
        var id = keyToId[key];
        openWindow(id);
      });

            // mVisual: click image to show alt-text popup

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

      /* ============================
       * TOP MENU DROPDOWNS (mMind / mBody)
       * ============================ */
            $(document).on("click", ".topMenuButton", function (e) {
        e.stopPropagation();

        var menuId = $(this).attr("data-menu-id");
        if (!menuId) return;

        var $btn  = $(this);
        var $menu = $("#" + menuId);
        if (!$menu.length) return;

        // Position dropdown horizontally under the clicked button
        var btnOffset = $btn.offset();
        var left = btnOffset.left - $(window).scrollLeft(); // viewport-based

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

        // Initial Blogger feed loads (mPoetry + mThoughts)
        if (typeof load_mPoetry === "function") {
          load_mPoetry();
        }
        if (typeof load_mThoughts === "function") {
          load_mThoughts();
        }
      });
  } // end initDesktopUI

  function waitForjQuery() {
    if (window.jQuery && typeof window.jQuery === "function") {
      initDesktopUI(window.jQuery);
    } else {
      setTimeout(waitForjQuery, 100);
    }
  }

  waitForjQuery();
})(); // end IIFE

/***************************
 * 2. BLOGGER FEED HELPERS *
 ***************************/
var BLOG_BASE = "https://msafrain.blogspot.com/feeds/posts/default";
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

// Use title if available, otherwise first 80 chars of content
function getTitleOrSnippet(entry) {
  var title =
    entry && entry.title && entry.title.$t
      ? entry.title.$t.trim()
      : "";

  if (title) return title;

  var content = stripHtml(extractContent(entry));
  if (!content) return "(untitled)";
  if (content.length <= 80) return content;
  return content.substring(0, 80) + "...";
}


/******************************
 *  NEW: mPoetry – LIST & ARCHIVE
 ******************************/
function load_mPoetry() {
  bloggerJsonp("mPoetry", 6, "handle_mPoetry");
}

function handle_mPoetry(json) {
  var el = document.getElementById("mPoetryContent");
  if (!el) return;

  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mPoetry posts yet.";
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

function load_mPoetry_archive() {
  bloggerJsonp("mPoetry", 50, "handle_mPoetry_archive");
}

function handle_mPoetry_archive(json) {
  var el = document.getElementById("mPoetryArchive");
  if (!el) return;

  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mPoetry archives.";
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

* 3. mThoughts – LIST        *
 ******************************/
function load_mThoughts() {
  bloggerJsonp("mThoughts", 6, "handle_mThoughts");
}

function handle_mThoughts(json) {
  var el = document.getElementById("mThoughts");
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
  bloggerJsonp("mThoughts", 50, "handle_mThoughts_archive");
}

function handle_mThoughts_archive(json) {
  var el = document.getElementById("mThoughtsArchive");
  if (!el) return;

  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mThoughts archives.";
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

/**************
 * 7. mLetters *
 **************/

function load_mChapters() {
  var blogUrl = "https://msafrain.blogspot.com/feeds/posts/default";
  var max = 6;
  var url = blogUrl + "?alt=json&max-results=" + max + "&orderby=published&label=mChapters";

  $.getJSON(url, function (data) {
    if (!data.feed || !data.feed.entry) {
      $("#mChaptersContent").html("<p>No mChapters yet.</p>");
      return;
    }

    var output = "";
    data.feed.entry.forEach(function (entry) {
      var title = entry.title ? entry.title.$t : "";
      var content = entry.content ? entry.content.$t : "";
      var link = "";
      if (entry.link) {
        entry.link.forEach(function (l) {
          if (l.rel === "alternate") link = l.href;
        });
      }

      output += '<div class="blog-post">';
      output += "<h3>" + title + "</h3>";
      output += '<div class="blog-content">' + content + "</div>";
      if (link) output += '<div class="blog-link"><a href="' + link + '" target="_blank">Open</a></div>';
      output += "</div>";
    });

    $("#mChaptersContent").html(output);
  }).fail(function () {
    $("#mChaptersContent").html("<p>Failed to load mChapters.</p>");
  });
}

function load_mChapters_archive() {
  var blogUrl = "https://msafrain.blogspot.com/feeds/posts/default";
  var max = 200;
  var url = blogUrl + "?alt=json&max-results=" + max + "&orderby=published&label=mChapters";

  $.getJSON(url, function (data) {
    if (!data.feed || !data.feed.entry) {
      $("#mChaptersArchive").html("<p>No mChapters Archives yet.</p>");
      return;
    }

    var items = [];
    data.feed.entry.forEach(function (entry) {
      var title = entry.title ? entry.title.$t : "";
      var published = entry.published ? entry.published.$t : "";
      var link = "";
      if (entry.link) {
        entry.link.forEach(function (l) {
          if (l.rel === "alternate") link = l.href;
        });
      }
      items.push({ title: title, published: published, link: link });
    });

    var out = "<ul class='archive-list'>";
    items.forEach(function (it) {
      out += "<li>";
      if (it.link) out += "<a href='" + it.link + "' target='_blank'>" + it.title + "</a>";
      else out += it.title;
      out += "</li>";
    });
    out += "</ul>";

    $("#mChaptersArchive").html(out);
  }).fail(function () {
    $("#mChaptersArchive").html("<p>Failed to load mChapters Archives.</p>");
  });
}


function load_mKnowledge() {
  var blogUrl = "https://msafrain.blogspot.com/feeds/posts/default";
  var max = 6;
  var url = blogUrl + "?alt=json&max-results=" + max + "&orderby=published&label=mKnowledge";

  $.getJSON(url, function (data) {
    if (!data.feed || !data.feed.entry) {
      $("#mKnowledgeContent").html("<p>No mKnowledge yet.</p>");
      return;
    }

    var output = "";
    data.feed.entry.forEach(function (entry) {
      var title = entry.title ? entry.title.$t : "";
      var content = entry.content ? entry.content.$t : "";
      var link = "";
      if (entry.link) {
        entry.link.forEach(function (l) {
          if (l.rel === "alternate") link = l.href;
        });
      }

      output += '<div class="blog-post">';
      output += "<h3>" + title + "</h3>";
      output += '<div class="blog-content">' + content + "</div>";
      if (link) output += '<div class="blog-link"><a href="' + link + '" target="_blank">Open</a></div>';
      output += "</div>";
    });

    $("#mKnowledgeContent").html(output);
  }).fail(function () {
    $("#mKnowledgeContent").html("<p>Failed to load mKnowledge.</p>");
  });
}

function load_mKnowledge_archive() {
  var blogUrl = "https://msafrain.blogspot.com/feeds/posts/default";
  var max = 200;
  var url = blogUrl + "?alt=json&max-results=" + max + "&orderby=published&label=mKnowledge";

  $.getJSON(url, function (data) {
    if (!data.feed || !data.feed.entry) {
      $("#mKnowledgeArchiveContent").html("<p>No mKnowledge Archives yet.</p>");
      return;
    }

    var items = [];
    data.feed.entry.forEach(function (entry) {
      var title = entry.title ? entry.title.$t : "";
      var published = entry.published ? entry.published.$t : "";
      var link = "";
      if (entry.link) {
        entry.link.forEach(function (l) {
          if (l.rel === "alternate") link = l.href;
        });
      }
      items.push({ title: title, published: published, link: link });
    });

    var out = "<ul class='archive-list'>";
    items.forEach(function (it) {
      out += "<li>";
      if (it.link) out += "<a href='" + it.link + "' target='_blank'>" + it.title + "</a>";
      else out += it.title;
      out += "</li>";
    });
    out += "</ul>";

    $("#mKnowledgeArchiveContent").html(out);
  }).fail(function () {
    $("#mKnowledgeArchiveContent").html("<p>Failed to load mKnowledge Archives.</p>");
  });
}

function load_mLetters() {
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

    // spacing only, no lines
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
  json.feed.entry.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);

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

/*****************
 * 8. mArt       *
 *****************/
function load_mBrush() {
  bloggerJsonp("mArt", 6, "handle_mArt");
}

function handle_mArt(json) {
  var el = document.getElementById("mArtContent");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mArt posts.";
    return;
  }

  var html = "";
  json.feed.entry.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);

    var temp = document.createElement("div");
    temp.innerHTML = content;
    var imgs = temp.querySelectorAll("img");

    // 1) try body text
    var altText = temp.textContent.trim();

    // 2) if empty, try post title
    if (!altText && entry.title && entry.title.$t) {
      altText = entry.title.$t.trim();
    }

    // 3) if still empty, try first image alt attribute
    if (!altText && imgs.length > 0) {
      var imgAlt = imgs[0].getAttribute("alt") || "";
      altText = imgAlt.trim();
    }

    if (idx > 0) html += "<hr>";
    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:4px;">' + dateStr + "</div>";
    }

    if (imgs.length) {
      imgs.forEach(function (img) {
        var src =
          img.getAttribute("src") ||
          img.getAttribute("data-src") ||
          img.getAttribute("data-original") ||
          "";

        html +=
          '<div class="mvisual-item" data-alt="' +
          escapeHtml(altText) +
          '"><img src="' +
          src +
          '" alt=""></div>';
      });
    } else {
      // fallback if no images
      html += content;
    }
  });

  el.innerHTML = html;
}

function load_mBrush_archive() {
  bloggerJsonp("mArt", 50, "handle_mArt_archive");
}

function handle_mArt_archive(json) {
  var el = document.getElementById("mArtArchive");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mArt archives.";
    return;
  }

  var html = "";
  json.feed.entry.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);

    var temp = document.createElement("div");
    temp.innerHTML = content;
    var imgs = temp.querySelectorAll("img");

    var altText = temp.textContent.trim();
    if (!altText && entry.title && entry.title.$t) {
      altText = entry.title.$t.trim();
    }
    if (!altText && imgs.length > 0) {
      var imgAlt = imgs[0].getAttribute("alt") || "";
      altText = imgAlt.trim();
    }

    if (idx > 0) html += "<hr>";
    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:4px;">' + dateStr + "</div>";
    }

    if (imgs.length) {
      imgs.forEach(function (img) {
        var src =
          img.getAttribute("src") ||
          img.getAttribute("data-src") ||
          img.getAttribute("data-original") ||
          "";

        html +=
          '<div class="mvisual-item" data-alt="' +
          escapeHtml(altText) +
          '"><img src="' +
          src +
          '" alt=""></div>';
      });
    } else {
      html += content;
    }
  });

  el.innerHTML = html;
}

/*****************
 * 9. mStory     *
 *****************/
function load_mStory() {
  bloggerJsonp("mStory", 6, "handle_mStory");
}

function handle_mStory(json) {
  var el = document.getElementById("mStoryContent");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mStory posts.";
    return;
  }

  var html = "";
  json.feed.entry.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);

    var temp = document.createElement("div");
    temp.innerHTML = content;
    var imgs = temp.querySelectorAll("img");

    // 1) body text
    var altText = temp.textContent.trim();

    // 2) if empty, use title
    if (!altText && entry.title && entry.title.$t) {
      altText = entry.title.$t.trim();
    }

    // 3) if still empty, first image alt
    if (!altText && imgs.length > 0) {
      var imgAlt = imgs[0].getAttribute("alt") || "";
      altText = imgAlt.trim();
    }

    if (idx > 0) html += "<hr>";
    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:4px;">' + dateStr + "</div>";
    }

    if (imgs.length) {
      imgs.forEach(function (img) {
        var src =
          img.getAttribute("src") ||
          img.getAttribute("data-src") ||
          img.getAttribute("data-original") ||
          "";

        html +=
          '<div class="mvisual-item" data-alt="' +
          escapeHtml(altText) +
          '"><img src="' +
          src +
          '" alt=""></div>';
      });
    } else {
      html += content;
    }
  });

  el.innerHTML = html;
}

function load_mStory_archive() {
  bloggerJsonp("mStory", 50, "handle_mStory_archive");
}

function handle_mStory_archive(json) {
  var el = document.getElementById("mStoryArchive");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mStory archives.";
    return;
  }

  var html = "";
  json.feed.entry.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);

    var temp = document.createElement("div");
    temp.innerHTML = content;
    var imgs = temp.querySelectorAll("img");

    var altText = temp.textContent.trim();
    if (!altText && entry.title && entry.title.$t) {
      altText = entry.title.$t.trim();
    }
    if (!altText && imgs.length > 0) {
      var imgAlt = imgs[0].getAttribute("alt") || "";
      altText = imgAlt.trim();
    }

    if (idx > 0) html += "<hr>";
    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:4px;">' + dateStr + "</div>";
    }

    if (imgs.length) {
      imgs.forEach(function (img) {
        var src =
          img.getAttribute("src") ||
          img.getAttribute("data-src") ||
          img.getAttribute("data-original") ||
          "";

        html +=
          '<div class="mvisual-item" data-alt="' +
          escapeHtml(altText) +
          '"><img src="' +
          src +
          '" alt=""></div>';
      });
    } else {
      html += content;
    }
  });

  el.innerHTML = html;
}

/*************************
 * 4. mVisual             *
 *************************/
function load_mVisual() {
  bloggerJsonp("mVisual", 6, "handle_mVisual");
}

function handle_mVisual(json) {
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

    var temp = document.createElement("div");
temp.innerHTML = content;
var imgs = temp.querySelectorAll("img");

// 1) try body text
var altText = temp.textContent.trim();

// 2) if empty, try post title
if (!altText && entry.title && entry.title.$t) {
  altText = entry.title.$t.trim();
}

// 3) if still empty, try first image alt attribute
if (!altText && imgs.length > 0) {
  var imgAlt = imgs[0].getAttribute("alt") || "";
  altText = imgAlt.trim();
}

    if (idx > 0) html += "<hr>";
    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:4px;">' + dateStr + "</div>";
    }

    if (imgs.length) {
      imgs.forEach(function (img) {
  var src =
    img.getAttribute("src") ||
    img.getAttribute("data-src") ||
    img.getAttribute("data-original") ||
    "";

  html +=
    '<div class="mvisual-item" data-alt="' +
    escapeHtml(altText) +
    '"><img src="' +
    src +
    '" alt=""></div>';
});
    } else {
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
  json.feed.entry.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);

var temp = document.createElement("div");
temp.innerHTML = content;
var imgs = temp.querySelectorAll("img");
var altText = temp.textContent.trim();

// 1) try body text
// 2) if empty, try post title
if (!altText && entry.title && entry.title.$t) {
  altText = entry.title.$t.trim();
}

// 3) if still empty, try first image alt attribute
if (!altText && imgs.length > 0) {
  var imgAlt = imgs[0].getAttribute("alt") || "";
  altText = imgAlt.trim();
}

    if (idx > 0) html += "<hr>";
    if (dateStr) {
      html += '<div style="font-size:11px;margin-bottom:4px;">' + dateStr + "</div>";
    }

    if (imgs.length) {
      imgs.forEach(function (img) {
  var src =
    img.getAttribute("src") ||
    img.getAttribute("data-src") ||
    img.getAttribute("data-original") ||
    "";

  html +=
    '<div class="mvisual-item" data-alt="' +
    escapeHtml(altText) +
    '"><img src="' +
    src +
    '" alt=""></div>';
});
    } else {
      html += content;
    }
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

/**********************
 * 5. mObservation    *
 **********************/

function handle_mObservation_archive(json) {
  var el = document.getElementById("mObservationArchiveContent");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No archives.";
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

