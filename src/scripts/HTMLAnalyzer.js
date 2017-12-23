var HTMLAnalyzer;
(function (HTMLAnalyzer) {
    function analyze(str) {
        var target = {};
        var temp = $.parseHTML(str);
        target.meta = {};

        var tempDom = $('<output>').append($.parseHTML(str));

        target.emptyHeadingTags = [];
        target.emptyHeadingTags.push({"tag": "h2", "element": checkForEmptyTags("h2", tempDom)});
        target.emptyHeadingTags.push({"tag": "h3", "element": checkForEmptyTags("h3", tempDom)});
        target.emptyHeadingTags.push({"tag": "h4", "element": checkForEmptyTags("h4", tempDom)});
        target.emptyHeadingTags.push({"tag": "h5", "element": checkForEmptyTags("h5", tempDom)});
        target.emptyHeadingTags.push({"tag": "h6", "element": checkForEmptyTags("h6", tempDom)});
        

        /*================
            Can't check for favicon, icon, and apple icon as the link tag was discarded during sanitization
            <link rel="icon" sizes="192x192" href="nice-highres.png"> (recommended)
            <link rel="icon" sizes="128x128" href="niceicon.png">
            <link rel="apple-touch-icon" sizes="128x128" href="niceicon.png">
            <link rel="apple-touch-icon-precomposed" sizes="128x128" href="niceicon.png">
        *********************/

        var h1Tags = $('h1', tempDom);
        target.h1Count = h1Tags.length;
        target.h1First = true;
        var otherHeadingTag = false;
        var titleFound = descFound = keywordsFound = false;
        target.outOfOrder = false;
        temp.forEach(function (elem, i) {
            switch (elem.nodeName) {
                case "META":
                    if (elem.hasAttribute("name") && elem.hasAttribute("content")) {
                        target.meta[elem.getAttribute("name").toLowerCase()] = elem.getAttribute("content");
                    }
                    if(elem.hasAttribute("name") && elem.getAttribute("name").toUpperCase() === "DESCRIPTION") {
                        if(!titleFound || keywordsFound) {
                            target.outOfOrder = true;
                        }
                        descFound = true;
                    }
                    if(elem.hasAttribute("name") && elem.getAttribute("name").toUpperCase() === "KEYWORDS") {
                        if(!titleFound || !descFound) {
                            target.outOfOrder = true;
                        }
                        keywordsFound = true;
                    }

                    return;
                case "TITLE":
                    target.title = elem.innerHTML;
                    if(descFound || keywordsFound) {
                        target.outOfOrder = true;
                    }
                    titleFound = true;
                    return;
                case "LINK":
                    //console.log(elem);
                    return;
                case "H1":
                    target.h1First = !otherHeadingTag;
                    return
                case "H2":
                case "H3":
                case "H4":
                case "H5":
                case "H6":
                    if(h1Count > 0 && !target.h1First) otherHeadingTag = true;
                    return;
                default:
                    return;
            }
        });
        var pageLinks = extractTags(temp, "A", []);
        target.links = [];
        // sort links as internal, external, no-follow, and misc(mailto, skype, etc.)
        pageLinks.forEach(function (link) {
            if(link.href.indexOf("javascript:") == 0) {
                return;
            }
            var type = 'external';
            if(link.href.indexOf("chrome-extension://") == 0) {
                type = "internal";
            } else if(link.href.indexOf("http") != 0) {
                type = "misc";
            }
            target.links.push({"link": link.href, "type": type, "no-follow":link.hasAttribute("no-follow")});
        });
                
        // get all images and alt attributes
        var pageImages = extractTags(temp, "IMG", []);
        target.imagesWithoutAlt = [];
        pageImages.forEach(function(img){
            if(!img.alt) {
                target.imagesWithoutAlt.push(img);
            }
        });

        return target; // an object containing evaluation result
    }
    HTMLAnalyzer.analyze = analyze;
    var extractTags = function (nodeList, nodeName, arr) {
        for (var i = 0; i < nodeList.length; i++) {
            var elem = nodeList[i];
            if (elem.nodeName == nodeName) {
                arr.push(elem);
            }
            else {
                if (elem.childElementCount > 0)
                    extractTags(elem.children, nodeName, arr);
            }
        }
        return arr;
    };
    var checkForEmptyTags = function(tag, tempDom) {
        var allTags = $(tag, tempDom);
        var arrEmpty = [];
        allTags.each(function(elem){
            if(!$.trim($(this).html())){
                arrEmpty.push(this);
            }
        });
        return arrEmpty;
    };


})(HTMLAnalyzer || (HTMLAnalyzer = {}));
