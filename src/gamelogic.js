

var actions = require('./gamelogic/actions.js');
var calculations = require('./gamelogic/calculations.js');
var characterCreation = require('./gamelogic/characterCreation.js');


var Roll = require('roll'),
  roll = new Roll();
  



function buildWorld(airtableData) {

	console.log(airtableData)

	function getRandomRoomByLevel(level,airtableData) {
		
		var possibleRooms = airtableData["Rooms"].filter(function(room){
			return (room.level == level)
		})
			
		return possibleRooms[roll.roll("d"+possibleRooms.length).result-1];
	}

	function getRandomMonsterByLevel(level,airtableData) {
		
		var possibleMonsters = airtableData["Monsters"].filter(function(monster){
			return (monster.level == level)
		})
			
		return possibleMonsters[roll.roll("d"+possibleMonsters.length).result-1];
	}
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
    hydratedRoom = getRandomRoomByLevel(Math.max(1,theroll),airtableData) 
    while(hydratedRoom==undefined) {
    	hydratedRoom = getRandomRoomByLevel(1,airtableData) 
    }
    
    // get a monster between max and min level
    var monsterLevel = hydratedRoom.minMonsterLevel; 
    var diceRange = hydratedRoom.maxMonsterLevel- hydratedRoom.minMonsterLevel;
    if(diceRange>0) {
    	monsterLevel+=roll.roll('d'+diceRange).result 
    }
    hydratedRoom["Monster"] = getRandomMonsterByLevel(monsterLevel,airtableData) || getRandomMonsterByLevel(1,);
    
  	world.push(hydratedRoom);
  }
  return world;
}

function tickMainCharacter(model) {
	var ch = model.playerCharacters[0];
	//initialization of CHAR stats if undefined
	ch.wounds = ch.wounds == undefined ? 0 : ch.wounds // when tick start, if character has no wounds value set it to 0 (unharmed)
	ch.disabled = ch.disabled == undefined ? 0 : ch.disabled // when tick start, if character has no disabled value set it to 0 (free to act)
	
	var currentRoom = model.world[ch.currentRoom];
	// There is a monster in the room!
	if(currentRoom.Monster) {
		var monster  = currentRoom.Monster;
		//initialization of MONSTER stats if undefined
		monster.wounds = monster.wounds == undefined ? 0 : monster.wounds // if monster exists in room, set its wounds to 0  if it is undefined
		monster.disabled = monster.disabled == undefined ? 0 : monster.disabled // if monster exists in room, set its disabled to 0  if it is undefined
	  
		// if monster has undefined mana - randomize some mana
		if (monster.mana == undefined){
			
			monster.mana = monster.INT > 50 ? Math.floor((monster.INT -40)/10) + roll.roll("d2").result-1 : 0
			console.verbose("MONSTER MANA generation:")
			console.verbose("    "+monster.name + " Mana set to: "+monster.mana)
		}
	  
		// Function to construct contextual message each tick (changes if beginning, middle or end of encounter
		function displayEveryTickMessage (){
			var messageString = new String("");
			if (model.rounds == 0 || model.rounds == undefined){
				messageString +="NEW ROOM: " + ch.name +" has encountered a "+monster.name+" in "+currentRoom["Room Description"]
			} else {
				messageString += ch.name +" is engaging "+monster.name+" in "+currentRoom["Room Description"]	  		
			}
			return messageString
		}
		
		//Actually display contextual ENCOUNTER MESSAGE
		contextualText = displayEveryTickMessage()
		//display("")
		//display("==========================================")
		display("")
		if (contextualText.includes("NEW ROOM")) {
		display("	     _I_													")
	    display("           .~'_`~.												")
	    display("     /(  ,^ .~ ~. ^.  )\\										")
	    display("     \\ \\/ .^ |   ^. \\/ /									")
	    display("      Y  /   |     \\  Y            ___.oOo.___ 				")
	    display("      | Y    |      Y |           |           |				")
	    display("      | |    |      | |           |   N E W   |				")
	    display("      | |   _|___   | |           |           |				")
	    display("      | |  /____/|  | |           |  R O O M  |				")
	    display("      |.| |   __/|__|.|           |           |				")
	    display("      |.| |   __/|  |.|          _|___________|_ 				")
	    display("      |:| |   __//  |:|         '^^^^^^^^^^^^^^^`				")
	    display("      |:| |_____/   |:|										")
	    display("  ____|_|/          |_|_____________________________ 			")
	    display("  ____]H[           ]H[_____________________________ 			")
	    display("       /             \\ 										")
		}
		display (contextualText)
		//display("==========================================")
		sleep(1)
		display("")

	  

		//Dump Json of both player and monster
		console.verbose("### "+ch.name.toUpperCase() + " DUMP:")
		console.verbose(ch)
		console.verbose("")
		console.verbose ("### "+monster.name.toUpperCase() + " DUMP:")
		console.verbose (monster)
		console.verbose("")
		
		// Create Turn Based Time
		if (model.rounds==undefined){
			model.rounds=0
		}
		
		if (model.rounds==0){
			display("<<<<<<<< ROUND: "+model.rounds+" >>>>>>>>")
			ch.disabled=0
			monster.disabled=0

			
			calculations.surpriseCheckRoll(ch, monster)
			model.rounds++
			
		} else if (model.rounds>0){
			display("<<<<<<<< ROUND: "+model.rounds+" >>>>>>>>")
			
			var possibleAllActions = actions.getAllActions();
			

			var chActions = [];
			var monsterActions = [];

			for(var i in possibleAllActions) {
				var action = possibleAllActions[i];
				action.priority = action.priorityFunction(ch,monster,action.name,model);
				chActions.push(action)

				var action2 = {}
				action2.name = possibleAllActions[i].name;
				action2.actionFunction = possibleAllActions[i].actionFunction
				action2.priorityFunction = possibleAllActions[i].priorityFunction
				action2.priority = action2.priorityFunction(monster,ch,action.name,model);
				monsterActions.push(action2)
			}



			// go over every possible attack
			// figure out the priority of each one

			// pick highest prio:
			chActions = chActions.sort(function(a,b){
				return b.priority-a.priority;
			})
			display("")
			display("--------------------------")
			display(ch.name +"'s ACTION: "+chActions[0]["name"])
			display("--------------------------")

			chActions[0]["actionFunction"](ch,monster,model); //Execute character action

			monsterActions = monsterActions.sort(function(a,b){
				return b.priority-a.priority;
			})
			display("")
			display("--------------------------")
			display(monster.name +"'s ACTION: "+monsterActions[0]["name"])
			display("--------------------------")

			if(!calculations.checkIfDead(monster)){ //if monster didn't suffer enough wounds to die from character action
			monsterActions[0]["actionFunction"](monster,ch,model); //Execute monster action
			} else {
				console.verbose("!! ATTN !! " + monster.name + "would have acted now but suffered enough wounds to die")
			}
			
			//sleep(3)
			console.verbose("-- PRIORITY CALCULATIONS --")
			console.verbose("")
			console.verbose("    "+ch.name.toUpperCase()+"'s Priorities dump:")
			console.verbose(chActions)
			console.verbose("")
			console.verbose("    "+monster.name.toUpperCase()+"'s Priorities dump:")
			console.verbose(monsterActions)
			console.verbose("")
			//sleep(3)


			function ifPlayerIsDead(){	
				console.verbose("DEATH CHECK: "+ch.name)
				if (calculations.checkIfDead(ch)){
					console.verbose("    "+ch.name + " is dead")
					model.world[ch.currentRoom].tombstone = ch;
					console.verbose("    creating Tombstone")
					ch.causeOfDeath = monster.name;
					ch.placeOfDeath = model.world[ch.currentRoom["Room Description"]];
					console.verbose("    setting Player Alive flag to false")
					ch.alive = false;
					model.rounds=0
				} else {
					console.verbose ("    "+ch.name + " is alive")
				}
			}
			
			function ifMonserIsDead(){
				console.verbose("checking to see if monster is dead")

				if ( calculations.checkIfDead(monster)){ // if monster died
					console.verbose("    "+monster.name + " is dead")
					display (monster.name + " was KILLED from " +monster.wounds + " wounds")
					sleep(1)
					model.world[ch.currentRoom].Monster = false;
				}  else {
					console.verbose ("    "+monster.name + " is alive")
				}
				
				if(model.rounds!=undefined){
					model.rounds++
				}
				
			}
		
			ifPlayerIsDead()
			ifMonserIsDead()
		
		// end of COMBAT PHASE	
		}
				
		
		//console.verbose("End of Dave's place")
		model.playerCharacters[0] = ch;
		console.verbose("")
		console.verbose("PLAYER STATUS at end of Tick:")
		console.verbose(model.playerCharacters[0]);
		console.verbose("")
	} else {
		// no monsters in the room
		// this is where you could get loot
		// for now you just go right in to the next room
		model.playerCharacters[0].currentRoom+=1;
		model.rounds=0
		
		if(model.playerCharacters[0].currentRoom>=model.world.length) {
			// you finished the dungeon!
			clear();
			model.rounds=undefined

			display("                       /^\             ")
			display("                       | |             ")
			display("                       |-|             ")
			display("                  /^\  | |             ")
			display("           /^\  / [_] \+-+             ")
			display("          |---||-------| |             ")
			display(" _/^\_    _/^\_|  [_]  |_/^\_   _/^\_  ")
			display(" |___|    |___||_______||___|   |___|  ")
			display("  | |======| |===========| |=====| |   ")
			display("  | |      | |    /^\    | |     | |   ")
			display("  | |      | |   |   |   | |     | |   ")
			display("  |_|______|_|__ |   |___|_|_____|_|   ")

			display("")
			display("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
			display("$ Congratulations! You Conquered the castle! $");
			display("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
			display("")
			display("Your history: ");
			display(model.playerCharacters);
			sleep(3)
			prcoess.exit();
		}
		
	}
	
	if(!model.playerCharacters[0].alive) {
		model.playerCharacters[0].timeOfDeath = model.framesTicked;
		
	}
	
	model.framesTicked += 1;
	return model;
}
	
module.exports = {};
module.exports["buildWorld"] = buildWorld;
module.exports["tickMainCharacter"] = tickMainCharacter;
module.exports["characterCreation"] = characterCreation