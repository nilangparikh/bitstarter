#!/usr/bin/env node
/*
    Automatically grade files for the presence of specific HTML tags/attributes.
    Uses commander.js and cheerio. Teaches command line application development
    and basic DOM parsing.

    References:

    + cheerio
      - https://github.com/MatthewMueller/cheerio
      - http://encosia.com/cheerio/cheerio-faster-windows-friendly-alternative-jsdom/
      - http://maxogden.com/scraping-with-node.html

    + commander.js
      - https://github.com/visionmedia/commander.js
      - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

    + JSON
      - http://en.wikipedia.org/wiki/JSON
      - https://developer.mozilla.org/en-US/docs/JSON
      - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

/*
    Inline definitions
*/
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

/*
    Required JS packages/libraries
*/
var cheerio = require('cheerio');
var fs = require('fs');
var program = require('commander');
var rest = require('restler');

/*
    Variable definitions
*/
var expression = /https?\:\/\/\w+((\:\d+)?\/\S*)?/;
var regexHTTP = new RegExp(expression);

/*
    Function definitions
*/
var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var printToConsole = function(htmlfile, checksfile) {
    var checkJson = checkHtmlFile(htmlfile, checksfile);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
         var present = $(checks[ii]).length > 0;
         out[checks[ii]] = present;
    }
    return out;
};

var buildfn = function(checksfile) {
    var htmlResponseParser = function(result, response) {
       if (result instanceof Error) {
           console.error('Error: ' + util.format(response.message));
       }
       else {
           fs.writeFileSync('tmp.html', result);
           printToConsole('tmp.html', checksfile);
       }
    };
    return htmlResponseParser;
};

if (require.main == module) {
    program
        .option ('-c, --checks ', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
        .option ('-u, --url ', 'URL or Path to index.html')
        .parse(process.argv);

    if (program.args[1].match(regexHTTP)) {
        var htmlResponseParser = buildfn(program.checks);
        rest.get(program.args[1]).on('complete', htmlResponseParser);
    } else {
        printToConsole(program.args[1], program.args[0]);
    }
} else {
   exports.checkHtmlFile = checkHtmlFile;
}
