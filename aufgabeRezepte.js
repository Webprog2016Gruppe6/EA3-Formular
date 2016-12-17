var databox, db;
function initiate(){
    databox = document.getElementById('databox');
    var button = document.getElementById('save');
	// fügt dem save Button ein clickevent hinzu das auf checkinput verweist
    button.addEventListener('click',  checkInput);
    
    // öffnen der indexDB 
    var request = indexedDB.open('aufgabeRezepte01');
	
	request.addEventListener('error', showerror);
	
	request.addEventListener('success', start);
	
    request.addEventListener('upgradeneeded', createdb);


}
function showerror(e){
    console.log('Error: ' + e.code + ' ' + e.message);
}
function start(e){
    db = e.target.result;
    show();
}
function createdb(e){
    var datababase = e.target.result;
    var mystore = datababase.createObjectStore('rezepte', {keyPath: 'rezeptname'});
    mystore.createIndex('SearchAutor', 'autorname', {unique: false});

}
    //addobject erzeugt aus den Benutzereingaben einen indexDB Eintrag und setzt diese anschließend zurück
function addobject(){

    var rezeptname  = document.getElementById('rezeptname').value;
    var autorname   = document.getElementById('autorname').value;
    var speiseart   = document.getElementById('sa').value;
	var zutaten     = document.getElementById('zeigeAnzahl').value;
    //prüft welcher Speisetyp gewählt wurde und legt diesen als wert der Variable speisetyp fest
	var radiobuttons = document.getElementsByClassName('radiobutton');
	for(var i=0; i<radiobuttons.length; i++){
	if (radiobuttons[i].checked){
    var speisetyp = radiobuttons[i].value;
    }
	}
    
	//indexDB wird mit lese/schreibrechten aufgerufen
	var mytransaction = db.transaction(['rezepte'], "readwrite");
    var mystore = mytransaction.objectStore('rezepte');
    mytransaction.addEventListener('complete', show);
	
	//schreibt eintrag mit benutzerdaten in indexDB
    var request = mystore.add({rezeptname: rezeptname, autorname: autorname, speiseart: speiseart, speisetyp: speisetyp, zutaten: zutaten});
    
	//Löschen der Eingaben wenn Daten gespeichert wurden.
    document.getElementById('rezeptname').value = '';
    document.getElementById('autorname').value= '';
    document.getElementById('sa').value= '';
	document.getElementById('zeigeAnzahl').value= '1';
	//setzt die Radiobutten Auswahl für "speisetyp" zurück
	for(var i=0; i<document.getElementsByClassName('radiobutton').length; i++){
    document.getElementsByClassName('radiobutton')[i].checked = false;
	}


}
//liest einträge aus indexDB aus
function show(){
	//leert die databox
    databox.innerHTML = '';
    var mytransaction = db.transaction(['rezepte']);
    var mystore = mytransaction.objectStore('rezepte');
    var newcursor = mystore.openCursor();
    newcursor.addEventListener('success', showlist);
}
// überträgt gefundene einträge aus indexDB in die Databox
function showlist(e){
    var cursor = e.target.result;
    if(cursor){
        databox.innerHTML += '<div>' + cursor.value.rezeptname + ' - ' + cursor.value.rezeptname + ' - ' + cursor.value.speiseart + '</div>';
        cursor.continue();
    }
}
//prüft Nutzereingaben und gibt Rückmeldung über Fehler
function checkInput(){
        var fehler = "";
        var speiseart = false;
        var speisetyp = false;

        /* prüfe auf Vorgaben Rezeptname
         * 
         */
        if(document.getElementById('rezeptname').value != ""){
            if (document.getElementById('rezeptname').value.length > 4){
            }else{
                fehler += "\nRezeptname zu kurz";
            }
        }else{
            fehler += "\nRezeptname darf nicht leer sein!";
        }
        // prüfe auf Vorgaben Autor
        if( document.getElementById('autorname').value != ""){
        }else{
            fehler += "\nAngabe Autor darf nicht leer sein!";
        }
        // prüfe auf Vorgaben Speiseart
        if(document.getElementById('sa').value == "Vorspeise" ||
            document.getElementById('sa').value == "Hauptspeise" ||
            document.getElementById('sa').value == "Dessert"){
            speiseart = true;
        }
		// prüfe auf Vorgabe Speisetyp
        var radiobuttons = document.getElementsByClassName('radiobutton')
		for(var i=0; i<radiobuttons.length; i++){
			if (radiobuttons[i].checked){
            speisetyp = true;
        }
		}


		// prüft ob zumindest Speiseart oder Speiseyp vorhanden
        if(speisetyp == false && speiseart == false){
            fehler += "\nBitte mindestens ein Speiseart bzw. Speisetyp angeben!";
        }
        // prüfe auf Angaben Zutaten
        if(document.getElementById('zeigeAnzahl').value < 1){
            fehler += "\nDas Rezept sollte mindestens eine Zutat enthalten!";
        }

        if (fehler == ""){
            addobject();
        } else {
            alert("Folgende(r) Fehler trat(en) auf!\n" + fehler);
            return false;
        }
    }

addEventListener('load', initiate);