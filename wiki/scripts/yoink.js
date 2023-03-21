//https://api.github.com/repos/Cryotheus/cryotheus.github.io/contents/wiki/pages/playing
//https://raw.githubusercontent.com/Cryotheus/cryotheus.github.io/main/wiki/pages/playing/1-Using%20Pyrition.md

const list_functions = {
	developer_reference: [
		parts => {
			return ["r" + parts[1], parts[2], parts[2]]
		},
	],

	developers: [parts => {
		return ["", parts[1], parts[1]]
	}],

	playing: [parts => {
		return ["", parts[1], parts[1]]
	}]
}

var current_request;
var pagecontent = document.getElementById("pagecontent")
var sidebarbutton = document.getElementById("sidebarbutton")
var yoink_sections = document.querySelectorAll("div[yoink-directory]")

window.Yoink = {
	load: function(url) {
		if (current_request !== undefined) {current_request.abort()}

		//bad idea...
		ToggleClass('sidebar', 'visible')

		var request = new XMLHttpRequest()
		current_request = request
		pagecontent.innerHTML = '<md-block>\n# Loading...\n</md-block>'

		//pagecontent.append()
		request.onabort = function() {current_request = undefined}
		request.onerror = function() {current_request = undefined}

		request.onreadystatechange = function() {
			current_request = undefined

			if (this.readyState == 4 && this.status == 200) {
				pagecontent.innerHTML = '<md-block>\n' + request.responseText + '\n</md-block>'

				console.log(pagecontent.getElementsByTagName("code"))

				Array.from(pagecontent.getElementsByTagName("code")).forEach(code => {
					//console.log(code)
					code.setAttribute("class", code.parentElement.getAttribute("class"))
				})
			}
		}

		request.open('GET', url, false)
		request.setRequestHeader('Accept', 'application/json')
		request.send(null)
	},

	get_pages: function(yoink_sections) {
		var request = new XMLHttpRequest()

		request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var directories = {}

				//create a directories object
				//CRLF and LF
				request.responseText.split(/\r?\n/).forEach(line => {
					var directory = line.match(/\/.*\//)
		
					if (directory !== null) {
						directory = directory[0].slice(1, -1)
		
						if (directories[directory] === undefined)
							directories[directory] = []
						
						directories[directory].push([line, line.substring(directory.length + 2)])
		
						console.log(directory)
					}
				})

				Object.keys(directories).forEach(directory => {
					const function_list = list_functions[directory]
					const ul_list = document.querySelectorAll('.section[yoink-directory="' + directory + '"] .level1 .yoink-pages')

					directories[directory].forEach(pair => {
						const file = pair[0]
						const file_name = pair[1]
						console.log(file, file_name)
						const name = file_name.slice(0, -3).replace("--", ";")
						const matches = [...name.matchAll("[^-]*")]
						const list_index = parseInt(matches[0])
						const func = function_list[list_index] === undefined ? function_list[0] : function_list[list_index]
						var parts = []
	
						matches.forEach((part, index) => {
							if (part[0])
								parts.push(part[0].replace(";", "-"))
						})
	
						const result = func(parts)
						const class_attribute = result[0]
						const display_text = result[1]
						const search_term = result[2]
	
						var li = document.createElement("li")
						var a = document.createElement("a")
						var a_text = document.createTextNode(display_text)
	
						a.setAttribute("class", class_attribute)
						a.setAttribute("onclick", "window.Yoink.load('pages" + file + "')")
						a.setAttribute("search", search_term)
						a.appendChild(a_text)
						li.appendChild(a)
						ul_list[list_index - 1].appendChild(li)
					});

					ul_list.forEach(ul => {
						console.log(ul, ul.getElementsByTagName("li").length)
						ul.parentElement.getElementsByClassName("child-count")[0].innerHTML = ul.getElementsByTagName("li").length.toString()
					})
				})
			}
		};
		
		request.open('GET', 'pages/sitemap.txt', false)
		request.setRequestHeader('Accept', 'application/json')
		request.send(null)
	}
}

document.querySelectorAll("div[yoink-directory]").forEach(section_div => {
	var yoink_directory = section_div.getAttribute("yoink-directory")

	yoink_sections[yoink_directory] = section_div
});

window.Yoink.get_pages(yoink_sections)