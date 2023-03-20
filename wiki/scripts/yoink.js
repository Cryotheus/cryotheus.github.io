import { Octokit } from "https://cdn.skypack.dev/@octokit/core";

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

	//yoink_pages(yoink_directory)
	for (let index = 1; index <= element.childElementCount; index++) {
		//https://api.github.com/repos/Cryotheus/cryotheus.github.io/contents/wiki/pages/playing/1
	}
});

const octokit = new Octokit({
	//auth: 'YOUR-TOKEN'
})
//Cryotheus/cryotheus.github.io
const result = await octokit.request('GET /repos/Cryotheus/cryotheus.github.io/contents/wiki/pages/developer_reference', {
	owner: 'Cryotheus',
	repo: 'cryotheus.github.io',
	path: 'wiki/pages/developer_reference',
	headers: {
		'X-GitHub-Api-Version': '2022-11-28'
	}
})

console.log(result)