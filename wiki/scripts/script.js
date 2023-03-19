var Decorator;
var Edit;
var EditDisplay;
var MaxResultCount = 200;
var Preview;
var ResultCount = 0;
var SearchDelay = null;
var SearchInput;
var SearchResults;
var SectionHeader;
var SidebarContents;
var TitleCount = 0;
var Titles = [];
var WikiRealm = "";

class Parser {
	constructor(rules) {
		this.parseRE = null;
		this.ruleMap = {};
		this.ruleSrc = [];

		this.add(rules);
	}

	add(rules) {
		for (var rule in rules) {
			var s = rules[rule].source;

			this.ruleSrc.push(s);
			this.ruleMap[rule] = new RegExp('^(' + s + ')$', "i");
		}

		this.parseRE = new RegExp(this.ruleSrc.join('|'), 'gmi');
	}

	identify(token) {
		for (var rule in this.ruleMap)
			if (this.ruleMap[rule].test(token))
				return rule;
	}

	tokenize(input) {return input.match(this.parseRE);}
}

class TextareaDecorator {
	constructor(textarea, display, parser) {
		this.input = textarea;
		this.output = display;
		this.parser = parser;
	}

	color(input, output, parser) {
		var firstDiff, lastDiffNew, lastDiffOld;
		var newTokens = parser.tokenize(input);
		var oldTokens = output.childNodes;

		for (firstDiff = 0; firstDiff < newTokens.length && firstDiff < oldTokens.length; firstDiff++)
			if (newTokens[firstDiff] !== oldTokens[firstDiff].textContent)
				break;
		
		while (newTokens.length < oldTokens.length)
			output.removeChild(oldTokens[firstDiff]);
		
		for (lastDiffNew = newTokens.length - 1, lastDiffOld = oldTokens.length - 1; firstDiff < lastDiffOld; lastDiffNew--, lastDiffOld--)
			if (newTokens[lastDiffNew] !== oldTokens[lastDiffOld].textContent)
				break;
		
		for (; firstDiff <= lastDiffOld; firstDiff++) {
			oldTokens[firstDiff].className = parser.identify(newTokens[firstDiff]);
			oldTokens[firstDiff].textContent = oldTokens[firstDiff].innerText = newTokens[firstDiff];
		}

		for (var insertionPt = oldTokens[firstDiff] || null; firstDiff <= lastDiffNew; firstDiff++) {
			var span = document.createElement("span");
			span.className = parser.identify(newTokens[firstDiff]);
			span.textContent = span.innerText = newTokens[firstDiff];
			output.insertBefore(span, insertionPt);
		}
	}
	update() {
		var input = textarea.value;
		if (input) {
			this.color(input, this.output, this.parser);
		}
		else {
			this.output.innerHTML = '';
		}
	}
}

function ToggleClass(element, classname) {
	var e = document.getElementById(element);
	if (e.classList.contains(classname))
		e.classList.remove(classname);
	else
		e.classList.add(classname);
}

function InitSearch() {
	SearchInput = document.getElementById("search");
	SearchResults = document.getElementById("searchresults");
	SidebarContents = document.getElementById("contents");
	SearchInput.addEventListener("input", e => {
		clearTimeout(SearchDelay);
		SearchDelay = setTimeout(UpdateSearch, 200);
	});
	SearchInput.addEventListener("keyup", e => {
		if (e.keyCode == 13) {
			window.location.href = "/" + WikiRealm + "/~search:" + SearchInput.value;
		}
	});
}

window.addEventListener('keydown', (e) => {
	if (e.keyCode != 191)
		return;
	if (document.activeElement.tagName == "INPUT")
		return;
	if (document.activeElement.tagName == "TEXTAREA")
		return;
	SearchInput.focus();
	SearchInput.value = "";
	e.preventDefault();
});

function UpdateSearch(limitResults = true) {
	if (limitResults)
		MaxResultCount = 100;
	else
		MaxResultCount = 2000;
	var child = SearchResults.lastElementChild;
	while (child) {
		SearchResults.removeChild(child);
		child = SearchResults.lastElementChild;
	}
	var string = SearchInput.value;
	var tags = [];
	var searchTerms = string.split(" ");
	searchTerms.forEach(str => {
		if (str.startsWith("is:") || str.startsWith("not:")) {
			tags.push(str);
			string = string.replace(str, "");
		}
	});
	if (string.length < 2) {
		SidebarContents.classList.remove("searching");
		SearchResults.classList.remove("searching");
		var sidebar = document.getElementById("sidebar");
		var active = sidebar.getElementsByClassName("active");
		if (active.length == 1) {
			active[0].scrollIntoView({ block: "center" });
		}
		return;
	}
	SidebarContents.classList.add("searching");
	SearchResults.classList.add("searching");
	ResultCount = 0;
	Titles = [];
	TitleCount = 0;
	SectionHeader = null;
	if (string.toUpperCase() == string && string.indexOf("_") != -1) {
		string = string.substring(0, string.indexOf("_"));
	}
	var parts = string.split(' ');
	var q = "";
	for (var i in parts) {
		if (parts[i].length < 1)
			continue;
		var t = parts[i].replace(/([^a-zA-Z0-9_-])/g, "\\$1");
		q += ".*(" + t + ")";
	}
	q += ".*";
	var regex = new RegExp(q, 'gi');
	SearchRecursive(regex, SidebarContents, tags);
	if (limitResults && ResultCount > MaxResultCount) {
		var moreresults = document.createElement('a');
		moreresults.href = "#";
		moreresults.classList.add('noresults');
		moreresults.innerHTML = (ResultCount - 100) + ' more results - show more?';
		moreresults.onclick = (e) => { UpdateSearch(false); return false; };
		SearchResults.append(moreresults);
	}
	if (SearchResults.children.length == 0) {
		var noresults = document.createElement('span');
		noresults.classList.add('noresults');
		noresults.innerText = 'no results';
		SearchResults.appendChild(noresults);
	}
}

function SearchRecursive(str, el, tags) {
	var title = null;
	if (el.children.length > 0 && el.children[0].tagName == "SUMMARY") {
		title = el.children[0].children[0];
		Titles.push(title);
		TitleCount++;
	}
	var children = el.children;
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (child.className == "sectionheader")
			SectionHeader = child;
		if (child.tagName == "A") {
			if (child.parentElement.tagName == "SUMMARY")
				continue;
			var txt = child.getAttribute("search");
			if (txt != null) {
				var found = txt.match(str);
				if (found && tags.length > 0) {
					var tagClasses = { "is:server": "rs", "is:sv": "rs", "is:client": "rc", "is:cl": "rc", "is:menu": "rm", "is:mn": "rm" };
					var tagNotClasses = { "not:server": "rs", "not:sv": "rs", "not:client": "rc", "not:cl": "rc", "not:menu": "rm", "not:mn": "rm" };
					tags.forEach(str => {
						if (tagClasses[str] != null && !child.classList.contains(tagClasses[str])) {
							found = null;
						}
						if (tagNotClasses[str] != null && child.classList.contains(tagNotClasses[str])) {
							found = null;
						}
						if (str == "is:global" && child.getAttribute("href").indexOf("Global.") == -1) {
							found = null;
						}
						if (str == "is:enum" && child.getAttribute("href").indexOf("Enums/") == -1) {
							found = null;
						}
						if (str == "is:struct" && child.getAttribute("href").indexOf("Structures/") == -1) {
							found = null;
						}
					});
				}
				if (found) {
					if (ResultCount < MaxResultCount) {
						AddSearchTitle();
						var copy = child.cloneNode(true);
						copy.onclick = e => Navigate.ToPage(copy.href, true);
						copy.classList.add("node" + TitleCount);
						SearchResults.appendChild(copy);
					}
					ResultCount++;
				}
			}
		}
		SearchRecursive(str, child, tags);
	}
	if (title != null) {
		TitleCount--;
		if (Titles[Titles.length - 1] == title) {
			Titles.pop();
		}
	}
}
function AddSearchTitle() {
	if (Titles.length == 0)
		return;
	if (SectionHeader != null) {
		var copy = SectionHeader.cloneNode(true);
		SearchResults.appendChild(copy);
		SectionHeader = null;
	}
	for (var i = 0; i < Titles.length; i++) {
		var cpy = Titles[i].cloneNode(true);
		if (cpy.href)
			cpy.onclick = e => Navigate.ToPage(cpy.href, true);
		cpy.className = "node" + ((TitleCount - Titles.length) + i);
		SearchResults.appendChild(cpy);
	}
	Titles = [];
}
