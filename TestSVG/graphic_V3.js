(function(){

var notes = [
	{"C4": 1.0},
	{"D4": 1.0},
	{"F4": 1.0},
	{"0": 1.0},
	{"G4": 0.0},
	{"F4": 2.0}
]
  // <rect x="50" y="20" rx="20" ry="20" width="150" height="150"
  // style="fill:red;stroke:black;stroke-width:5;opacity:0.5" />

//var note_hauteur = {"C":500,"D":450,"E":400,"F":350,"G":300,"A":250,"B":200}
var note_hauteur = {"C":[300,"#bd0e0e"],"D":[250,"#d44223"],"E":[200,"#1aa4d6"],"F":[150,"#11b085"],"G":[100,"#264a57"],"A":[50,"#272143"],"B":[0,"#13bd0e"]}
var tempo = 60;
var graph;


var rectNotes="";
var sumWidth = 0;
for(var i = 0;i<notes.length;i++){
	Object.keys(notes[i]).forEach(function(elt){
		if(note_hauteur[elt[0]] != undefined ){
			
			var str = '<rect x="'+sumWidth+'" y="'+note_hauteur[elt[0]][0]+'"'+
			 			'width="'+
			 			Object.values(notes[i])[0] * tempo+'" height="20"'+
			 			'style="fill:'+note_hauteur[elt[0]][1]+';stroke:black;stroke-width:1" />'

			sumWidth+= Object.values(notes[i])[0] * tempo

			rectNotes += str
		}else{

			var str = '<rect x="'+sumWidth+'" y="0"'+
			 			'width="'+
			 			Object.values(notes[i])[0] * tempo+'" height="320"'+
			 			'style="fill:white;stroke:black;stroke-width:0.5" />'

			sumWidth+= Object.values(notes[i])[0] * tempo
			rectNotes += str
		}
	})
}

document.getElementById("graph").insertAdjacentHTML("afterbegin",rectNotes);

})()
