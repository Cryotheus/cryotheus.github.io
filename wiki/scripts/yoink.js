let current_request
let page = new URLSearchParams(document.location.search).get("page")
let pagecontent = document.getElementById("pagecontent")
let pagefooter = document.getElementById("pagefooter")
let sidebarbutton = document.getElementById("sidebarbutton")

function create_function_links_button(md_block, text, href, mdi_icon) {
	let a = document.createElement("a")
	a.innerText = text

	if (href) {
		a.setAttribute("class", "fl-button")
		a.setAttribute("href", href)
	} else {a.setAttribute("class", "fl-info")}

	if (mdi_icon) { //create a span if we have a material design icon
		let span = document.createElement("span")
		span.setAttribute("class", "iconify")
		span.setAttribute("data-icon", mdi_icon)

		a.insertBefore(span, a.firstChild)
	}

	md_block.getElementsByClassName

	//attempt to find the existing links bar
	let div = md_block.getElementsByClassName("function_links")[0]

	if (!div) { //or create it if it doesn't exist
		div = document.createElement("div")
		
		div.setAttribute("class", "function_links")
		md_block.insertBefore(div, md_block.firstChild)
	}

	div.appendChild(a)

	return a
}

function decode_indicative_case(text) {
	let called = true
	let new_text = text

	while (called) {
		called = false
		new_text = new_text.replace(/\^./, (match) => {
			called = true

			return match[1].toUpperCase()
		})
	}

	return new_text
}

function strip_extension(file_name) {return file_name.replace(/\.[^/.]+$/, "")}

let tag_classes = {
	c: "rc",
	d: "depr",
	i: "intrn",
	s: "rs",
}

let tag_functions = {
	OWNER: (md_block, value) => create_function_links_button(md_block, "Owner: " + value, false, "mdi:book"),
	SOURCE: (md_block, value) => create_function_links_button(md_block, "View Source", value, "mdi:source-branch")
}

let the_wiki = {
	developer_reference: [],
	developers: [],
	playing: [],
}

/*
	<!--META!\s*([^]*)-->

	section
	project
	category index
	(optional) parents

	into

	section
	category index
	parents =

	file name
	display name
	search term
	class attributes
*/

window.Yoink = {
	load: function(url) {
		if (current_request) {current_request.abort()}

		//bad idea...
		ToggleClass('sidebar', 'visible')

		let request = new XMLHttpRequest()
		current_request = request
		pagecontent.innerHTML = '<md-block>\n# Loading...\n</md-block>'
		pagefooter.innerText = 'Loading...'
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
					let metadata
					let meta_list
					let response = request.responseText

					pagefooter.innerText = 'Loaded ' + response.length + ' bytes of documentation.'

					response.replace(/<!--META!\s*([^]*)-->/, (match, capture) => {
						metadata = {}
						meta_list = []

						capture.split(/\r?\n/).forEach(line => {
							let [_, key, value] = line.match(/([^:]+):\s*(.*)/)
							metadata[key] = value
							meta_list.push(key)
						})

						return ""
					})

					md_block.mdContent = response

					await md_block.render()

					Array.from(pagecontent.getElementsByTagName("code")).forEach(code => {
						let parent = code.parentElement
						let parent_class = parent.getAttribute("class")

						code.setAttribute("class", parent_class === "language-" ? "language-lua" : parent_class)
						parent.removeAttribute("class")
					})

					if (metadata) {
						meta_list.forEach(key => {
							let tag_function = tag_functions[key]

							console.log(key, tag_function, metadata[key])

							if (tag_function)
								tag_function(md_block, metadata[key])
						})
					}

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
				//parse the sitemap.txt file to build the_wiki
				request.responseText.split(/\r?\n/).forEach(line => {
					line = line.substring(1)

					if (line != "sitemap.txt") {
						let [section, project, category, ...parents] = decode_indicative_case(line).split(/\//)

						if (category) {
							let category_index = parseInt(category) - 1
							let index_me = the_wiki[section][category_index]
							let name = strip_extension(parents.pop())
							let tag
							let tags

							//tags
							if (name.includes("-")) {
								let reparent
								tags = ["cm"];
								[tag, name, ...reparent] = name.split("-")

								if (reparent)
									reparent.forEach(parent => name = name + "-" + parent)

								tag.split("").forEach(tag => tags.push(tag_classes[tag]))

								tags = tags.join(" ")
							}

							//create the table
							if (!index_me)
								index_me = the_wiki[section][category_index] = {}

							if (parents) {
								parents.forEach(parent => {
									let next_index_me = index_me[parent]

									if (!next_index_me)
										index_me[parent] = {___children: true}
										index_me = index_me[parent]
								})
							}

							let page = {
								___display: name,
								___file: line,
								___project: project,
								___search: name,
								___tags: tags,
							}

							//merge or create
							if (index_me[name]) {
								index_me[name] = {
									...index_me[name],
									...page
								}
							} else {index_me[name] = page}
						}
					}
				})

				Object.entries(the_wiki).forEach(([directory, categories]) => {
					let section_uls = document.querySelectorAll('.section[yoink-directory="' + directory + '"] .level1 .yoink-pages')

					let iterate_categories = (ul, category, count) => {
						let key_list = []

						Object.entries(category).forEach(([key]) => {
							if (!key.startsWith("___"))
								key_list.push(key)
						})

						key_list.sort()

						key_list.forEach(key => {
							let a = document.createElement("a")
							let li = document.createElement("li")
							let page_data = category[key]
							let tags = page_data.___tags

							if (tags)
								a.setAttribute("class", tags)

							if (page_data.___file) {
								count++

								a.setAttribute("onclick", "window.Yoink.load('pages/" + page_data.___file + "')")
								a.setAttribute("project", page_data.___project)
								a.setAttribute("search", page_data.___search)
							} else {a.setAttribute("search", key)}

							ul.appendChild(li)

							a.innerText = key

							if (page_data.___children) {
								let details = document.createElement("details")
								let summary = document.createElement("summary")
								let sub_ul = document.createElement("ul")

								details.setAttribute("class", "level2 cm")

								summary.appendChild(a)

								details.appendChild(summary)
								details.appendChild(sub_ul)
								li.appendChild(details)

								count = iterate_categories(sub_ul, page_data, count)
							} else {li.appendChild(a)}
						})

						return count
					}

					categories.forEach((category, index) => {
						let section_ul = section_uls[index]
						let count = iterate_categories(section_ul, category, 0)

						section_ul.parentElement.getElementsByClassName("child-count")[0].innerHTML = count.toString()
					})
				})
			}
		}

		request.open('GET', 'pages/sitemap.txt', false)
		request.setRequestHeader('Accept', 'application/json')
		request.send(null)
	}
}

window.Yoink.get_pages()

if (page) {Yoink.load("pages" + page)}