(function(){

var notes = [
	{"C4": 1.0},
	{"D4": 1.0},
	{"F4": 1.0},
	{"0": 1.0},
	{"G4": 0.0},
	{"F4": 2.0}
]

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
			 			Object.values(notes[i])[0] * tempo +'" height="320"'+
			 			'style="fill:white;stroke:black;stroke-width:0.5" />'

			sumWidth+= Object.values(notes[i])[0] * tempo
			rectNotes += str
		}
	})
}

graph = '<svg width="800" height="800" version="1.1" xmlns="http://www.w3.org/2000/svg">'+
			'<line x1="0" x2="0" y1="0" y2="320" style="stroke:rgb(255,0,0);"/>'+
			'<line x1="0" x2="520" y1="320" y2="320" style="stroke:rgb(255,0,0);"/>'+
			'<line x1="0" x2="0" y1="0" y2="320" stroke-dasharray="4" style="stroke:rgb(0,0,0);">'+
			'<animate attributeType="HTML"  attributeName="x1" from="0" to="520"'+
            'dur="2s" repeatCount="indefinite"/>'+
            '<animate attributeType="HTML"  attributeName="x2" from="0" to="520"'+
            'dur="2s" repeatCount="indefinite"/>'+
            '</line>'+
			rectNotes+
		'</svg>'

document.getElementById("graph").innerHTML = graph;

})()
