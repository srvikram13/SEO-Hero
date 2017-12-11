namespace HTMLAnalyzer {
	export function analyze(str: string) {

		interface Rubric {
			title:String;
		    meta:Object;
		    h1Count:Number;
		    links:Object[];
		    imagesWithoutAlt:HTMLElement[];
		}
		let target:Rubric;
        let temp:HTMLElement[] = $.parseHTML(str);
        target.meta = {};

        var tempDom = $('<output>').append($.parseHTML(str));
        var h1Tags = $('h1', tempDom);

        target.h1Count = h1Tags.length;

        temp.forEach(function (elem:HTMLElement) {
            switch (elem.nodeName) {
                case "META":
                    if (elem.hasAttribute("name") && elem.hasAttribute("content")) {
                        target.meta[elem.getAttribute("name").toLowerCase()] = elem.getAttribute("content");
                    }
                    return;
                case "TITLE":
                    target.title = elem.innerHTML;
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
}