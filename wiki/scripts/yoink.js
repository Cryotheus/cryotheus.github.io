function yoink_pages() {
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			const object = JSON.parse(request.responseText);
			
		}
	};
	
	request.open('GET', 'https://github.com/Cryotheus/cryotheus.github.io/tree/main/wiki/pages', false);
	request.setRequestHeader('Accept', 'application/json');
	request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	request.setRequestHeader('X-GitHub-Target', 'dotcom');
	request.send(null);
}