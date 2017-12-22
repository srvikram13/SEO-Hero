# SEO-Hero
A Chrome extension for SEO Analysis and report generation


### To-do

- [x] Read the tab url
- [x] Load the HTML as text.
- [x] Sanitize HTML in popup.html
	- [x] remove comments
	- [x] remove script, style, link tags; 
	- [ ] remove "onclick", href attributes starting with "javascript:"
- [ ] Analysis this santized HTML and generate report.
- [x] Download as PDF


### Error

- broken links
	- [Check-My-Links](https://github.com/ocodia/Check-My-Links)
		- [More Info](https://moz.com/blog/check-my-links-chrome-extension-a-link-builders-dream)
	- [LinkChecker](https://github.com/WickyNilliams/LinkChecker)
- missing closing tags
- [x] missing H1 tag
- [x] missing meta tags
- [x] Redirects should be 301 not 302


### Warning

- [x] Page Title too long
	- Limit the page title to 60-65 characters and ensure it begins with a relevant keyword.
- [x] Desc too long
	- Limit the meta description to around 155 characters.
- Elements with content (not just markup) are hidden
- Empty header tags
- make sure the H1 tag shows up in the document before H2, H3 
- Image missing 'alt' attribute

### Info
- Chrome on Android and Safari on iOS home screen icons
- Favicon
- meta tags are in the right order: title, description, keywords
- Make sure you don’t have duplicate content
- Make JavaScript and CSS External
	You want to be sure the most important code is the first thing the search engine bots crawl. Work to ensure there aren’t unnecessary lines of code above the body text by externalizing JavaScript and CSS code that gets in the way of keyword-rich content.
- Hidden CSS or text?
	look for display:none

______________________

### Features

- Lambda syntax
- Scope and closures
- Santizer/Analyzer Singleton Classes (using TypeScript)
