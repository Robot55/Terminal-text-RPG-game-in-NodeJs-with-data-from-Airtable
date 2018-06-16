

var actions = require('./gamelogic/actions.js');
var calculations = require('./gamelogic/calculations.js');
var characterCreation = require('./gamelogic/characterCreation.js');


var Roll = require('roll'),
  roll = new Roll();
  



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
		display (contextualText)
	  

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
			display("--------")
			display(ch.name +"'s ACTION: "+chActions[0]["name"])
			display("--------")

			chActions[0]["actionFunction"](ch,monster,model); //Execute character action

			monsterActions = monsterActions.sort(function(a,b){
				return b.priority-a.priority;
			})
			display("")
			display("--------")
			display(monster.name +"'s ACTION: "+monsterActions[0]["name"])
			display("--------")

			if(!calculations.checkIfDead(monster)){ //if monster didn't suffer enough wounds to die from character action
			monsterActions[0]["actionFunction"](monster,ch,model); //Execute monster action
			} else {
				console.verbose("!! ATTN !! " + monster.name + "would have acted now but suffered enough wounds to die")
			}
			
			sleep(3)
			console.verbose("-- PRIORITY CALCULATIONS --")
			console.verbose("    "+ch.name.toUpperCase()+"'s Priorities dump")
			console.verbose(chActions)
			console.verbose("")
			console.verbose("    "+monster.name.toUpperCase()+"'s Priorities dump")
			console.verbose(monsterActions)
			console.verbose("")
			sleep(3)


			function ifPlayerIsDead(){	
				console.verbose("checking to see if player is dead")
				if (calculations.checkIfDead(ch)){
					display("")
					display("xXx")
					display(ch.name + " has died")
					display("xXx")
					model.world[ch.currentRoom].tombstone = ch;
					ch.causeOfDeath = monster.name;
					ch.placeOfDeath = model.world[ch.currentRoom].name;
					ch.alive = false;
					model.rounds=0
				} else {
					console.verbose("")
					console.verbose (ch.name + " is alive")
				}
			}
			
			function ifMonserIsDead(){
				console.verbose("checking to see if monster is dead")

				if ( calculations.checkIfDead(monster)){ // if monster died
					display("")
					display("xXx")
					display (monster.name + " has died from " +monster.wounds + " wounds")
					display("xXx")
					sleep(1)
					model.world[ch.currentRoom].Monster = false;
				}  else {
					console.verbose("")
					console.verbose (monster.name + " is alive")
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
		console.verbose(model.playerCharacters[0]);
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
			display("")
			display("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
			display("$ You won the game! all monsters are dead! $");
			display("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
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
module.exports["tickMainCharacter"] = tickMainCharacter;
module.exports["characterCreation"] = characterCreation