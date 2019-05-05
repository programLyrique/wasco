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
    } else if (page == '/peg.js') {
        fs.readFile('./peg.js', 'utf-8', function (error, content) {

            res.writeHead(200, {
                "Content-Type": "text/javascript"
            });

            res.end(content);

        });
    } else if (page == '/parser.js') {
        fs.readFile('./parser.js', 'utf-8', function (error, content) {

            res.writeHead(200, {
                "Content-Type": "text/javascript"
            });

            res.end(content);

        });
    } else if (page == '/socket.io.js') {
        fs.readFile('./socket.io.js', 'utf-8', function (error, content) {

            res.writeHead(200, {
                "Content-Type": "text/javascript"
            });

            res.end(content);

        });
    }



});

var msgOsc = false;
var io = require('socket.io').listen(server);
var sock;
io.sockets.on('connection', function (socket) {
    sock = socket;

    socket.on('pause', () => {
        console.log('pause');

        udpPort.send({
            address: "/antescofo/cmd",
            args: [
                {
                    type: "s",
                    value: "stop"
                },
            ]
        }, "127.0.0.1", 5678);
    })

    socket.on('resume', () => {
        console.log('resume');
        // udpPort.send({
        //     address: "/antescofo/cmd",
        //     args: [
        //         {
        //             type: "s",
        //             value: "play"
        //         }
        //     ]
        // }, "127.0.0.1", 5678);
        udpPort.send({
            address: "/antescofo/cmd",
            args: [
                {
                    type: "s",
                    value: "playfrombeat"
                },
                {
                    type: "s",
                    value: lastbeat_pos
                },
            ]
        }, "127.0.0.1", 5678);
    });

    socket.on('FileEvent', function (fichier) {
        console.log(fichier);
        var cmd = __dirname + "/../Asco_Examples/" + fichier;
        if (!msgOsc) {
            udpPort.send({
                address: "/antescofo/cmd",
                args: [
                    {
                        type: "s",
                        value: "score"
                    },
                    {
                        type: "s",
                        value: cmd
                    }
                ]
            }, "127.0.0.1", 5678);

            udpPort.send({
                address: "/antescofo/cmd",
                args: [
                    {
                        type: "s",
                        value: "play"
                    }
                ]
            }, "127.0.0.1", 5678);

            // udpPort.send({
            //     address: "/antescofo/cmd",
            //     args: [
            //         {
            //             type: "s",
            //             value: "get_current_score"
            //         }
            //     ]
            // }, "127.0.0.1", 5678);
        }
    });
});


var lastbeat_pos = 0;
var cpt_pitch = 0;
var cpt_beat = 0;
udpPort.on("message", function (msg) {

    msgOsc = true;
    message = msg;
    console.log(message)
    if (msg.address === '/antescofo/pitch') {
        // cpt_pitch ++;
        // if(cpt_pitch>2){
        console.log("osc message received");
        console.log(msg);
        // if (sock != undefined) {
        //     sock.emit('OSC-pitch', message);
        // }
        // }

    }
    if (msg.address === '/antescofo/event_beatpos') {
        //cpt_beat ++;
        //if(cpt_beat>2){
        if (sock != undefined) {
            sock.emit('OSC-beatpos', message);
        }
        console.log(msg)
        lastbeat_pos = message.args[0].value;
        //}   
    }

});

server.listen(8000);