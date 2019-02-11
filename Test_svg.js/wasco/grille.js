function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var partition;
function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        partition = parse(contents);
        run(partition)
    };
    reader.readAsText(file);
}

function parse(contents) {
    return JSON.parse(contents)
}

document.getElementById('file-input').addEventListener('change', readSingleFile, false);

function run(partition) {

    var height = 12 * 9 * 30;
    var width = 500;
    var duration = 0;

    for (var i = 0; i < partition.length; i++) {

        if (partition[i][0].NOTE != undefined) {
            duration += partition[i][1].duration
            width += 60 * partition[i][1].duration
        } else if (partition[i][0].TRILL) {
            duration += partition[i][1].duration * partition[i][0].TRILL.length
            width += 60 * partition[i][1].duration * partition[i][0].TRILL.length
        }
    }

    var widthNote = 80;
    var heightNote = 30;

    var draw = SVG('drawing').size(width, height)
    var xLine = draw.line(50, 0, 50, height).stroke({ width: 1 }).id('xLine')
    var yLine = draw.line(50, height, width, height).stroke({ width: 1 }).id('yLine')

    var note = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

    var midiMatrix = {}
    var charp;
    for (var i = 0; i < note.length; i++) {
        charp = i;
        for (var midi = 0; midi < 10; midi++) {
            charp = charp + 12;
            midiMatrix[charp] = note[i] + midi.toString();
        }
        charp = 0;
    }

    var midiMatrixValues = Object.values(midiMatrix)
    var revMidiMatrix = midiMatrixValues.reverse()

    // pianoroll
    for (var i = 0; i < height; i++) {

        if ((i + 12) % revMidiMatrix.length == 0)
            break

        var key = revMidiMatrix[i + 12 % revMidiMatrix.length]

        if (key.length > 2) {
            var keyB = draw.rect(100, 30).move(0, i * 30).fill('black').id(key);
            var rectPaire = draw.rect(width, 30).move(100, i * 30).fill('#e5e5e5');
            var text = draw.text(key);
            text.move(40, i * 30).font({ fill: '#fff', family: 'Arial' })
        } else {
            var keyW = draw.rect(100, 30).move(0, i * 30).fill('#e1e1e1').id(key);
            var rectImpaire = draw.rect(width, 30).move(100, i * 30).fill('#f5f2d5');
            var text = draw.text(key);
            text.move(40, i * 30).font({ fill: '#000', family: 'Arial' })
        }
    }

    var sommeNoteDuration = 100;

    for (var i = 1; i < partition.length - 1; i++) {
        var rectY = 0;
        if (partition[i][0].NOTE != undefined && partition[i][0].NOTE != 0) { // NOTE

            /*var timeLine = draw.line(sommeNoteDuration, 0, sommeNoteDuration, height).stroke({ width: 1 })
            timeLine.animate({ duration : partition[i][1].duration * 1000, ease: '-', delay: lastDuration+'s' }).attr({'stroke-width': 0, 
                                                                        x1: sommeNoteDuration + 60*partition[i][1].duration,
                                                                        x2: sommeNoteDuration + 60*partition[i][1].duration})
            
            lastDuration += partition[i][1].duration*/


            rectY = document.getElementById(midiMatrix[partition[i][0].NOTE]).getAttribute("y")

            if (partition[i][1].duration == 0) { // Grace note
                var rect = draw.rect(20, 30).fill("#000").move(sommeNoteDuration, rectY).radius(50);
                //sommeNoteDuration += 30;
            } else {
                var rect = draw.rect(60 * partition[i][1].duration, 30).fill(getRandomColor()).move(sommeNoteDuration, rectY);
                sommeNoteDuration += 60 * partition[i][1].duration;
            }


        } else if (partition[i][0].TRILL) { // TRILL
            var color = getRandomColor();

            /*var timeLine = draw.line(sommeNoteDuration, 0, sommeNoteDuration, height).stroke({ width: 1 })
            timeLine.animate({ duration : partition[i][1].duration * 1000, ease: '-', delay: lastDuration+'s' }).attr({'stroke-width': 0, x1: sommeNoteDuration + 60*partition[i][1].duration,
                                                                           x2: sommeNoteDuration + 60*partition[i][1].duration})
            lastDuration += partition[i][1].duration*/

            for (var j = 0; j < partition[i][0].TRILL.length; j++) {

                rectY = document.getElementById(midiMatrix[partition[i][0].TRILL[j]]).getAttribute("y")

                if (partition[i][1].duration == 0) { // Grace note
                    var rect = draw.rect(20, 30).fill("#000").move(sommeNoteDuration, rectY).radius(50);
                    sommeNoteDuration += 30;
                } else {
                    var rect = draw.rect(60 * partition[i][1].duration, 30).fill(color).move(sommeNoteDuration, rectY);
                }
            }

            sommeNoteDuration += 60 * partition[i][1].duration;
        } else if (partition[i][0].NOTE == 0) { // silence

            /*var timeLine = draw.line(sommeNoteDuration, 0, sommeNoteDuration, height).stroke({ width: 1 })
            timeLine.animate({ duration : partition[i][1].duration * 1000, ease: '-', delay: lastDuration+'s' }).attr({'stroke-width': 0, 
                                                                                x1: sommeNoteDuration + 60*partition[i][1].duration,
                                                                                x2: sommeNoteDuration + 60*partition[i][1].duration}) 
            lastDuration += partition[i][1].duration*/

            var rect = draw.rect(60 * partition[i][1].duration, height).fill("#fff").move(sommeNoteDuration, rectY);
            sommeNoteDuration += 60 * partition[i][1].duration;
        }
    }

    // Cursor
    var timeLine = draw.line(100, 0, 100, height).stroke({ width: 1 }).id('timeLine')
    timeLine.animate(duration * 1000, '-', 0).attr({ x1: width, x2: width })
    
    scrollTo(0, document.getElementById("timeLine").getAttribute("x"))
    scrollTo(0, document.getElementById("F#5").getAttribute("y"))


}
