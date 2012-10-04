/*
  lessless.js
  copyright Dave Geddes (@geddesign)
  MIT license
*/

var less = require('less');
var fs = require('fs');
var diveSync = require("diveSync");
var log = console.log;

/* make the logger more hackable, e.g. use grunt's instead */
function setConsole(c){
	log = c.log;
}

/* Generate a CSS file based on a LESS file. Optionally pass an array of paths to use for looking up @imports */
//FIXME styledirs is getting appended to over and over with duplicates
function createCSS(lessFile, styledirs) {
	styledirs = styledirs || [];
	//add the file's directory to the styledirs so that relative paths for @imports work
	styledirs.push(lessFile.substr(0, lessFile.lastIndexOf('/')));
	var data = fs.readFileSync(lessFile);
	var parser = new(less.Parser)({
		// Specify search paths for @import directives. Combine with these common defaults
		paths: styledirs.concat(['.', './css'])
	});
	parser.parse(data.toString(), function(e, tree) {
		if (e) throw new Error ('Error parsing LESS file: ' + lessFile + '\n Cause: ' + e.message + '\n');
		var cssFile = lessFile.substr(0, lessFile.lastIndexOf('.')) + '.css';
		fs.writeFileSync(cssFile, tree.toCSS({
			compress: true
		}));
		log('created CSS file: ' + cssFile);
	});
}

function adjustLinks(htmlFile) {
	var data, origData;
	try {
		data = origData = fs.readFileSync(htmlFile).toString();
		data = stripLessRel(data);
		data = replaceLessExtension(data);
		data = stripLessJS(data);
		if (data !== origData) {
			fs.writeFileSync(htmlFile, data);
			log('adjusted LESS links in file: ' + htmlFile);
		}
	} catch (err) {
		throw new Error("Could not adust links in file: " + htmlFile + "\n Cause: " + err.message + '\n');
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

function ensureArray(a) {
	if (!(a instanceof Array)) {
		a = [a];
	}
	return a;
}

function optimizeProject(directory, styledirs, stripExtensions) {
	directory = stripTrailing(directory || process.cwd(), '/');
	stripExtensions = ensureArray(stripExtensions || ['html']);
	styledirs = ensureArray(styledirs);
	log('optimizing LESS in: ' + directory);
	diveSync(directory,
	//ignore node_modules
	{
		filter: function(path, dir) {
			return path.indexOf('node_modules') === -1;
		}
	}, function(err, file) {
		if (err) throw err;
		var extension = file.split('.').pop();
		if (extension === 'less') {
			createCSS(file, styledirs);
		}
		else if (stripExtensions.indexOf(extension) !== -1) {
			adjustLinks(file);
		}
	});
}

function stripTrailing(str, char) {
	return str.substr(-1) === '/' ? str.substr(0, str.length - 1) : str;
}

module.exports = {
	createCSS: createCSS,
	adjustLinks: adjustLinks,
	stripLessRel: stripLessRel,
	replaceLessExtension: replaceLessExtension,
	stripLessJS: stripLessJS,
	optimizeProject: optimizeProject,
	setConsole: setConsole
};