namespace HTMLAnalyzer {
    export function analyze(str: string) {

        interface Rubric {
            title:string;
            meta:object;
            h1Count: number;
            h1First: boolean
            links: object[];
            outOfOrder: boolean;
            imagesWithoutAlt:HTMLElement[];
            emptyHeadingTags:object[];
        }
        let target:Rubric;
        let temp:HTMLElement[] = $.parseHTML(str);
        target.meta = {};

        let tempDom:HTMLDocument = $('<output>').append($.parseHTML(str));
        let h1Tags:HTMLElement[] = $('h1', tempDom);

        target.emptyHeadingTags = [];
        
        target.emptyHeadingTags.push({"tag": "h2", "element": checkForEmptyTags("h2", tempDom)});
        target.emptyHeadingTags.push({"tag": "h3", "element": checkForEmptyTags("h3", tempDom)});
        target.emptyHeadingTags.push({"tag": "h4", "element": checkForEmptyTags("h4", tempDom)});
        target.emptyHeadingTags.push({"tag": "h5", "element": checkForEmptyTags("h5", tempDom)});
        target.emptyHeadingTags.push({"tag": "h6", "element": checkForEmptyTags("h6", tempDom) });

        
        target.h1Count = h1Tags.length;
        target.h1First = true;
        let otherHeadingTag = false;
        let titleFound: boolean = false;
        let descFound: boolean = false;
        let keywordsFound: boolean = false;
        target.outOfOrder = false;

        temp.forEach(function (elem:HTMLElement) {
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
        let pageLinks:HTMLElement[] = extractTags(temp, "A", []);
        target.links = [];
        // sort links as internal, external, no-follow, and misc(mailto, skype, etc.)
        pageLinks.forEach(function (link:HTMLAnchorElement) {
            if(link.href.indexOf("javascript:") == 0) {
                return;
            }
            let type = 'external';
            if(link.href.indexOf("chrome-extension://") == 0) {
                type = "internal";
            } else if(link.href.indexOf("http") != 0) {
                type = "misc";
            }
            target.links.push({"link": link.href, "type": type, "no-follow":link.hasAttribute("no-follow")});
        });
                
        // get all images and alt attributes
        var pageImages:HTMLElement[] = extractTags(temp, "IMG", []);
        target.imagesWithoutAlt = [];
        pageImages.forEach(function(img:HTMLImageElement){
            if(!img.alt) {
                target.imagesWithoutAlt.push(img);
            }
        });

        return target; // an object contain evaluation result
    }
    
  var extractTags = function (nodeList:HTMLElement[], nodeName:String, arr:HTMLElement[]):HTMLElement[] {
        for (let i:number = 0; i < nodeList.length; i++) {
            let elem:HTMLElement = nodeList[i];
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
    var checkForEmptyTags = function(tag:string, tempDom:HTMLDocument): HTMLElement[] {
        var allTags:HTMLElement[] = $(tag, tempDom);
        var arrEmpty:HTMLElement[] = [];
        allTags.each(function(elem:HTMLElement){
            if(!$.trim($(this).html())){
                arrEmpty.push(this);
            }
        });
        return arrEmpty;
    };
}