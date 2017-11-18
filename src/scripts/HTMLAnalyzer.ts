namespace HTMLAnalyzer {
	export function analyze(str: string) {
		let target:object = {};
		let temp:HTMLElement[] = $.parseHTML(str);
		target.meta = {};
		temp.forEach(function(elem:HTMLElement) {
			switch (elem.nodeName) {
				case "META":
					if (elem.hasAttribute("name") && elem.hasAttribute("content")) {
						target.meta[elem.getAttribute("name")] = elem.getAttribute("content");
					}
					break;
				case "TITLE":
					target.title = elem.innerHTML;
					break;
				default:
					return;
			}
		});
		target.links = extractLinks(temp, []);
		target.links.forEach(function(link) {
			console.log(link.href);
		})
		// sort links as internal, external, no-follow, and misc(mailto, skype, etc.)

		// get all images and alt attributes
		return target; // an object contain evaluation result
  }
  var extractLinks = function (nodeList:HTMLElement[], arr:HTMLElement[]) :HTMLElement[] {
    	for(var i = 0; i < nodeList.length; i++) {
    		var elem:HTMLElement = nodeList[i];
    		if(elem.nodeName == "A") {
    			arr.push(elem);
    		} else {
    			if(elem.childElementCount > 0) extractLinks(elem.children, arr);
    		}
    	}
    	return arr;
    }
}