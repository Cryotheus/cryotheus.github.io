//querySelectorAll(selectors)
function yoink_pages(yoink_directory) {
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			const object = JSON.parse(request.responseText);
			console.log(request.responseText);
		}
	};
	
	request.open('GET', 'https://github.com/Cryotheus/cryotheus.github.io/tree/main/wiki/pages/' + yoink_directory, false);
	request.setRequestHeader('Accept', 'application/json');
	request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	request.setRequestHeader('X-GitHub-Target', 'dotcom');
	request.send(null);
}

document.querySelectorAll("div[yoink-directory]").forEach(element => {
	var yoink_directory = element.getAttribute("yoink-directory");

	yoink_pages(yoink_directory)
});