var Sanitizer;
(function (Sanitizer) {
    function sanitize(str) {
        var sanitizedHTML = stripTags(stripTags(stripTags(stripComments(str), 'script'), 'style'), 'link');
        return sanitizedHTML;
    }
    Sanitizer.sanitize = sanitize;
    // Inspired from this answer on Stack Overflow: https://stackoverflow.com/a/18665056
    var stripTags = function (str, tag) {
        var html = $(str.bold());
        html.find(tag).remove();
        switch (tag) {
            case 'script': return removeInlineScripts(html.html().replace(/<script[^>]*>.*?<\/script>/gi, ''));
            case 'style': return html.html().replace(/<style[^>]*>.*?<\/style>/gi, '');
            case 'link': return html.html().replace(/<link[^>]*>.*?<\/link>/gi, '');
        }
        return html.html();
    };
    var removeInlineScripts = function (str) {
        var elements = $.parseHTML(str);
        var scriptFree = '';
        elements.forEach(function (elem) {
            if (elem.onclick) {
                $(elem).removeAttr("onclick");
            }
            if (elem.nodeType === 1 && elem.hasAttribute("href") && elem.getAttribute("href").indexOf("javascript") != -1) {
                elem.removeAttribute("href");
            }
            scriptFree += elem.outerHTML ? elem.outerHTML : "";
        });
        return scriptFree;
    };
    var stripComments = function (str) {
        if (str.indexOf("<!--") == -1)
            return str;
        return stripComments(str.substring(0, str.indexOf("<!--")) + str.substring(str.indexOf("-->") + 3, str.length));
    };
})(Sanitizer || (Sanitizer = {}));