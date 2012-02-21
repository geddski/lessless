var buster = require('buster')
	, lessless = require('../lib/lessless')
	, fs = require('fs');

buster.spec.expose();

describe('generating CSS from a LESS file', function(){
	before(function () {
		//generate a css file from a less file
		var testfile = "test/test.less";
		lessless.createCSS(testfile);
	});

	after(function () {
		//delete the generated css file
		fs.unlinkSync("test/test.css");
	});

	it('should create file', function(){
	  var file = fs.readFileSync("test/test.css");
		console.log("file: ", file);
		expect(file).toBeDefined();
  });
});

describe('adjusting LESS links', function(){
	var origHTML, testFile = "test/test.html";

  describe('replacing stylesheet/less with stylesheet', function(){
	  it('should start with 1', function(){
		  var html = '<link rel="stylesheet/less" type="text/css" href="stylesheet1.less" media="all">';
		  expect(html).toMatch(/stylesheet\/less/g);
		  //make the change
		  var newHTML = lessless.stripLessRel(html);
		  expect(newHTML).not().toMatch(/stylesheet\/less/g);
		  expect(newHTML).toMatch(/\"stylesheet\"/g);
	  });
  });

	describe('replacling .less with .css', function(){
		it('should replace .less with .css', function(){
			var html = '<link rel="stylesheet/less" type="text/css" href="stylesheet1.less" media="all">';
			expect(html).toMatch(/\.less/g);
			expect(html).not().toMatch(/\.css/g);
			//make the change
			var newHTML = lessless.replaceLessExtension(html);
			expect(newHTML).not().toMatch(/\.less/g);
			expect(newHTML).toMatch(/\.css/g);
		});

		it('should not match words containing .less, like .lesson', function () {
			var html = "org.lds.lua.lesson.service.impl.NavigationServiceImpl";
			var newHTML = lessless.replaceLessExtension(html);
		  expect(newHTML).toMatch(/\.lesson/g);
		  expect(newHTML).not().toMatch(/\.less\b/g);
		});
	});

	describe('stripping out less.js script', function(){
		it('should remove the script tag', function(){
			var html = "<script src='js/lib/less.js'></script>";
			expect(html).toMatch(/js\/lib\/less.js/);
			//strip it out
			var newHTML = lessless.stripLessJS(html);
			expect(newHTML).not().toMatch(/js\/lib\/less.js/);
			expect(newHTML).not().toMatch(/script/);
		});
		it('should remove versioned and compressed "less" script tags', function() {
			var html = "<script src='js/lib/less-1.2.1.min.js'></script>";
			expect(html).toMatch(/js\/lib\/less-1\.2\.1\.min.js/);
			//shouldn't strip it out
			var newHTML = lessless.stripLessJS(html);
			expect(newHTML).not().toMatch(/js\/lib\/less-1\.2\.1\.min.js/);
			expect(newHTML).not().toMatch(/script/);
		});
		it('should not match scripts where "less" is not a standalone word', function() {
			var html = "<script src='js/lib/boundless.js'></script>";
			expect(html).toMatch(/js\/lib\/boundless.js/);
			//shouldn't strip it out
			var newHTML = lessless.stripLessJS(html);
			expect(newHTML).toMatch(/js\/lib\/boundless.js/);
		});

	});
});