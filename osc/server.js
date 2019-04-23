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


// Open the socket.
udpPort.open();


var server = http.createServer((req, res) => {

    var page = url.parse(req.url).pathname;

    if (page == '/') {

        fs.readFile('./display.html', 'utf-8', function (error, content) {

            res.writeHead(200, {
                "Content-Type": "text/html"
            });

            res.end(content);

        });
    } else if (page == '/svg.js') {
        fs.readFile('./svg.js', 'utf-8', function (error, content) {

            res.writeHead(200, {
                "Content-Type": "text/javascript"
            });

            res.end(content);

        });
    } else if (page == '/grille.js') {
        fs.readFile('./grille.js', 'utf-8', function (error, content) {

            res.writeHead(200, {
                "Content-Type": "text/javascript"
            });

            res.end(content);

        });
    }

});


var io = require('socket.io').listen(server);
var sock;
io.sockets.on('connection', function (socket) {
    sock = socket;
});

 var cpt_pitch = 0;
// var cpt_beat = 0;
udpPort.on("message", function (msg) {
    
    message = msg;

    if (msg.address === '/antescofo/pitch') {
        cpt_pitch ++;
        if(cpt_pitch>2){
            console.log("osc message received");
            console.log(msg);
            if (sock != undefined) {
                sock.emit('OSC', message);
            }
        }
        
    }
    // if(msg.address === '/antescofo/event_beatpos'){
    //     //cpt_beat ++;
    //     //if(cpt_beat>2)
    //         console.log(msg)
    // }
});

server.listen(8000);