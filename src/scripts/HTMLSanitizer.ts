namespace Sanitizer { 
	export function sanitize(str: string): string {
		let sanitizedHTML:string = stripTags(stripTags(stripTags(stripComments(str), 'script'), 'style'), 'link');
		return sanitizedHTML;
	}
	// Inspired from this answer on Stack Overflow: https://stackoverflow.com/a/18665056
	var stripTags = function(str, tag){ 
		var html = $(str.bold()); 
		html.find(tag).remove();
		switch(tag) {
			case 'script': return removeInlineScripts(html.html().replace(/<script[^>]*>.*?<\/script>/gi,''));
			case 'style': return html.html().replace(/<style[^>]*>.*?<\/style>/gi,'');
			case 'link': return html.html().replace(/<link[^>]*>.*?<\/link>/gi,'');
		}
		return html.html();
	}
	var removeInlineScripts = function(str: string): string {
		var elements: HTMLElement[] = $.parseHTML(str);
		var scriptFree = '';
		elements.forEach(function(elem: HTMLElement) {
			if (elem.hasAttribute("onclick")) {
				elem.removeAttribute("onclick");
			}
			if (elem.hasAttribute("href") && elem.getAttribute("href").indexOf("javascript") != -1) {
				elem.removeAttribute("href");
			}

			scriptFree += elem.outerHTML;
		})
		return scriptFree;
	}
	var stripComments = function (str) {
		if(str.indexOf("<!--") == -1) return str;
		return stripComments(str.substring(0, str.indexOf("<!--")) + str.substring(str.indexOf("-->") + 3, str.length));
	}
}