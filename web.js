var express = require('express');
var fs = require('fs');
var buffer = require('buffer');
var infile = "./index.html";

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
   buffer = new Buffer(fs.readFileSync(infile, 'utf-8'));

   response.send(buffer.toString('utf-8'));
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
