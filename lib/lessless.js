var less = require('less'), fs = require('fs'), diveSync = require("diveSync");

function createCSS(lessFile) {
	try {
		var data = fs.readFileSync(lessFile);
		var parser = new (less.Parser)({
			paths:['.', './css'] // Specify search paths for @import directives
		});
		parser.parse(data.toString(), function (e, tree) {
			var cssFile = lessFile.substr(0, lessFile.lastIndexOf('.')) + '.css';
			fs.writeFileSync(cssFile, tree.toCSS({compress:true}));
			console.log('created CSS file: ', cssFile);
		});
	}
	catch (err) {
		console.log("ERROR: ", err);
	}
}

function adjustLinks(htmlFile) {
	var data, origData;
	try {
		data = origData = fs.readFileSync(htmlFile).toString();
		data = stripLessRel(data);
		data = replaceLessExtension(data);
		data = stripLessJS(data);
		fs.writeFile(htmlFile, data);
		if (data !== origData) {
			console.log('adjusted LESS links in file: ', htmlFile);
		}
	}
	catch (err) {
		console.log("ERROR: ", err);
	}
}

/* replace sytlesheet/less with stylesheet */
function stripLessRel(contents) {
	return contents.replace(/stylesheet\/less/g, "stylesheet");
}

/* replace .less with .css */
function replaceLessExtension(contents) {
	return contents.replace(/\.less\b/g, ".css");
}

/* strip less.js from the web page (no longer needed after compiling less to css) */
function stripLessJS(contents) {
	return contents.replace(/<script.*?\bless\b[^"']*?\.js.*?<\/script>/g, "");
}

function optimizeProject(directory) {
	directory = directory || process.cwd();
	console.log('optimizing LESS in: ', directory);
	diveSync(directory,
		//ignore node_modules
		{filter:function (path, dir) {
			return path.indexOf('node_modules') === -1;
		}},
		function (err, file) {
			if (err) throw err;
			var extension = file.split('.').pop();
			if (extension === 'less') {
				createCSS(file);
			}
			//todo make configurable
			else if (extension === 'html' || extension === 'jsp') {
				adjustLinks(file);
			}
		}
	);
}

module.exports = {
	createCSS:createCSS,
	adjustLinks:adjustLinks,
	stripLessRel:stripLessRel,
	replaceLessExtension:replaceLessExtension,
	stripLessJS:stripLessJS,
	optimizeProject:optimizeProject
};










