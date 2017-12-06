var HTMLAnalyzer;
(function (HTMLAnalyzer) {
    function analyze(str) {
        var target = {};
        var temp = $.parseHTML(str);
        target.meta = {};
        temp.forEach(function (elem) {
            switch (elem.nodeName) {
                case "META":
                    if (elem.hasAttribute("name") && elem.hasAttribute("content")) {
                        target.meta[elem.getAttribute("name").toLowerCase()] = elem.getAttribute("content");
                    }
                    break;
                case "TITLE":
                    target.title = elem.innerHTML;
                    break;
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

        //  TODO: Check for missing opening or closing tag
        //  TODO: Check for broken links
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
})(HTMLAnalyzer || (HTMLAnalyzer = {}));
