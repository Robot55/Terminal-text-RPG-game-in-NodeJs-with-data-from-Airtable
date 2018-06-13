var newsleep = require('system-sleep');
function sleep(x) {
    newsleep(x*1000)
}
/*
prompt.get([{
		name: 'username',
		required: true
	}, {
		name: 'password',
		required: true,
		conform: function (value) {
			console.log("passed validation")
			return true;
		}
	}], function (err, result) {
	//
	// Log the results.
	//
	console.log('Command-line input received:');
	console.log('  username: ' + result.username);
	console.log('  password: ' + result.password);
});
*/


// make a world with rooms, treasures, and monsters

// create a character in interactive terminal

// have the character traverse rooms
// room - enter the room, pick the room card event (spawn monster)
// initative check
// whoever wins hits first
// keep hitting in initiative order until someone dies
//      hitting - everyone has one attack called basic, using primary attr
//                if the char has a different attack (i.e. from loot)
//                he gets that
// if character dies - "Johan has died on the 3rd room"
// if monster dies - "Johan has killed a monster in the 3rd room"
// give johan a treasure card - treasure cards give xp which grant 2
// points to prim attr, 1 to minor, 0 to opposite


// Strength Speed Mind


// load the rooms and monsters from airtable

// log it to json


console.verbose = function() {
  if(process.argv[2]=="verbose") {
  	console.log.apply(null,arguments);
  }
}

display = function(){
	console.log.apply(null,arguments);
	var guessTime = parseInt(arguments[0].toString().length/25,10)
	if(guessTime > 1) {
		sleep( guessTime);
	} else {
		sleep(1);
	}
	
}


var prompt = require('prompt');
//var sleep = require('sleep').sleep;
var Roll = require('roll'),
  roll = new Roll();
 var clear = require('clear');
clear();
//
// Start the prompt
//
prompt.start();

//
// Get two properties from the user: username and password
//


// message string, propRequest string array, validatelogic precdicate, successCallback function
function requestFromUser(message,propRequest,validateLogic,successCallback) {
	console.log(message);
	prompt.get(propRequest, function (err, result) {
		//
		// Log the results.
		//
		console.verbose("You said:");
		console.verbose(result);
		if(validateLogic(result)) {
		  console.verbose("It passed validation");
			return successCallback(result);
		} else {
			display("Did not validate! Try again:");
			return requestFromUser(message,propRequest,validateLogic,successCallback);
		}
	});
}

//requestFromUser("Welcome to HeroMaker!");

display("Welcome to HeroMaker");


// let's connect to airtable
var Airtable = require('airtable');
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: 'keyuxZHh1y0zrqi6c'
});
var base = Airtable.base('appxFxq0k8ytrdX8I');



var airtableData = {}

function loadEntireBaseIntoAirtableData(baseName,onLoaded) {
  airtableData[baseName] = []
	base(baseName).select({
			maxRecords: 1000,
			view: "Grid view"
	}).eachPage(function page(records, fetchNextPage) {
			// This function (`page`) will get called for each page of records.

			records.forEach(function(record) {
					//console.log('Retrieved', record.fields);
					airtableData[baseName].push(record.fields);
			});

			// To fetch the next page of records, call `fetchNextPage`.
			// If there are more records, `page` will get called again.
			// If there are no more records, `done` will get called.
			fetchNextPage();

	}, function done(err) {
			if (err) { console.error(err); return; }
		  
		  onLoaded();
	});
}


function getRandomRoomByLevel(level) {
	
	var possibleRooms = airtableData["Rooms"].filter(function(room){
		return (room.level == level)
	})
		
	return possibleRooms[roll.roll("d"+possibleRooms.length).result-1];
}

function getRandomMonsterByLevel(level) {
	
	var possibleMonsters = airtableData["Monsters"].filter(function(monster){
		return (monster.level == level)
	})
		
	return possibleMonsters[roll.roll("d"+possibleMonsters.length).result-1];
}



function buildWorld() {
	// generate d6 level 1 rooms
  var world = []; // a list of rooms
  var numberOfRooms = 50;//roll.roll('2d6').result;
  
  console.verbose("Generating "+numberOfRooms+" rooms")
  
  for(var i = 0;i<numberOfRooms;i++) {
    
    var hydratedRoom = {}
    var theroll = roll.roll('1d4').result
    
    // first levels handicap
    if(i<3) {
    	theroll-=1;
    }
    if(i<5) {
    	theroll-=1;
    }
    hydratedRoom = getRandomRoomByLevel(Math.max(1,theroll)) 
    while(hydratedRoom==undefined) {
    	hydratedRoom = getRandomRoomByLevel(1) 
    }
    
    // get a monster between max and min level
    var monsterLevel = hydratedRoom.minMonsterLevel; 
    var diceRange = hydratedRoom.maxMonsterLevel- hydratedRoom.minMonsterLevel;
    if(diceRange>0) {
    	monsterLevel+=roll.roll('d'+diceRange).result 
    }
    hydratedRoom["Monster"] = getRandomMonsterByLevel(monsterLevel) || getRandomMonsterByLevel(1);
    
  	world.push(hydratedRoom);
  }
  return world;
}

display("Loading data ... ");

function startCharacterCreation(onFinished) {
  display("Create your character!");
  
  var ch = {
		name: "Benjy "+roll.roll("2d6").result,
		alive: true
	}
	
	
	
		requestFromUser("Name?",['name'],function(result){
			return result.name!="";
		},function(result){
			ch.name = result.name;
		
			display("Assigning random attributes cause this is just a prototype atm");
			ch.STR = roll.roll("d100").result+9;
			ch.PER = roll.roll("d100").result+9;
			ch.END = roll.roll("d100").result+9;
			ch.INT = roll.roll("d100").result+9;
			ch.AGI = roll.roll("d100").result+9;
			
			ch.level = 1
			display("Starting " + ch.name + " at level"+ch.level)
		
			onFinished(ch);
		});
	
	
	
}

function isMainCharacterAlive() {
	return (model.playerCharacters[0].alive)
}

function tickMainCharacter() {
  
	
	var ch = model.playerCharacters[0];
	
	var currentRoom = model.world[ch.currentRoom];
	
	// There is a monster in the room!
	if(currentRoom.Monster) {
	  var monster  = currentRoom.Monster;
	  display(ch.name +" has encountered a "+monster.name+" in "+currentRoom["Room Description"]);
	  
/*	  
		
		// fight loop
		
		var playerRoll = roll.roll("d6");
		var playerStrengthModified = ch.strength+playerRoll.result;
		
		if(currentRoom.tombstone) {
		  playerStrengthModified+=parseInt(monster.strength/3);
	  	display("The fallen corpse of "+currentRoom.tombstone.name+" in this place gives you extra strength!");
	  }
		
		display(ch.name+" rolled "+playerRoll.result+" for a total strength of "+playerStrengthModified);
		
		
		var monsterRoll = roll.roll("d6");
		var monsterStrengthModified = monster.strength+monsterRoll.result;
		display(monster.name+" rolled "+monsterRoll.result+" for a total strength of "+monsterStrengthModified);
		
		
		
		if(playerStrengthModified > monsterStrengthModified) {
			display(ch.name +" has overcome the "+monster.name+" in room #"+ch.currentRoom+"!");
			var xpRoll = {result:1}; //roll.roll('d3');
			display(ch.name +" gains "+xpRoll.result+" Strength!");
			ch.strength+=xpRoll.result;
			delete model.world[ch.currentRoom].Monster;
			
		} else {
			display(ch.name+" has fallen to the "+monster.name+"'s blade!");
			model.world[ch.currentRoom].tombstone = ch;
			ch.causeOfDeath = monster.name;
			ch.placeOfDeath = model.world[ch.currentRoom].name;
			ch.alive = false;
		}
		*/
		console.verbose("start of Dave's place")
		console.verbose(ch)
		console.verbose (monster)
		
		if (currentRoom.phase==undefined){
			currentRoom.phase="surprise"
		}
		display("The phase is", currentRoom.phase)
		if (currentRoom.phase=="surprise"){
			// caculate surprise
			
			function surpriseCheckRoll (someone, someoneElse){
				someone.surpriseModifier=0
				someoneElse.surpriseModifier=0
				
				someoneModifiedRoll = roll.roll("d100").result + someone.AGI - someoneElse.PER
				someoneElseModifiedRoll = roll.roll("d100").result + someoneElse.AGI - someone.PER
				
				if (someoneModifiedRoll > someoneElseModifiedRoll){
					display(someone.name + " managed to surprise the " +someoneElse.name)
					someone.surpriseModifier=10;
				} else if (someoneElseModifiedRoll > someoneModifiedRoll){
					display(someone.name + " managed to surprise the " +someoneElse.name)
					someoneElse.surpriseModifier=10;
				} else {
					console.verbose("neither side managed to surprise the other")
				}
			}
			
			surpriseCheckRoll(ch, monster)

			currentRoom.phase="combat"
		} else if (currentRoom.phase=="combat"){
			
			
			function basicMeleeToHitRoll (attacker,defender){
				console.verbose(attacker.name + " is attacking " + defender.name)
				attackerModifiedRoll = roll.roll("d100").result + Math.max(attacker.STR, attacker.AGI, 10) + attacker.surpriseModifier;
				defenderModifiedRoll = roll.roll("d100").result + defender.AGI;
				
				console.verbose("Natural attack bonus is: "+ Math.max(attacker.STR, attacker.AGI, 10).toString())
				console.verbose("modified atk roll: " + attackerModifiedRoll)
				console.verbose("modified def roll: " + defenderModifiedRoll)
				
				if (attackerModifiedRoll > defenderModifiedRoll){
					return "hit"}
				else return "miss"			
				}
			
			function basicMeleeDamage (attacker, defender){
				modifiedDamage = 1
				attackerDamageRoll = roll.roll("d100").result + attacker.STR
				defenderDamageRoll = roll.roll("d100").result + defender.END;
				
				if(attackerDamageRoll > defenderDamageRoll){
					display ("attacker drives home the hit")
					modifiedDamage++;
				} else if (defenderDamageRoll > attackerDamageRoll){
					modifiedDamage--;
				}
				
				if (defender.wounds==undefined){
					defender.wounds=(modifiedDamage || 1)
				} else {
					defender.wounds = defender.wounds + modifiedDamage
				}
			}
			
			function checkIfDead (someone){
				if (someone.wounds>=3){
					return true
				} else {
					return false
				}
			}
			// character attacks monster
			characterAttackRoll = basicMeleeToHitRoll(ch, monster)
			monsterAttackRoll = basicMeleeToHitRoll(monster, ch)
			
			if (characterAttackRoll=="hit"){
				display(ch.name + " hits " + monster.name)
				basicMeleeDamage (ch, monster)
			} else {
				display(ch.name + " strikes at " + monster.name + " but misses...")
			}
			//check if monster dead
			if (checkIfDead(monster)){
				display(monster.name + " has died")
				delete model.world[ch.currentRoom].Monster;
				
			} else { //if not dead monster attacks
				if (monsterAttackRoll=="hit"){
					display(monster.name + " hits " + ch.name)
					basicMeleeDamage (monster, ch)
				} else {
					display (monster.name + " strikes at " + ch.name + " but misses...")
				}
			
			}
			
			if (checkIfDead(ch)){
				display(ch.name + " has died")
				model.world[ch.currentRoom].tombstone = ch;
				ch.causeOfDeath = monster.name;
				ch.placeOfDeath = model.world[ch.currentRoom].name;
				ch.alive = false;
			}
			
		}
				
		
		console.verbose("End of Dave's place")
		model.playerCharacters[0] = ch;
		console.verbose(model.playerCharacters[0]);
	} else {
		// no monsters in the room
		// this is where you could get loot
		// for now you just go right in to the next room
		model.playerCharacters[0].currentRoom+=1;
		
		if(model.playerCharacters[0].currentRoom>=model.world.length) {
			// you finished the dungeon!
			clear();
			display("You won the game! all monsters are dead");
			display("Your history: ");
			display(model.playerCharacters);
			prcoess.exit();
		}
		
	}
	
	if(!model.playerCharacters[0].alive) {
		model.playerCharacters[0].timeOfDeath = model.framesTicked;
		
	}
	
	model.framesTicked += 1;
}







// Initialization

var model = {};

loadEntireBaseIntoAirtableData("Rooms",function(){
	loadEntireBaseIntoAirtableData("Monsters",function(){
		console.verbose("Loaded Airtable Data!");
		console.verbose(airtableData);
		
		console.verbose("Building World....");
		
		var world = buildWorld(airtableData);
		
		console.verbose("The World:");
		console.verbose(world);
		
		model = {
			"playerCharacters" : [], // a stack, newest (i.e. alive) char is first
			"world": world,
			"framesTicked": 0
		}
		
		display("Looking out, you see a road winding through:");
		for(var i in world) {
			console.log(world[i]["Room Description"]);
		}
		
		// start the main loop!
		return mainCreateCharacterDieLoop();
	})
})


// the game's main loop is from char creation to death and then create another char

function mainCreateCharacterDieLoop() {
	startCharacterCreation(function(aNewCharacter){
		display("Character creation finished:");
		display(aNewCharacter);
		model.playerCharacters.unshift(aNewCharacter);
		model.playerCharacters[0].currentRoom = 0;
	
		while(isMainCharacterAlive()) {
			console.verbose("Playing frame #"+model.framesTicked);
			display("...");
			tickMainCharacter();
			sleep(1);
		}
	 
		display("The Hero named "+model.playerCharacters[0].name+" is dead!");
		
		display("They join the long list of heroes who sacrificed their lives:")
		for(var i in model.playerCharacters) {
		  var pcLevel = model.playerCharacters[i].level;
			display(model.playerCharacters[i].name+"\t\t\t who died at level \t"+pcLevel+"\tbecause of a  \t"+model.playerCharacters[i].causeOfDeath);
		}
		
		display("------- Please Wait 5 Seconds -------")
		sleep(5);
		 clear();
		display("Create a new character or press Ctrl C to exit.");
		display("--------------")
	  return mainCreateCharacterDieLoop();
	})
}