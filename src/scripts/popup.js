// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, (tabs) => {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

  /**
 * Change the background color of the current page.
 *
 * @param {string} color The new background color.
 */
function changeBackgroundColor(color) {
  var script = 'document.body.style.backgroundColor="' + color + '";';
  // See https://developer.chrome.com/extensions/tabs#method-executeScript.
  // chrome.tabs.executeScript allows us to programmatically inject JavaScript
  // into a page. Since we omit the optional first argument "tabId", the script
  // is inserted into the active tab of the current window, which serves as the
  // default.
  chrome.tabs.executeScript({
    code: script
  });
}

/**
 * Gets the saved background color for url.
 *
 * @param {string} url URL whose background color is to be retrieved.
 * @param {function(string)} callback called with the saved background color for
 *     the given url on success, or a falsy value if no color is retrieved.
 */
function getSavedBackgroundColor(url, callback) {
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
  // for chrome.runtime.lastError to ensure correctness even when the API call
  // fails.
  chrome.storage.sync.get(url, (items) => {
    callback(chrome.runtime.lastError ? null : items[url]);
  });
}

/**
 * Sets the given background color for url.
 *
 * @param {string} url URL for which background color is to be saved.
 * @param {string} color The background color to be saved.
 */
function saveBackgroundColor(url, color) {
  var items = {};
  items[url] = color;
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We omit the
  // optional callback since we don't need to perform any action once the
  // background color is saved.
  chrome.storage.sync.set(items);
}

// This extension loads the saved background color for the current tab if one
// exists. The user can select a new background color from the dropdown for the
// current page, and it will be saved as part of the extension's isolated
// storage. The chrome.storage API is used for this purpose. This is different
// from the window.localStorage API, which is synchronous and stores data bound
// to a document's origin. Also, using chrome.storage.sync instead of
// chrome.storage.local allows the extension data to be synced across multiple
// user devices.
var temp;
document.addEventListener('DOMContentLoaded', () => {
  $(".btn-type").click(function(){
    $(".btn-type").removeClass("active");
    $(this).addClass("active");
    var tab = $(this).data("tab");  
    $(".tab:not(#"+tab+")").fadeOut('fast', function(){
      setTimeout(function(){$("#"+tab).fadeIn('fast');}, 300)
    });
  })
  var tab = $(".btn-type.active").data("tab");  
  $("#"+tab).fadeIn('fast');

  $("details").click(function(){
    if($(this).get(0).hasAttribute("open")) {

    } else {
      $("details").removeAttr("open");
    }
  });
  $("#btn-download").click(function(){
    var pdf = new jsPDF();
    pdf.addHTML(document.body,function() {
        pdf.save('SEOHero-report.pdf');
    });  
  })

  $("#btn-refresh").click(function(){
    loadPage(currentTabUrl);
  })
  $("#btn-search").click(function(){
    var newUrl = $.trim($("#search-container input").val()).replace("http://", "").replace("https://", "");
    if(newUrl.length > 5) {
      newUrl = $.trim($("#search-container input").val());
      if(newUrl.indexOf("http://") == -1) newUrl = "http://"+newUrl;
      loadPage(newUrl);
    } else {
      alert("Enter valid URL.");
      $("#search-container input").val('')
    }
  })
  var currentTabUrl = '';
  getCurrentTabUrl((url) => {
    //console.log(url);
    currentTabUrl = url;
    //return;
    loadPage(url);
    var dropdown = document.getElementById('dropdown');

    // Load the saved background color for this page and modify the dropdown
    // value, if needed.
    getSavedBackgroundColor(url, (savedColor) => {
      if (savedColor) {
        changeBackgroundColor(savedColor);
        dropdown.value = savedColor;
      }
    });

    // Ensure the background color is changed and saved when the dropdown
    // selection changes.
    dropdown.addEventListener('change', () => {
      changeBackgroundColor(dropdown.value);
      saveBackgroundColor(url, dropdown.value);
    });
  });
});

function loadPage(url) {
  console.log(url);
  $("#progressbar").css("width", "0%");
  let respCode;
  $.ajax({
    xhr: function() {
      var xhr = new window.XMLHttpRequest();
      xhr.addEventListener("progress", function(evt) {
        var len = parseInt($("#progressbar").css("width"));
        len += 10;
        len = Math.max(len, 100);
        $("#progressbar").css("width", len+"%");
        if (evt.lengthComputable) {
          var percentComplete = evt.loaded / evt.total;
          //console.log(percentComplete);
        }
      }, false);
      return xhr;
    },
    url: url,
    type: "GET",
    dataType: "text",
    error: (args) => { console.log("error:", args);},
    complete: function(xhr, textStatus) {
        $("#response-code").html(xhr.status);
    } 
  }).done((data) => {
    var sanitized = Sanitizer.sanitize(data);
    var report = HTMLAnalyzer.analyze(sanitized);
    var link = document.createElement('a');
    //  set href to any path
    link.setAttribute('href', url);
    var origin = link.origin;
    report.links.forEach((elem) => {
      if(elem.link.indexOf("chrome-extension") == 0) {
        if(elem.link.indexOf("/popup.html") != -1) {
          var temp = elem.link.split("popup.html");
          temp[0] = origin;
          elem.link = temp.join("");
        } else {
          var temp = elem.link.split("/");
          temp.shift();
          temp.shift();
          temp[0] = origin;
          elem.link = temp.join("/");
        }
      } 
    })
    
    if(!report.title || report.title == "undefined") {
      $("#title").html("<span style='font-style:italic'>Title Missing</span>").attr("class", "error-text");
      $("#meta-container").html('<details open>\
                <summary>Title</summary>\
                <p id="page-title" class="value error-text"><span style="font-style:italic">Title Missing</span></p>\
              </details>')
    } else {
      $("#title").html(report.title).attr("class", "info-text");

      $("#meta-container").html('<details open>\
                <summary>Title</summary>\
                <p id="page-title" class="value info-text">'+report.title+'</p>\
              </details>')
    }
    for(var tag in report.meta) {
      $("#meta-container").append('<details>\
              <summary>'+tag+'</summary>\
              <p id="page-'+tag+'" class="value">'+report.meta[tag]+'</p>\
            </details>')
    }
    /*
      \item{Presence of exactly one \codeword{H1} tag}
      \item{Missing meta tags like \codeword{description}, \codeword{keywords}, etc.}
      \item{Presence of broken links}
      \item{Page Redirect, if any, should be HTTP status 301 (Server-side redirect)}
      \item{Missing closing tags}
      \item{\codeword{img} tags with empty or missing \codeword{alt} attribute}
      \item{Empty tags in the document}
      \item{\codeword{description} or \codeword{title} too long/short}
    */
    var errors = [], warnings = [], recomm = [];
    if(!report.title) {
      errors.push("<code>title</code> tag is missing.");
    } else if(report.title.length < 50 || report.title.length > 70) {
      warnings.push("It is advisable to keep the <code>title</code> tag length between 50 and 70 characters.")
    }
    console.log(report)
    if(report.h1Count < 1) {
      errors.push("<code>H1</code> tag is missing.");
    } else if(report.h1Count > 1) {
      warnings.push("More than one <code>H1</code> tag is not encouraged.");
    }
    if(!report.meta.description) {
      errors.push("<code>description</code> meta tag is missing");
    } else if (report.meta.description.length < 70 || report.meta.description.length > 155) {
      warnings.push("It is advisable to keep the <code>description</code> meta tag length between 70 and 155 characters.");
    }

    if(report.imagesWithoutAlt && report.imagesWithoutAlt.length) {
      warnings.push("There are "+report.imagesWithoutAlt.length+" <code>img</code> elements without an <code>alt</code> attribute.")
    }

    if($("#response-code").html() != "200" && $("#response-code").html() != "301") {
      if($("#response-code").html() == "302") {
        errors.push("There exists a client-side redirect. Consider changing it to a server-side redirect.")
      }
    }

    if(!report.h1First) {
      warnings.push("Semantically, <code>H1</code> should appear before other heading tags.");
    }

    report.emptyHeadingTags.forEach((elem,index) => {
      if(elem.element.length > 0)
        errors.push("Found "+elem.element.length+" empty <code>"+elem.tag+"</code> tags. Empty heading tags are discouraged.");  
    });
    
    if(report.outOfOrder) {
      recomm.push("<code>title</code>, <code>description</code>, and <code>keywords</code> meta tags should appear in that order.")
    }

    let nofollow = report.links.reduce((total, elem) => { return elem["no-follow"] ? (total + 1) : total}, 0);
    $("#count-no-follow").html(nofollow);
    
    let internal = report.links.reduce((total, elem) => { return elem.type == "internal" ? (total + 1) : total}, 0);
    $("#count-internal").html(internal);

    let external = report.links.reduce((total, elem) => { return elem.type == "external" ? (total + 1) : total}, 0);
    $("#count-external").html(external);

    var links = [];
    report.links.forEach((link) => { 
      if(link.link) {
        var a = document.createElement('a');
        var linkText = document.createTextNode("test");
        a.appendChild(linkText);
        a.href = link.link;
        links.push(a);
      }
    });
    //console.log(links);
    render(errors, warnings, recomm);

    var events = LinkChecker.events;
    var processor = new LinkChecker.LinkProcessor(links, origin);

    processor.on(events.started, startedEvent);
    processor.on(events.checked, checkedEvent);
    processor.on(events.completed, completedEvent);
    
    processor.go();



    function startedEvent(total) {
      //console.log("started", total)
    }
    function checkedEvent(link) {
      //console.log("checked", link)
    }
    function completedEvent() {
      var broken = links.filter((elem) => { return elem.broken == false;}).length;
      //console.log(broken)
      //console.log(links.filter((elem) => { return elem.broken == false;}).length, links.length);
      $("#broken-links-count").html(broken);
      if(broken > 0) {
        errors.push("There are "+broken+" broken links on page.");
        $("#broken-links-count").parent().css("color", "rgb(255, 82, 82)");
      } else {
        $("#broken-links-count").parent().css("color", "rgb(96, 196, 150)");
      }
      render(errors, warnings, recomm);
    }
  })
}

function render(errors, warnings, recomm) {
  $("#page-errors").html("<ul></ul>");
  $("#error-count").html(errors.length);
  $("#warning-count").html(warnings.length);
  $("#recomm-count").html(recomm.length);
  errors.forEach((item) => {
    $("#page-errors ul").append("<li class='report report-error'>"+item+"</li>");
  })
  warnings.forEach((item) => {
    $("#page-errors ul").append("<li class='report report-warning'>"+item+"</li>");
  })
  recomm.forEach((item) => {
    $("#page-errors ul").append("<li class='report report-recomm'>"+item+"</li>");
  })
  if(errors.length > 3) {
    $("#score i").html("sentiment_very_dissatisfied");
  } else if(errors.length > 0 && errors.length <= 2 && warnings.length > 0) {
    $("#score i").html("sentiment_dissatisfied");
  } else if(errors.length == 0 && warnings.length > 2) {
    $("#score i").html("sentiment_neutral");
  } else if(errors.length == 0 && warnings.length <= 2 && recomm.length >= 0) {
    $("#score i").html("sentiment_satisfied");
  } else if(errors.length == 0 && warnings.length == 0 && recomm.length == 0) {
    $("#score i").html("sentiment_very_satisfied");
  }
}