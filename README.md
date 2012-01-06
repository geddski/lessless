# lessless
*Compiles all your project's LESS into CSS, converts LESS <links> into regular CSS <links>, and removes less.js from your html page.*

**CAUTION: This tool modifies your source code and therefore is meant to be run as part of a build process that creates a copy of your project files(like RequireJS and others).**

## Installing
`npm install lessless -g`

## Usage

### As Command Line Tool
`lessless /path/to/project`
OR
`cd /path/to/project`
`lessless`

### As Module
```javascript
var lessless = require('lessless');
lessless.optimizeProject('/path/to/project'); //OR process.cwd()
```

## So What Exactly Does It Do?
1. Scans your project for LESS files and generates the appropriate CSS files with the same names. For example if your project has a `styles/main.less`, a `styles/main.css` file will get created (using the [less.js](http://lesscss.org/#-server-side-usage) tool).
2. Updates any html files to reference the new CSS instead of the LESS.
For example:

```html
<html>
  <head>
    <link rel="stylesheet/less" type="text/css" href="styles/main.less" />
  </head>
</html>
```

becomes:

```html
<html>
  <head>
    <link rel="stylesheet" type="text/css" href="styles/main.css" />
  </head>
</html>
```
3. Removes the `less.js` file from your html because you don't need it once your LESS is compiled into regular CSS. Example:

```html
<html>
  <head>
    <script type="text/javascript" src="js/less.js"></script>
  </head>
</html>
```

becomes:

```html
<html>
  <head>

  </head>
</html>
```

Give it a try and feel free to post any issues!