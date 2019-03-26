var osc = require("osc");

var http = require('http');
var fs = require('fs');
var url = require('url');
var message;
// Create an osc.js UDP Port listening on port 57121.
var udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: 6789,
    metadata: true
});

// Listen for incoming OSC bundles.
udpPort.on("message", function (msg) {
    message = msg;
    console.log("Remote info is: ", msg);
});

// Open the socket.
udpPort.open();


var server = http.createServer((req, res) => {

	var page = url.parse(req.url).pathname;

	if (page == '/') {

		fs.readFile('./index.html', 'utf-8', function(error, content) {

		    res.writeHead(200, {"Content-Type": "text/html"});

		    res.end(content);

    	});
    }
    else if (page == '/SVG.js') {
    	fs.readFile('./SVG.js', 'utf-8', function(error, content) {

		    res.writeHead(200, {"Content-Type": "text/javascript"});

		    res.end(content);

    	});
    }
    else if (page == '/grille.js') {
    	fs.readFile('./grille.js', 'utf-8', function(error, content) {

		    res.writeHead(200, {"Content-Type": "text/javascript"});

		    res.end(content);

    	});
    }
	
});


var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

    socket.emit('message', message);
    
});



server.listen(8000);
