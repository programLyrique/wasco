function getRandomColor() {
    var letters = '0123456789ABCDEF'
    var color = '#'
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}



var durationArray

function readDurationFile(e) {
    var file = e.target.files[0]
    if (!file) {
        return
    }
    var reader = new FileReader()
    reader.onload = function (e) {
        var contents = e.target.result
        durationArray = parse(contents)
    }
    reader.readAsText(file)
}




var partition
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

document.getElementById('file-input').addEventListener('change', readSingleFile, false)



document.getElementById('real_duration').addEventListener('change', readDurationFile, false)





function run(partition, durationArray) {

    /* Pres Calcul*/
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
        }else if(partition[i][0].CHORD){
            duration += partition[i][1].duration
            width += 120 * partition[i][1].duration
        }
    }

    // fin du pres calcul

    var widthNote = 80
    var heightNote = 30

    var draw = SVG('drawing').size(width, height)
    var xLine = draw.line(50, 0, 50, height).stroke({ width: 1 }).id('xLine')
    var yLine = draw.line(50, height, width, height).stroke({ width: 1 }).id('yLine')

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
    for (var i = 0; i < height; i++) {

        if ((i + 12) % revMidiMatrix.length == 0)
            break

        var key = revMidiMatrix[i + 12 % revMidiMatrix.length]

        if (key.length > 2) {
            var keyB = draw.rect(100, 30).move(0, i * 30).fill('black').id(key)
            var rectPaire = draw.rect(width, 30).move(100, i * 30).fill('#e5e5e5')
            var text = draw.text(key)
            text.move(40, i * 30).font({ fill: '#fff', family: 'Arial' })
        } else {
            var keyW = draw.rect(100, 30).move(0, i * 30).fill('#e1e1e1').id(key)
            var rectImpaire = draw.rect(width, 30).move(100, i * 30).fill('#f5f2d5')
            var text = draw.text(key)
            text.move(40, i * 30).font({ fill: '#000', family: 'Arial' })
        }
    }

    var sommeNoteDuration = 100
    var lastDuration = 0
    var timeLineTab = []



    var intervalID = window.addEventListener("click",function(){
        var newTimeLineTab = []
        var ligneActive
        var tmp=[]
        var lignes = document.getElementsByTagName("line")
        for (var i = 0; i<lignes.length; i++) {
            if (lignes[i].getAttribute('stroke-width') == undefined || lignes[i].getAttribute('stroke-width') != 1) {
                tmp.push(lignes[i])
            }
        }
        ligneActive = tmp[tmp.length - 1]
        
        i = 0
        index = 0
        while (i<timeLineTab.length) {
            l = document.getElementById(timeLineTab[i].line.id())
            console.log(timeLineTab[i].line.id())
            if (l.getAttribute("x1") == ligneActive.getAttribute("x1")) {
                console.log("i : "+i)
                index = i
            }
            document.getElementsByTagName("svg")[0].removeChild(l)
            i++;
        }
        console.log("---------------------")
        console.log(timeLineTab[0])
        i = index
        var attente = 0.0
        
        while (i<timeLineTab.length) {
            var realDuration = durationArray[i%durationArray.length]
            
            var newLigne = draw.line(timeLineTab[i].x_init, 0, timeLineTab[i].x_init, height)
                            .stroke({ width: 1 })
                            .id("ligne"+i+"_"+Math.random())
                            
            newLigne.animate({ duration : realDuration , ease: '-', delay: attente / 1000+'s' })
                            .attr({'stroke-width': 1})
                            .move(timeLineTab[i].x_end,0)
                            .after(function(situation) {
                                this.animate().attr({ 'stroke-width': 0})
                            })
            
            newTimeLineTab.push({line : newLigne, x_init : timeLineTab[i].x_init, x_end : timeLineTab[i].x_end})
            attente += realDuration
            i++
        }
        
        timeLineTab = newTimeLineTab;
        
    })


    for (var i = 1; i < partition.length - 1; i++) {
        var rectY = 0


        if (partition[i][0].NOTE != undefined && partition[i][0].NOTE != 0) { // NOTE

            var timeLine = draw.line(sommeNoteDuration, 0, sommeNoteDuration, height).stroke({ width: 1 }).id("note"+i)
            timeLine.animate({ duration : partition[i][1].duration * 1000, ease: '-', delay: lastDuration+'s' })
                            .attr({'stroke-width': 1})
                            .move(sommeNoteDuration + 120*partition[i][1].duration, 0)
                            .after(function(situation) {
                                    this.animate().attr({ 'stroke-width': 0})
                             }) 
            
            lastDuration += partition[i][1].duration
            timeLineTab.push({line : timeLine, x_init : sommeNoteDuration, x_end : sommeNoteDuration + 120*partition[i][1].duration})
            

            rectY = document.getElementById(midiMatrix[partition[i][0].NOTE]).getAttribute("y")
            
            if (partition[i][1].duration == 0) { // Grace note
                var rect = draw.rect(30, 30).fill("#000").move(sommeNoteDuration, rectY).radius(50);
                sommeNoteDuration += 30
            } else {
                var rect = draw.rect(120 * partition[i][1].duration, 30).fill(getRandomColor()).move(sommeNoteDuration, rectY);
                sommeNoteDuration += 120 * partition[i][1].duration
            }

        } else if (partition[i][0].TRILL) { // TRILL
        
            var color = getRandomColor()
            //console.log(partition[i][0])
            var timeLine = draw.line(sommeNoteDuration, 0, sommeNoteDuration, height).stroke({ width: 1 }).id("trill"+i)
            timeLine.animate({ duration : partition[i][1].duration * 1000, ease: '-', delay: lastDuration+'s' })
                                .attr({'stroke-width': 1,
                                })
                                .move(sommeNoteDuration + 120*partition[i][1].duration, 0)
                                .after(function(situation) {
                                    this.animate().attr({ 'stroke-width': 0})
                                }) 
            lastDuration += partition[i][1].duration
            timeLineTab.push({line : timeLine, x_init : sommeNoteDuration, x_end : sommeNoteDuration + 120*partition[i][1].duration})

            // TRILL qui contient des CHORD

            var trill = partition[i][0].TRILL
            var nbNote = 0
            
            for(var k = 0; k<trill.length; k++){
                if(trill[k].CHORD){
                    nbNote += trill[k].CHORD.length
                }else{
                    nbNote++
                }
            }

            for(var k = 0; k< trill.length; k++){
                if(trill[k].CHORD){
                    var chord = trill[k].CHORD
                    for(var d = 0; d<chord.length; d++){
                        rectY = document.getElementById(midiMatrix[chord[d]]).getAttribute("y")
                        var rect = draw.rect(120 * (partition[i][1].duration/nbNote), 30).fill(color).move(sommeNoteDuration, rectY)
                    }
                    sommeNoteDuration += 120 * partition[i][1].duration/nbNote
                }else{ 

                    rectY = document.getElementById(midiMatrix[trill[k]]).getAttribute("y")

                    if (partition[i][1].duration == 0) { // Grace note
                        var rect = draw.rect(30, 30).fill("#000").move(sommeNoteDuration, rectY).radius(50)
                        sommeNoteDuration += 30
                    } else {
                        var rect = draw.rect(120 * (partition[i][1].duration/trill.length), 30).fill(color).move(sommeNoteDuration, rectY)
                        sommeNoteDuration += 120 * (partition[i][1].duration/trill.length)
                    }
                }
            }
            
        } else if(partition[i][0].CHORD){
            var color = getRandomColor()
            var chord = partition[i][0].CHORD
            var duree = partition[i][1].duration
            for(var k = 0; k<chord.length; k++){

                rectY = document.getElementById(midiMatrix[chord[k]]).getAttribute("y")
                var rect = draw.rect(120 * duree, 30).fill(color).move(sommeNoteDuration, rectY)
            }

            var timeLine = draw.line(sommeNoteDuration, 0, sommeNoteDuration, height).stroke({ width: 1 }).id("chord"+i)
            timeLine.animate({ duration : partition[i][1].duration * 1000, ease: '-', delay: lastDuration+'s' })
                            .attr({
                                'stroke-width': 1, 
                            })
                            .move(sommeNoteDuration + 120*partition[i][1].duration, 0)
                            .after(function(situation) {
                                  this.animate().attr({ 'stroke-width': 0})
                            }) 
            lastDuration += partition[i][1].duration

            timeLineTab.push({line : timeLine, x_init : sommeNoteDuration, x_end : sommeNoteDuration + 120*partition[i][1].duration})

            sommeNoteDuration += 120 * duree

        } else if (partition[i][0].NOTE == 0) { // silence

            // var timeLine = draw.line(sommeNoteDuration, 0, sommeNoteDuration, height).stroke({ width: 0 })
            // timeLine.animate({ duration : partition[i][1].duration * 1000, ease: '-', delay: lastDuration+'s' }).attr({'stroke-width': 1, 
            //                                                                     x1: sommeNoteDuration + 120*partition[i][1].duration,
            //                                                                     x2: sommeNoteDuration + 120*partition[i][1].duration}) 
            // lastDuration += partition[i][1].duration
            

            // document.getElementById("chord"+i).addEventListener("animationend",function (e) {
            //     console.log(e)
            // })
            // timeLine.addEventListener("animationend",function (e) {
            //     console.log(e)
            // })


            
            var rect = draw.rect(120 * partition[i][1].duration, height).fill("#fff").move(sommeNoteDuration, rectY)
            sommeNoteDuration += 120 * partition[i][1].duration
            
        }
    }

    // Cursor
    // var timeLine = draw.line(100, 0, 100, height).stroke({ width: 0 }).id('timeLine')
    // timeLine.animate(duration * 1000, '-', 0).attr({ x1: width, x2: width })
    
    //scrollTo(0, document.getElementById("timeLine").getAttribute("x"))
    scrollTo(0, document.getElementById("F#5").getAttribute("y"))


}
