
/**
 * https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 * @param name
 * @param url
 * @returns {*}
 */
function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function fromTemplate(templateSelector, data) {
	let template = document.querySelector(templateSelector).innerHTML;
	let populate = eval(`\n (data) => { try { return \` ${template} \`; }  catch(e) { console.log(\`TEMPLATE FAILED: ${templateSelector} \` , e); return ""; } }\n `);
	return populate(data);
}

function sourceMissing() {
	document.getElementsByTagName("body")[0].innerHTML = "expects URL parameter url<br>e.g. http://..../?url=https://raw.githubusercontent.com/afakes/resume/master/resume.json";
}

function localAsTemplate(templateID = "#body", dataSourceURL = null) {

	dataSourceURL = (dataSourceURL == null) ? getParameterByName('data') : dataSourceURL;
	if (dataSourceURL == null) { sourceMissing(); return; }

	fetch(dataSourceURL)
	.then(
		(response) => {
			if (response.status === 200) {
				response.json().then( (data) => {
					document.title = data.pagetitle || document.title;
					document.getElementsByTagName("body")[0].innerHTML = fromTemplate(templateID, data);
				} );
			} else { document.getElementsByTagName("body")[0].innerHTML = `<pre>FAILED to load data from ${dataSourceURL}</pre>`; }
		}
	)
	.catch(
		(err) => {
			document.getElementsByTagName("body")[0].innerHTML = `<pre>${err.toString()}</pre>`;
		}
	);


}


function getSourceData(templateID = "#body") {

	let templateURL = getParameterByName('template');

	fetch(templateURL)
	.then(
		(templateResponse) => {
			if (templateResponse.status === 200) {

				templateResponse.text().then(
					(templateText) => {
						document.getElementsByTagName("html")[0].appendChild(document.createRange().createContextualFragment(templateText));

						let dataSourceURL = getParameterByName('data');
						if (dataSourceURL == null) { sourceMissing(); return; }

						fetch(dataSourceURL)
						.then(
							(response) => {
								if (response.status === 200) {
									response.json().then( (data) => {
										document.title = data.pagetitle || document.title;
										document.getElementsByTagName("body")[0].innerHTML = fromTemplate(templateID, data);
									} );
								} else { document.getElementsByTagName("body")[0].innerHTML = `<pre>FAILED to load data from ${dataSourceURL}</pre>`; }
							}
						)
						.catch(
							(err) => {
								document.getElementsByTagName("body")[0].innerHTML = `<pre>${err.toString()}</pre>`;
							}
						);

					}
				);

			} else { document.getElementsByTagName("body")[0].innerHTML = `<pre>FAILED to load data from ${dataSourceURL}</pre>`; }
		}
	)
	.catch(
		(err) => {
			document.getElementsByTagName("body")[0].innerHTML = `<pre>${err.toString()}</pre>`;
		}
	);

}

function pre(data = {}, indent = 4) {
	return "<pre>" + JSON.stringify(data, null, indent) + "</pre>";
}

function inspect(data = {}) {
	console.log("inspect: ",data);
	return "";
}


function icon(name = null, defaultValue = `<i class="material-icons email">keyboard_arrow_right</i>`) {
	if (name == null) {return defaultValue;}
	name = name.toLocaleLowerCase();

	let icons = document.querySelector(`template#icons`);
	if (icons == null) {return defaultValue;}

	let div = document.createElement('div');
	div.appendChild(document.createRange().createContextualFragment(icons.innerHTML));

	let icon = div.querySelector(`.${name}`);
	if (icon == null) {return defaultValue;}

	return icon.outerHTML;
}

function progress(max = 10, value = 5) {
	return `<progress max="${max}" value="${value}"></progress>`
}

function rows(templateID, data) {

	let result = "";
	if (Array.isArray(data)) {
		data.forEach( (element,key) => {
			element['_index'] = key;
			element['_total'] = data.length;
			result += fromTemplate(templateID, element, key ) + "\n";
		} );
	} else if (typeof data === "object") {
		Object.keys(data).forEach( (key) => { result += fromTemplate(templateID, {"key": key, "value": data[key] }) + "\n"; } );
	} else {
		result = "row source unknown";
	}
	return result;
}