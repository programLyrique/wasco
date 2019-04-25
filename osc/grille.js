var socket = io.connect('http://localhost:8000');

function getRandomColor() {
    var letters = '0123456789ABCDEF'
    var color = '#'
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

function getColor(pitch) {
    return map_color[pitch]
}

/**
 * map_color : pitch -> color
 */
var map_color = [{ 'C': "#1abc9c" }, { 'C#': "#f7dc6f " }, { 'D': "#c0392b" }, { 'D#': "#e67e22" }, { 'E': "#2980b9" }, { 'F': "#58d68d" }, { 'F#': "#7f8c8d" }, { 'G': " #34495e" }, { 'G#': "#34495e" }, { 'A': "#f1c40f" }, { 'A#': "#85c1e9" }, { 'B': "#6c3483" }]

var durationArray

var partition = []


document.getElementById('file-input').onchange = function() {
        
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function(progressEvent) {

            // line by line
            var lines = this.result.split(/[\r\n]/);
            for (var i = 0; i < lines.length; i++) {
                var regex = /^(BPM|NOTE|CHORD|TRILL|MULTI)+/y;
                if (!regex.test(lines[i])){
                    if(i == lines.length - 1){
                        console.log("EOF "+i)
                        run(partition, durationArray)
                    }
                    continue;
                }
                partition.push(parser.parse(lines[i]));
                if(i == lines.length - 1){
                    console.log("EOF "+i)
                    run(partition, durationArray)
                }
            }
        };

        reader.readAsText(file);
        
};



function readSingleFile(e) {
    var file = e.target.files[0]
    if (!file) {
        return
    }
    var reader = new FileReader()
    reader.onload = function (e) {
        var contents = e.target.result
        partition = parse(contents)
        run(partition, durationArray)
    }
    reader.readAsText(file)
}

function parse(contents) {
    return JSON.parse(contents)
}

function dichotomie(timeLine, tab) {

    if (tab.length == 1) {

        if (timeLine >= tab[0].x_init && timeLine <= tab[0].x_end) {

            //console.log("Note found !!")
            return tab[0]

        } else {

            return "Note not found !!"

        }
    } else {

        if (timeLine < tab[parseInt(tab.length / 2)].x_init) {

            return dichotomie(timeLine, tab.slice(0, parseInt(tab.length / 2)))

        } else {

            return dichotomie(timeLine, tab.slice(parseInt(tab.length / 2)))

        }
    }
}

var rectPositionTab = []

function run(partition, durationArray) {

    /* Pre Calcul*/
    var height = 12 * 9 * 30
    var width = 500
    var duration = 0

    for (var i = 0; i < partition.length; i++) {

        if (partition[i][0].NOTE != undefined) {
            duration += partition[i][1].duration
            width += 120 * partition[i][1].duration
        } else if (partition[i][0].TRILL) {
            duration += partition[i][1].duration
            width += 120 * partition[i][1].duration * partition[i][0].TRILL.length
        } else if (partition[i][0].CHORD) {
            duration += partition[i][1].duration
            width += 120 * partition[i][1].duration
        }
    }

    // fin du pre calcul

    var widthNote = 80
    var heightNote = 30

    var upper = SVG('drawing').size(width, height)
    var pianoroll = upper.group()
    var wall = upper.nested()
    var draw = wall.group()

    pianoroll.front()

    var note = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

    var midiMatrix = {}
    var charp
    for (var i = 0; i < note.length; i++) {
        charp = i
        for (var midi = 0; midi < 10; midi++) {
            charp = charp + 12
            midiMatrix[charp] = note[i] + midi.toString()
        }
        charp = 0
    }

    var midiMatrixValues = Object.values(midiMatrix)
    var revMidiMatrix = midiMatrixValues.reverse()

    // pianoroll
    for (let i = 0; i < height; i++) {

        if ((i + 12) % revMidiMatrix.length == 0)
            break

        var key = revMidiMatrix[i + 12 % revMidiMatrix.length]

        if (key.length > 2) {
            var keyB = pianoroll.rect(100, 30).move(0, i * 30).fill('black').id(key)
            var rectPaire = draw.rect(width, 30).move(100, i * 30).fill('#e5e5e5')
            var text = pianoroll.text(key)
            text.move(40, i * 30).font({
                fill: '#fff',
                family: 'Arial'
            })
        } else {
            var keyW = pianoroll.rect(100, 30).move(0, i * 30).fill('#e1e1e1').id(key)
            var rectImpaire = draw.rect(width, 30).move(100, i * 30).fill('#f5f2d5')
            var text = pianoroll.text(key)
            text.move(40, i * 30).font({
                fill: '#000',
                family: 'Arial'
            })
        }
    }

    var sommeNoteDuration = 100
    var halfWindow = window.innerWidth / 2
    var pitches = 0
    var flag = true
    var now
    //Event Socket io
    socket.on('OSC', function (message) {
        pitches++
        if (flag) {
            now = Date()
        }
        console.log('Le serveur a un message pour vous : ')
        console.log(message.args[0].value);

        //console.log(halfWindow)
        var timeL = timeLine.attr('x1')

        //console.log(timeL)

        if (timeL > halfWindow) {
            console.log(timeL)
            console.log(halfWindow)
            draw.animate(3000, '-', 0).move(-halfWindow + 90, 0)
            halfWindow += window.innerWidth / 2
            console.log(halfWindow)

        }

        var currentNote = dichotomie(timeL, rectPositionTab)
        var indexCurr = rectPositionTab.indexOf(currentNote)
        var next
        if (currentNote.x_init == currentNote.x_end) {
            next = rectPositionTab[indexCurr + 1]
        } else if (timeL == currentNote.x_init) {
            next = rectPositionTab[indexCurr]
        } else if (timeL <= currentNote.x_end) {
            next = rectPositionTab[indexCurr + 1]
        }


        /* A vérifier */
        timer = message.args[0].value + now
        //if(timer <= now - ){
        timeLine.stop()
        timeLine.remove()
        if (next != undefined) {
            timeLine = draw.line(next.x_init, 0, next.x_init, height).stroke({
                width: 1
            })
        }
        timeLine.animate(next.duree_note * 1000, '-', 0).attr({
            x1: next.x_end,
            x2: next.x_end
        })
        //}else {  //if(timer > now - )
        // setTimeout(function(){ 
        //     timeLine.stop()
        //     timeLine.remove()
        //     timeLine = draw.line(next.x_init, 0, next.x_init, height).stroke({
        //         width: 1
        //     })
        //     timeLine.animate(next.duree_note * 1000, '-', 0).attr({
        //         x1: next.x_end,
        //         x2: next.x_end
        //     })
        // }, (timer - (now - )));
        // console.log((timer-(now - )))
        //console.log("not yet")
        //}

        // console.log("Pitches : " + pitches);
        // console.log("" + rectPositionTab.length)
    });

    for (var i = 0; i < partition.length; i++) {


        console.log(i)

        var rectY = 0


        if (partition[i][0].NOTE != undefined && partition[i][0].NOTE != 0) { // NOTE

            rectPositionTab.push({
                x_init: sommeNoteDuration,
                x_end: sommeNoteDuration + 120 * partition[i][1].duration,
                duree_note: partition[i][1].duration
            })

            rectY = document.getElementById(midiMatrix[partition[i][0].NOTE]).getAttribute("y")

            if (partition[i][1].duration == 0) { // Grace note

                var rect = draw.rect(30, 30)
                    .fill("#000")
                    .move(sommeNoteDuration, rectY)
                    .radius(50)

                sommeNoteDuration += 30

            } else {

                var rect = draw.rect(120 * partition[i][1].duration, 30)
                    .fill(getColor(midiMatrix[partition[i][0].NOTE]))
                    .move(sommeNoteDuration, rectY)
                    .id(sommeNoteDuration)

                sommeNoteDuration += 120 * partition[i][1].duration

            }

        } else if (partition[i][0].TRILL) { // TRILL

            rectPositionTab.push({
                x_init: sommeNoteDuration,
                x_end: sommeNoteDuration + 120 * partition[i][1].duration,
                duree_note: partition[i][1].duration
            })

            // TRILL qui contient des CHORD

            var trill = partition[i][0].TRILL
            var nbNote = 0

            for (var k = 0; k < trill.length; k++) {
                if (trill[k].CHORD) {
                    nbNote += trill[k].CHORD.length
                } else {
                    nbNote++
                }
            }

            for (var k = 0; k < trill.length; k++) {

                if (trill[k].CHORD) {

                    var chord = trill[k].CHORD
                    for (var d = 0; d < chord.length; d++) {
                        rectY = document.getElementById(midiMatrix[chord[d]]).getAttribute("y")
                        var rect = draw.rect(120 * (partition[i][1].duration / nbNote), 30)
                            .fill(getColor(midiMatrix[chord[d]]))
                            .move(sommeNoteDuration, rectY)
                            .id(sommeNoteDuration)
                    }

                    sommeNoteDuration += 120 * partition[i][1].duration / nbNote

                } else {

                    rectY = document.getElementById(midiMatrix[trill[k]]).getAttribute("y")

                    if (partition[i][1].duration == 0) { // Grace note

                        var rect = draw.rect(30, 30).fill("#000")
                            .move(sommeNoteDuration, rectY)
                            .radius(50)
                            .id(sommeNoteDuration);

                        sommeNoteDuration += 30

                    } else {

                        var rect = draw.rect(120 * (partition[i][1].duration / trill.length), 30)
                            .fill(getColor(midiMatrix[trill[k]]))
                            .move(sommeNoteDuration, rectY)
                            .id(sommeNoteDuration);

                        sommeNoteDuration += 120 * (partition[i][1].duration / trill.length)
                    }
                }
            }

        } else if (partition[i][0].CHORD) {

            var color = getColor()
            var chord = partition[i][0].CHORD
            var duree = partition[i][1].duration
            for (var k = 0; k < chord.length; k++) {

                rectY = document.getElementById(midiMatrix[chord[k]]).getAttribute("y")
                var rect = draw.rect(120 * duree, 30)
                    .fill(getColor(midiMatrix[chord[k]]))
                    .move(sommeNoteDuration, rectY)
                    .id(sommeNoteDuration)
            }

            rectPositionTab.push({
                x_init: sommeNoteDuration,
                x_end: sommeNoteDuration + 120 * partition[i][1].duration,
                duree_note: partition[i][1].duration
            })

            sommeNoteDuration += 120 * duree

        } else if (partition[i][0].NOTE == 0) { // silence

            var rect = draw.rect(120 * partition[i][1].duration, height)
                .fill("#fff")
                .move(sommeNoteDuration, rectY)
                .id(sommeNoteDuration)

            rectPositionTab.push({
                x_init: sommeNoteDuration,
                x_end: sommeNoteDuration + 120 * partition[i][1].duration,
                duree_note: partition[i][1].duration
            })

            sommeNoteDuration += 120 * partition[i][1].duration

        }
    }

    // var  = Date.now();

    var timeLine = draw.line(100, 0, 100, height).stroke({
        width: 1
    }).id('timeLine')

    scrollTo(0, document.getElementById("F#5").getAttribute("y"))   
}

