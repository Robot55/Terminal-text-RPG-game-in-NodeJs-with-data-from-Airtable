
Roll = require('roll');
roll = new Roll();

module.exports = {
	
	createANewCharacter: function() {
		var names = ["Robot55","Benjy","Joe","Jack","Jill","Daz","Amo","Anana","Mehmet","Jessica"]
		var aNewCharacter = {"alive":true,"level":1}
		aNewCharacter.name = names[roll.roll("d"+names.length).result-1]+" "+roll.roll("d10").result;
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
		
		
		return aNewCharacter;
	}
}