let current_request
let hook_uls = {}
let page = new URLSearchParams(document.location.search).get("page")
let pagecontent = document.getElementById("pagecontent")
let sidebarbutton = document.getElementById("sidebarbutton")

const realm_classes = {
	"cl": "rc ",
	"sh": "rs rc ",
	"sv": "rs "
}

function simple_entry(ul, parts) {
	let li = document.createElement("li")
	let a = document.createElement("a")
	a.innerText = parts[1]

	//a.setAttribute("class", class_parts + " e")
	a.setAttribute("search", parts[1])
	li.appendChild(a)
	ul.appendChild(li)

	return a
}

const list_functions = {
	developer_reference: [
		(ul, parts) => {
			let class_parts = "cm "
			class_parts += parts[0] == 5 ? "rc " : realm_classes[parts[1]]

			let li = document.createElement("li")
			let a = document.createElement("a")
			a.innerText = parts[2]

			a.setAttribute("class", class_parts + " e")
			a.setAttribute("search", parts[2])
			li.appendChild(a)
			ul.appendChild(li)

			return a
		},

		undefined,
		undefined,
		undefined,

		(ul, parts) => {
			//let layer_index = parts[0]
			let hook_table_name = parts[2]
			let hook_method = parts[3]
			let realm_class = realm_classes[parts[1]]
			let hook_ul = hook_uls[hook_table_name]

			if (hook_ul === undefined) {
				let hook_li = document.createElement("li")
				let hook_details = document.createElement("details")
				let hook_summary = document.createElement("summary")
				let hook_summary_a = document.createElement("a")
				hook_summary_a.innerText = hook_table_name
				hook_ul = document.createElement("ul")

				hook_details.setAttribute("class", "level2 cm type")

				hook_summary_a.setAttribute("class", "cm type")
				hook_summary_a.setAttribute("search", hook_table_name)

				hook_li.appendChild(hook_details)
				hook_details.appendChild(hook_summary)
				hook_summary.appendChild(hook_summary_a)
				
				hook_details.appendChild(hook_ul)
				ul.appendChild(hook_li)

				hook_uls[hook_table_name] = hook_ul
			}

			let li = document.createElement("li")
			let a = document.createElement("a")
			a.innerText = hook_method

			a.setAttribute("class", "cm event member " + realm_class + "e")
			a.setAttribute("search", hook_table_name + ":" + hook_method)
			li.appendChild(a)
			hook_ul.appendChild(li)

			return a
		}
	],

	developers: [simple_entry],
	playing: [simple_entry]
}

window.Yoink = {
	load: function(url) {
		if (current_request) {current_request.abort()}

		//bad idea...
		ToggleClass('sidebar', 'visible')

		let request = new XMLHttpRequest()
		current_request = request
		pagecontent.innerHTML = '<md-block>\n# Loading...\n</md-block>'

		//pagecontent.append()
		request.onabort = function() {current_request = false}
		request.onerror = function() {current_request = false}

		request.onreadystatechange = async function() {
			current_request = false

			if (this.readyState == 4) {
				pagecontent.innerHTML = ''

				let md_block = document.createElement("md-block")
				pagecontent.appendChild(md_block)

				if (this.status == 200) {
					md_block.mdContent = request.responseText
	
					await md_block.render()
	
					Array.from(pagecontent.getElementsByTagName("code")).forEach(code => {
						let parent = code.parentElement
						let parent_class = parent.getAttribute("class")
						
						code.setAttribute("class", parent_class === "language-" ? "language-lua" : parent_class)
						parent.removeAttribute("class")
					})
	
					hljs.highlightAll()
				} else {
					md_block.mdContent = "# Oops!\nMarkdown failed to load; details follow below.  \n" + request.responseText

					await md_block.render()
				}
			}
		}

		request.open('GET', url, false)
		request.setRequestHeader('Accept', 'application/json')
		request.send(null)
	},

	get_pages: function() {
		let request = new XMLHttpRequest()

		request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let directories = {}

				//create a directories object
				//CRLF and LF
				request.responseText.split(/\r?\n/).forEach(line => {
					let directory = line.match(/\/.*\//)
		
					if (directory !== null) {
						directory = directory[0].slice(1, -1)
		
						if (directories[directory] === undefined)
							directories[directory] = []
						
						directories[directory].push([line, line.substring(directory.length + 2)])
					}
				})

				Object.keys(directories).forEach(directory => {
					const function_list = list_functions[directory]
					let individual = {}
					let tree = {}
					const ul_list = document.querySelectorAll('.section[yoink-directory="' + directory + '"] .level1 .yoink-pages')

					/*
					directories[directory].forEach(pair => {
						const file = pair[0]
						const file_name = pair[1]
						const name = file_name.slice(0, -3).replace("--", ";")
						const matches = [...name.matchAll("[^-]*")]
						const list_index = parseInt(matches[0])
						const func = function_list[list_index] === undefined ? function_list[0] : function_list[list_index]
						let parts = []
	
						matches.forEach((part, index) => {
							if (part[0])
								parts.push(part[0].replace(";", "-"))
						})
	
						const result = func(parts)
						const class_attribute = result[0]
						const display_text = result[1]
						const search_term = result[2]
	
						let li = document.createElement("li")
						let a = document.createElement("a")
						let a_text = document.createTextNode(display_text)
	
						a.setAttribute("class", class_attribute)
						a.setAttribute("onclick", "window.Yoink.load('pages" + file + "')")
						a.setAttribute("search", search_term)
						a.appendChild(a_text)
						li.appendChild(a)
						ul_list[list_index - 1].appendChild(li)
					});*/

					directories[directory].forEach(([file, file_name]) => {
						
						const matches = [...file_name.replace(/\.[^/.]+$/, "").replace("--", ";").matchAll("[^-]*")]
						const list_index = parseInt(matches[0])
						const func = function_list[list_index] === undefined ? function_list[0] : function_list[list_index]
						let parts = []

						//create escaped dashes
						matches.forEach(part => {
							if (part[0])
								parts.push(part[0].replace(";", "-"))
						})
	
						func(ul_list[list_index - 1], parts).setAttribute("onclick", "window.Yoink.load('pages" + file + "')")
					})

					//update list counts
					ul_list.forEach(ul => {ul.parentElement.getElementsByClassName("child-count")[0].innerHTML = ul.getElementsByTagName("li").length.toString()})
				})
			}
		};
		
		request.open('GET', 'pages/sitemap.txt', false)
		request.setRequestHeader('Accept', 'application/json')
		request.send(null)
	}
}

window.Yoink.get_pages()

if (page) {Yoink.load("pages" + page)}