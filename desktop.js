      // Clicking items inside the mArchives window opens that archive
      $(document).on("click", "#mArchivesList .archive-item", function () {
        var key = $(this).attr("data-archive-target");
        if (typeof key === "string") key = key.trim();
        openWindowByKey(key);
      });

      // Desktop icons (mEnvelope etc.)
      $(document).on("click", ".desktop-icon", function () {
        var key = $(this).attr("data-window-id");
        openWindowByKey(key);
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

        // Initial Blogger feed loads (mMe + mThoughts)
        if (typeof load_mMe === "function") {
          load_mMe();
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

/********************************
 * 3. FEED LOADERS (MAIN + ARCH) *
 ********************************/

/* ===== mPoetry (label: mPoetry) ===== */
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
      html += '<div class="post-date">' + dateStr + "</div>";
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
      html += '<div class="post-date">' + dateStr + "</div>";
    }
    html += content;
  });

  el.innerHTML = html;
}

/* ===== mThoughts (label: mThoughts) ===== */
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
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
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
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
    html += content;
  });

  el.innerHTML = html;
}

/* ===== mChapters (label: mChapters) ===== */
function load_mChapters() {
  bloggerJsonp("mChapters", 6, "handle_mChapters");
}
function handle_mChapters(json) {
  var el = document.getElementById("mChaptersContent");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mChapters posts yet.";
    return;
  }

  var html = "";
  json.feed.entry.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);

    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
    html += content;
  });

  el.innerHTML = html;
}

function load_mChapters_archive() {
  bloggerJsonp("mChapters", 200, "handle_mChapters_archive");
}
function handle_mChapters_archive(json) {
  var el = document.getElementById("mChaptersArchive");
  if (!el) return;

  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mChapters Archives yet.";
    return;
  }

  var out = "<ul class=\"archive-list\">";
  json.feed.entry.forEach(function (entry) {
    var text = getTitleOrSnippet(entry);
    var safeText = escapeHtml(text);
    var link = "";
    if (entry.link) {
      entry.link.forEach(function (l) {
        if (l.rel === "alternate") link = l.href;
      });
    }
    out += "<li>";
    out += link ? "<a href=\"" + link + "\" target=\"_blank\">" + safeText + "</a>" : safeText;
    out += "</li>";
  });
  out += "</ul>";

  el.innerHTML = out;
}

/* ===== mKnowledge (label: mKnowledge) ===== */
function load_mKnowledge() {
  bloggerJsonp("mKnowledge", 6, "handle_mKnowledge");
}
function handle_mKnowledge(json) {
  var el = document.getElementById("mKnowledgeContent");
  if (!el) return;
  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mKnowledge posts yet.";
    return;
  }

  var html = "";
  json.feed.entry.forEach(function (entry, idx) {
    var content = extractContent(entry);
    var dateStr = formatDate(entry);

    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
    html += content;
  });

  el.innerHTML = html;
}

function load_mKnowledge_archive() {
  bloggerJsonp("mKnowledge", 200, "handle_mKnowledge_archive");
}
function handle_mKnowledge_archive(json) {
  var el = document.getElementById("mKnowledgeArchive");
  if (!el) return;

  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mKnowledge Archives yet.";
    return;
  }

  var out = "<ul class=\"archive-list\">";
  json.feed.entry.forEach(function (entry) {
    var text = getTitleOrSnippet(entry);
    var safeText = escapeHtml(text);
    var link = "";
    if (entry.link) {
      entry.link.forEach(function (l) {
        if (l.rel === "alternate") link = l.href;
      });
    }
    out += "<li>";
    out += link ? "<a href=\"" + link + "\" target=\"_blank\">" + safeText + "</a>" : safeText;
    out += "</li>";
  });
  out += "</ul>";

  el.innerHTML = out;
}

/* ===== mLetters (label: mLetters) ===== */
function load_mLetters() {
  bloggerJsonp("mLetters", 6, "handle_mLetters");
}
function handle_mLetters(json) {
  var el = document.getElementById("mLettersContent");
  var badge = document.getElementById("envelope-badge");

  if (badge) {
    var count = json && json.feed && json.feed.entry ? json.feed.entry.length : 0;
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

    if (idx > 0) html += '<div style="height:10px;"></div>';
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
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

    if (idx > 0) html += '<div style="height:10px;"></div>';
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
    html += content;
  });

  el.innerHTML = html;
}

/* ===== mBrush (label: mBrush) ===== */
function load_mBrush() {
  bloggerJsonp("mBrush", 6, "handle_mBrush");
}
function handle_mBrush(json) {
  var el = document.getElementById("mBrushContent");
  if (!el) return;

  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mBrush posts.";
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
    if (!altText && entry.title && entry.title.$t) altText = entry.title.$t.trim();
    if (!altText && imgs.length > 0) altText = (imgs[0].getAttribute("alt") || "").trim();

    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";

    if (imgs.length) {
      imgs.forEach(function (img) {
        var src = img.getAttribute("src") || img.getAttribute("data-src") || img.getAttribute("data-original") || "";
        html += '<div class="mvisual-item" data-alt="' + escapeHtml(altText) + '"><img src="' + src + '" alt=""></div>';
      });
    } else {
      html += content;
    }
  });

  el.innerHTML = html;
}

function load_mBrush_archive() {
  bloggerJsonp("mBrush", 50, "handle_mBrush_archive");
}
function handle_mBrush_archive(json) {
  var el = document.getElementById("mBrushArchive");
  if (!el) return;

  if (!json || !json.feed || !json.feed.entry || !json.feed.entry.length) {
    el.textContent = "No mBrush archives.";
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
    if (!altText && entry.title && entry.title.$t) altText = entry.title.$t.trim();
    if (!altText && imgs.length > 0) altText = (imgs[0].getAttribute("alt") || "").trim();

    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";

    if (imgs.length) {
      imgs.forEach(function (img) {
        var src = img.getAttribute("src") || img.getAttribute("data-src") || img.getAttribute("data-original") || "";
        html += '<div class="mvisual-item" data-alt="' + escapeHtml(altText) + '"><img src="' + src + '" alt=""></div>';
      });
    } else {
      html += content;
    }
  });

  el.innerHTML = html;
}

/* ===== mStory (label: mStory) ===== */
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

    var altText = temp.textContent.trim();
    if (!altText && entry.title && entry.title.$t) altText = entry.title.$t.trim();
    if (!altText && imgs.length > 0) altText = (imgs[0].getAttribute("alt") || "").trim();

    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";

    if (imgs.length) {
      imgs.forEach(function (img) {
        var src = img.getAttribute("src") || img.getAttribute("data-src") || img.getAttribute("data-original") || "";
        html += '<div class="mvisual-item" data-alt="' + escapeHtml(altText) + '"><img src="' + src + '" alt=""></div>';
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
    if (!altText && entry.title && entry.title.$t) altText = entry.title.$t.trim();
    if (!altText && imgs.length > 0) altText = (imgs[0].getAttribute("alt") || "").trim();

    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";

    if (imgs.length) {
      imgs.forEach(function (img) {
        var src = img.getAttribute("src") || img.getAttribute("data-src") || img.getAttribute("data-original") || "";
        html += '<div class="mvisual-item" data-alt="' + escapeHtml(altText) + '"><img src="' + src + '" alt=""></div>';
      });
    } else {
      html += content;
    }
  });

  el.innerHTML = html;
}

/* ===== mVisual (label: mVisual) ===== */
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

    var altText = temp.textContent.trim();
    if (!altText && entry.title && entry.title.$t) altText = entry.title.$t.trim();
    if (!altText && imgs.length > 0) altText = (imgs[0].getAttribute("alt") || "").trim();

    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";

    if (imgs.length) {
      imgs.forEach(function (img) {
        var src = img.getAttribute("src") || img.getAttribute("data-src") || img.getAttribute("data-original") || "";
        html += '<div class="mvisual-item" data-alt="' + escapeHtml(altText) + '"><img src="' + src + '" alt=""></div>';
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
    if (!altText && entry.title && entry.title.$t) altText = entry.title.$t.trim();
    if (!altText && imgs.length > 0) altText = (imgs[0].getAttribute("alt") || "").trim();

    if (idx > 0) html += "<hr>";
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";

    if (imgs.length) {
      imgs.forEach(function (img) {
        var src = img.getAttribute("src") || img.getAttribute("data-src") || img.getAttribute("data-original") || "";
        html += '<div class="mvisual-item" data-alt="' + escapeHtml(altText) + '"><img src="' + src + '" alt=""></div>';
      });
    } else {
      html += content;
    }
  });

  el.innerHTML = html;
}

/* ===== mStratagems (label: mStratagems) ===== */
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
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
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
    if (dateStr) html += '<div class="post-date">' + dateStr + "</div>";
    html += content;
  });

  el.innerHTML = html;
}
