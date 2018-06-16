
Roll = require('roll');
roll = new Roll();

module.exports = {
	
	createANewCharacter: function() {
		var preTitles = ["Dr.","Mr/s.","Prof.","Reverend","Holy","Counselor","Uber","Supreme","King","Knight","Scholar","Pious","Ordained","Agent","","","","","","","","","","","","","",""]
		
		var names = ["Robot55","Benjy","Joe","Jack","Jill","Daz","Amotz","Keren","Mehmet","Jessica","Bwian","Doctor","Scott","Bambino","Eliran","Krishna","Jesus","Pope Francis","Jubei","Benedict","Corwin","Marquiz","Johnny","John","Indianna","Stevie", "Hans", "Minnie", "James", "Stringer", "Jimmy", "Avon","Frank","Nikki","Ziggy","Elric","Omar","Omar","John","Woody","Elric","Elvira","Dale","Arya","Eddard","Jaime","Meagor", "Aegon", "Aemon","Otto","Margeory","Deirdre","Grettel","Cersei","Sansa","Brienne","Froddo","Bilbo","Legolas","Smeagol"]
		
		var midTitles = ["Von","Ben","Eben","De","Du","Zee","Uber","Di","of","Le","La","Les","","","","","","","","","","","",""]
		
		var surNames = ["Kubrik","Cook","Plumber","Frags","Stein","Mataz","Albert","Morag","Hassan","Jones","Judaia","Disrespect","Manley","Bumbazzi","Vegh","Vishnu","Isiah","Pepondupulous","Nobunaga","Cabbagepatch","Cumberbatch","Amber", "Saade", "Jones","Cash","Wonder","Grueber", "Tekel Upharsin", "Bond", "Bell","McNulty","Barksdale","Sobotka","Sobbotka","Sobatka","Little", "Wayne","McClain","Polanski","Allen","Melnibone","Cooper","Targarien","Stark","Lannister","Mormont","Bismark","Tyrell","Tarth","Tarly","Baggins"]
		
		var sufTitles = ["Esquire","Junior","Senior","PHD","the Just","the Meek","the Cruel","the Blessed","","","","","","","","","",""]
		
		
		var aNewCharacter = {"alive":true,"level":1}
		aNewCharacter.name = preTitles[roll.roll("d"+preTitles.length).result-1]+" "+names[roll.roll("d"+names.length).result-1]+" "+midTitles[roll.roll("d"+midTitles.length).result-1]+" "+surNames[roll.roll("d"+surNames.length).result-1]+" "+sufTitles[roll.roll("d"+sufTitles.length).result-1];
		aNewCharacter.name = aNewCharacter.name.replace(/\s+/g,' ').trim(); // ensures just one space ebtween words in name
		
		display("Assigning random attributes cause this is just a prototype atm");
		aNewCharacter.STR = roll.roll("d100").result+9;
		aNewCharacter.PER = roll.roll("d100").result+9;
		aNewCharacter.END = roll.roll("d100").result+9;
		aNewCharacter.INT = roll.roll("d100").result+9;
		aNewCharacter.AGI = roll.roll("d100").result+9;
		
		//Introducing mana to chars with over 50 INT
		aNewCharacter.mana = aNewCharacter.INT > 50 ? Math.floor((aNewCharacter.INT -40)/10) + roll.roll("d2").result-1 : 0
		display (aNewCharacter.name + " starting Mana: "+aNewCharacter.mana)
		display(aNewCharacter.name +" is a " + aNewCharacter.archetype)
		display("Starting " + aNewCharacter.name + " at level "+aNewCharacter.level)
		display("")
		
		return aNewCharacter;
	}
}