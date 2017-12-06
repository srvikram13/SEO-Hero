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
- missing H1 tag
- missing meta tags
- Redirects should be 301 not 302


### Warning

- Page Title too long
- Desc too long
- Elements with content (not just markup) are hidden
- Empty header tags

### Info
- Chrome on Android and Safari on iOS home screen icons
- Favicon



### Sort
- Image missing 'alt' attribute
- Try to get your primary keyword into your page URL
- meta tags are in the right order: title, description, keywords
- Add your keyword to your title tag. Is your title tag compelling?
	Limit the page title to 60-65 characters and ensure it begins with a relevant keyword.
- Add your keyword to your meta description. Is your meta description compelling?
	Limit the meta description to around 155 characters.
- Add your keyword to your H1 tag. Make sure to only use one H1 tag, and make sure it shows up in the document before H2, H3 etc.
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
