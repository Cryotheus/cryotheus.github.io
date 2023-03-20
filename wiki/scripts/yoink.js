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

window.Yoink = {
	load: function(url) {
		if (current_request !== undefined) {current_request.abort()}

		var request = new XMLHttpRequest()
		current_request = request

		pagecontent.innerHTML = '<md-block># Loading...</md-block>'

		request.onabort = function() {current_request = undefined}
		request.onerror = function() {current_request = undefined}

		request.onreadystatechange = function() {
			current_request = undefined
			
			if (this.readyState == 4 && this.status == 200) {
				pagecontent.innerHTML = '<md-block>' + request.responseText + '</md-block>'
			}
		}
		
		request.open('GET', url, false)
		request.setRequestHeader('Accept', 'application/json')
		request.send(null)
	},

	get_pages: function(yoink_directory, section_div) {
		var request = new XMLHttpRequest()

		request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				const files = JSON.parse(request.responseText)
				const function_list = list_functions[yoink_directory]
				const ul = document.querySelectorAll('.section[yoink-directory="' + yoink_directory + '"] .level1 .yoink-pages')
				
				files.forEach(file => {
					const name = file.name.slice(0, -3).replace("--", ";")
					const raw_path = file.path
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
					a.setAttribute("onclick", "window.Yoink.load('https://raw.githubusercontent.com/Cryotheus/cryotheus.github.io/main/wiki/pages/" + yoink_directory + "/" + file.name + "')")
					a.setAttribute("search", search_term)
					a.appendChild(a_text)
					li.appendChild(a)
					ul[list_index - 1].appendChild(li)
				});
			}
		};
		
		request.open('GET', 'https://api.github.com/repos/Cryotheus/cryotheus.github.io/contents/wiki/pages/' + yoink_directory, false)
		request.setRequestHeader('Accept', 'application/json')
		request.send(null)
	}
}

document.querySelectorAll("div[yoink-directory]").forEach(section_div => {
	var yoink_directory = section_div.getAttribute("yoink-directory")

	window.Yoink.get_pages(yoink_directory, section_div)
});
