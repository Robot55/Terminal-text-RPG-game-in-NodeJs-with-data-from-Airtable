var newsleep = require('system-sleep');
function sleep(x) {
    newsleep(x*1000)
}

var colors = require('colors/safe');

console.verbose = function() {
  if(process.argv[2]=="verbose") {
  	console.log.apply(null,arguments);
  }
}

display = function(){
	console.log.apply(null,arguments);
	var guessTime = parseInt(arguments[0].toString().length/25,10)
	if(guessTime > 1) {
	//	sleep( guessTime);
	} else {
	//	sleep(1);
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
// Get two properties from the user: username and password
//


// message string, propRequest string array, validatelogic precdicate, successCallback function
function requestFromUser(message,propRequest,validateLogic,successCallback) {
	display(message);
	//
	var prompt = require('prompt');
	prompt.start();
	prompt.get(propRequest, function (err, result) {
		//
		// Log the results.
		//
		console.verbose("You said:");
		console.verbose(result);
		if(validateLogic(result) || validateLogic==true) {
		  console.verbose("It passed validation");
			 return successCallback(result);
		} else {
			display("Did not validate! Try again:");
			 return requestFromUser(message,propRequest,validateLogic,successCallback);
		}
		prompt.stop();
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
  // Character Creation
  var ch = {
		name: "Benjy "+roll.roll("2d6").result,
		alive: true
	}
	
	
	
		return requestFromUser("Name?",['name'],function(result){
			return result.name!="";
		},function(result){
			ch.name = result.name;
		
			display("Assigning random attributes cause this is just a prototype atm");
			ch.STR = roll.roll("d100").result+9;
			ch.PER = roll.roll("d100").result+9;
			ch.END = roll.roll("d100").result+9;
			ch.INT = roll.roll("d100").result+9;
			ch.AGI = roll.roll("d100").result+9;
			//Introducing mana to chars with over 50 INT
			ch.mana = ch.INT > 50 ? Math.floor((ch.INT -40)/10) + roll.roll("d2").result-1 : 0
			display (ch.name + "starting Mana: "+ch.mana)
			
			// for class/archetype generation.
			//ch.archetype = roll.roll("d3").result
			//ch.archetype = ch.archetype ==1 ? "fighter" : ch.archetype==2 ? "mage" : "thief"
			display(ch.name +" is a " + ch.archetype)
			ch.level = 1
			display("Starting " + ch.name + " at level "+ch.level)
		
			return onFinished(ch);
		});
	
	
	
}

function isMainCharacterAlive() {
	return (model.playerCharacters[0].alive)
}

function tickMainCharacter() {
  
	
	var ch = model.playerCharacters[0];
	
	var currentRoom = model.world[ch.currentRoom];
	var rounds = model.rounds
	// There is a monster in the room!
	if(currentRoom.Monster) {
	  var monster  = currentRoom.Monster;
	  
	  // if monster has undefined mana - randomize some mana
	  if (monster.mana == undefined){
		  monster.mana = monster.INT > 50 ? Math.floor((monster.INT -40)/10) + roll.roll("d2").result-1 : 0
		  console.verbose("")
		  console.verbose(monster.name + " Mana set to: "+monster.mana)
	  }
	  // Display contextual message each tick (changes if beginning, middle or end of encounter

	  function displayEveryTickMessage (){
	  	var messageString = new String("");
	  	if (rounds == 0 || rounds == undefined){
	  		messageString +="NEW ROOM: " + ch.name +" has encountered a "+monster.name+" in "+currentRoom["Room Description"]
	  	} else {
	  		messageString += ch.name +" is engaging "+monster.name+" in "+currentRoom["Room Description"]	  		
	  	}
	  	return messageString
	  }
	  contextualText = displayEveryTickMessage()
	  display (contextualText)
	  //display(ch.name +" has encountered a "+monster.name+" in "+currentRoom["Room Description"]);
	  

		//console.verbose("start of Dave's place")
		console.verbose(ch)
		console.verbose (monster)
		
		// Create Turn Based Time
		if (rounds==undefined){
			model.rounds=0
		}
		
		if (rounds==0){
			display("")
			display("<<<<<<<< ROUND: "+rounds+" >>>>>>>>")
			ch.disabled=0
			monster.disabled=0

			// Basic Surprise Roll
			function surpriseCheckRoll (someone, someoneElse){
				someone.surpriseModifier=0
				someoneElse.surpriseModifier=0
				
				someoneModifiedRoll = roll.roll("d100").result + someone.AGI - someoneElse.PER
				someoneElseModifiedRoll = roll.roll("d100").result + someoneElse.AGI - someone.PER
				console.verbose("")
				console.verbose("??? Checking for Surprise ???")
				console.verbose(someone.name + " rolled " + someoneModifiedRoll + "for surprise")
				console.verbose(someoneElse.name + " rolled " + someoneElseModifiedRoll + "for surprise")

				if (someoneModifiedRoll > someoneElseModifiedRoll) {
					display("")
					display(someone.name + " managed to surprise the " +someoneElse.name)
					someone.surpriseModifier=10;
				} else if (someoneElseModifiedRoll > someoneModifiedRoll) {
					display("")
					display(someone.name + " managed to surprise the " +someoneElse.name)
					someoneElse.surpriseModifier=10;
				} else {
					console.verbose("")
					console.verbose("neither side managed to surprise the other")
				}
			}
			surpriseCheckRoll(ch, monster)
			model.rounds++
			
		} else if (rounds>0){
			display("")
			display("<<<<<<<< ROUND: "+rounds+" >>>>>>>>")
			
			// Basic Melee To Hit Roll

			function basicMeleeToHitRoll (attacker,defender,meleeHandycap){
				console.verbose("")
				console.verbose(attacker.name + " is attacking " + defender.name)
				//attacker modified roll
				attackerModifiedRoll = roll.roll("d100").result + Math.max(attacker.STR, attacker.AGI, 10) + attacker.surpriseModifier;
				attackerModifiedRoll -= attacker.wounds*8 || 0
				attackerModifiedRoll -= meleeHandycap || 0
				//defender modified roll
				defenderModifiedRoll = roll.roll("d100").result + defender.AGI;
				defenderModifiedRoll -= defender.wounds*8 || 0
				defenderModifiedRoll -= (defender.disabled > 0 ? 100 : 0) // -100 to defender if disabled
				
				console.verbose(">>> "+attacker.name+"'s NATURAL attack bonus is: "+ Math.max(attacker.STR, attacker.AGI, 10).toString())
				console.verbose(">>> "+attacker.name+"'s modified ATTACK roll: " + attackerModifiedRoll)
				console.verbose("<<< "+defender.name+"'s modified DEFENSE roll: " + defenderModifiedRoll)
				
				if (attacker.surpriseModifier != 0)	{
					attacker.surpriseModifier = 0
					console.verbose (attacker.name + "'s surprise modifier was used and will be set to 0 now")
				}

				if (attackerModifiedRoll > defenderModifiedRoll) {
					return "hit"
				} else {
					return "miss"	
				}


				

			}
			// basic Damage Roll
			function basicMeleeDamage (attacker, defender, baseDamage){
				modifiedDamage = baseDamage
				console.verbose("")
				console.verbose ("modified damage starts at: " + modifiedDamage)
				attackerDamageRoll = roll.roll("d100").result + attacker.STR
				defenderDamageRoll = roll.roll("d100").result + defender.END

				console.verbose(attacker.name + "'s STR modified roll is: " + attackerDamageRoll)
				console.verbose(defender.name + "'s END modified roll is: " + defenderDamageRoll)


				if((attackerDamageRoll - defenderDamageRoll) > 10){
					display("")
					display (attacker.name + " strikes a critical blow")
					modifiedDamage++;
					console.verbose ("modified damage boosted to: " + modifiedDamage)

				} else if ((defenderDamageRoll - attackerDamageRoll) >10){
					display("")
					display (defender.name + " withstands the force of the blow (DMG RESIST)")
					modifiedDamage--;
					console.verbose ("modified damage nerfed to: " + modifiedDamage)

				}
				if (modifiedDamage > 0){


					if (defender.wounds==undefined){
						defender.wounds=modifiedDamage
					} else {
						defender.wounds = defender.wounds + modifiedDamage
					}
				display("")
				display("xXx")
				display (defender.name + " winces in pain.")
				console.verbose (defender.name + " is hit for: " + modifiedDamage)
				display("xXx")
					
				} else { // if modified damage not larger than zero
					display("")
					display("xXx")
					display(defender.name + " shrugs off the blow")
					console.verbose (defender.name + " is 'hit' for: " + modifiedDamage)
					display("xXx")
					

				}
				
			}
			
			function checkIfDead (someone){
				if (someone.wounds>=3){
					return true
				} else {
					return false
				}
			}

// ================== All Possible Action Functions ================
			
			function doNothing(attemptor) {
				//use this for when stunned, disabled, mesmerized, etc.
				if (attemptor.disabled > 0){ // if char is doinf nothing because of disabled status
					attemptor.disabled--; // reduce disabled status by 1 round
				}
				display("")
				display(attemptor.name+" isn't doing anything...")
				
			}
			
			function melee(attemptor,target) { //use for basic melee attacks
				characterAttackRoll = basicMeleeToHitRoll(attemptor, target,0)
				
				if (characterAttackRoll=="hit"){ // if attemptor managed to hit target
					display("")
					display(attemptor.name + " hits " + target.name)
					basicMeleeDamage (attemptor, target, 1)
				} else { // if attemptor missed target
					display("")
					display(attemptor.name + " strikes at " + target.name + " but misses...")
				}

			}
			
			function wildAttack(attemptor,target) { // more likely to miss but more dmg
				characterAttackRoll = basicMeleeToHitRoll(attemptor, target,25)
				
				if (characterAttackRoll=="hit"){ // if attemptor managed to hit target
					display("")
					display(attemptor.name + " hits wildly at " + target.name)
					basicMeleeDamage (attemptor, target, 2)
				} else { // if attemptor missed target
					display("")
					display(attemptor.name + " strikes wildly at " + target.name + " but misses...")
				}

			}

			function sneak(attemptor,target) { 	// can be done on first round or when enemy disabled. 
												//lets player go to next room or monster to disable player for 1 round
				//check if succeed
				// if so do:
				if (attemptor == ch){
					//move to next room and set rounds to 0
					ch.currentRoom+=1;
					model.rounds=0
				} else {
					target.disabled=target.disabled==undefined ? 1 : target.disabled+1
				}
				display("")
				display("sneaking")
				
			}
			
			function castIllusion(attemptor,target) {
				//check if succeed
				// if so do:
				if (attemptor == ch){ // if attemptor is player character
					//move to next room and set rounds to 0
					ch.currentRoom+=1;
					model.rounds=0
				} else { //if attemptor is monster
					target.disabled=target.disabled==undefined ? 2 : target.disabled+2
				}
				display("")
				display(attemptor.name + "is casting Illusion")
				
			}
			
			function castLifeSkin(attemptor) {
				//check if succeed
				// if so do:
				attemptor.wounds-= roll.roll("12d").result
				display("")
				display(attemptor.name + "is casting LifeSkin")
				
			}
			
			
// =============== AI Decision Making Logic and Action Choosing =====================
			
			// All possible actions are here (action name and its corresponding func name)
			var possibleAllActions = [
				{
					"name":"do nothing",
					"actionFunction" : doNothing
				},
				{
					"name":"attack",
					"actionFunction" : melee
				},
				{
					"name":"wild attack",
					"actionFunction" : wildAttack
				},
				{
					"name":"sneak",
					"actionFunction" : sneak
				},
				{
					"name":"cast Illusion",
					"actionFunction" : castIllusion
				},
				{
					"name":"cast LifeSkin",
					"actionFunction" : castLifeSkin
				}
			]



			function priortize(character,opponent,action) {
				var modifiedPriority = 0;
				if(action=="sneak") {
					modifiedPriority = roll.roll("d10").result
					if (character.class=="sneaker")  {
						modifiedPriority+=50;
					}
					if (rounds==0)  {
						modifiedPriority+=60;
					}
					if (rounds>0 && character==ch && opponent.disabled<1)  {// if not first round character can't sneak but mobs can
					// if monster is disabled then player can try to sneak past it
						modifiedPriority-=999;
					}
					modifiedPriority += opponent.disabled*50
					modifiedPriority += character.wounds*15 || 0
					modifiedPriority += character.AGI/10 || 0
					modifiedPriority += (character.PER - opponent.PER) /10
					
					return modifiedPriority
				}

				if(action=="attack") { // normal melee attack
					modifiedPriority = roll.roll("d10").result
					if(character.class=="attacker") {
						modifiedPriority+=50;
					}
					
					modifiedPriority += opponent.disabled*50 || 0
					modifiedPriority -= character.wounds*15 || 0
					modifiedPriority += opponent.wounds*15 || 0
					modifiedPriority += character.STR/10 || 0
					modifiedPriority += character.STR-opponent.END/5
					
					return modifiedPriority
				}
				if(action=="wild attack") { // easier to dodge but more damage
					modifiedPriority = roll.roll("d10").result
					if(character.class=="attacker") {
						modifiedPriority+=50;
					}
					
					modifiedPriority += opponent.disabled*55 || 0
					modifiedPriority -= character.wounds*15 || 0
					modifiedPriority += opponent.wounds*15 || 0
					modifiedPriority += character.STR/10 || 0
					modifiedPriority += character.STR-opponent.END/5 || 0
					return modifiedPriority
				}
				if(action=="cast Illusion") { // disables target for 2 rounds. if cast by player they continue to next room
					modifiedPriority = roll.roll("d10").result
					if(character.class=="Wizz") {
						modifiedPriority+=50;
					}
					
					modifiedPriority -= opponent.disabled*50 || 0
					modifiedPriority += character.wounds*15 || 0
					modifiedPriority -= opponent.wounds*10 || 0
					modifiedPriority += character.INT/10 || 0
					
					return modifiedPriority
				}
				if(action=="do nothing") { // do nothing. usually triggered by stun, disable, and such
					modifiedPriority = roll.roll("d10").result
					
					if (character.disabled>0){
						modifiedPriority +=9999
					}
					if (20-character.PER > 0){
						modifiedPriority += 20-character.PER || 0
					}
					if (20-character.WIL > 0){
						modifiedPriority += 20-character.PER || 0
					}
					
					return modifiedPriority
				}
				if(action=="cast LifeSkin") { // heals 1-2 wounds. if healthy, grants 1-2 wounds protection for future damage
					modifiedPriority = roll.roll("d10").result
					if(character.class=="Wizz") {
						modifiedPriority+=50;
					}
					
					modifiedPriority -= opponent.disabled*5 || 0
					modifiedPriority += character.wounds*30 || 0
					modifiedPriority -= opponent.wounds*10 || 0
					modifiedPriority += character.INT/10 || 0
					
					return modifiedPriority
				}
				
			}


            /* dave STOP! go no further. You shall not pass. */


			var chActions = [];
			var monsterActions = [];

			for(var i in possibleAllActions) {
                var action = possibleAllActions[i];
                action.priority = priortize(ch,monster,action.name);
                chActions.push(action)

                var action2 = {}
                action2.name = possibleAllActions[i].name;
                action2.actionFunction = possibleAllActions[i].actionFunction
                action2.priority = priortize(monster,ch,action.name);
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

			chActions[0]["actionFunction"](ch,monster);

			monsterActions = monsterActions.sort(function(a,b){
				return b.priority-a.priority;
			})
			display("")
			display("--------")
			display(monster.name +"'s ACTION: "+monsterActions[0]["name"])
			display("--------")

			if(currentRoom.monster) monsterActions[0]["actionFunction"](monster,ch);
			sleep(3)
			console.verbose("")
			console.verbose("    ##### "+ch.name+"'s Priorities #####")
            console.verbose(chActions)
			console.verbose("")
			console.verbose("    ##### "+monster.name+"'s Priorities #####")
            console.verbose(monsterActions)
            sleep(3)


			
			
			console.verbose("checking to see if player is dead")
			if (checkIfDead(ch)){
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

			console.verbose("checking to see if monster is dead")

			if ( checkIfDead(monster)){ // if monster died
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
			
			if(rounds!=undefined){
				model.rounds++
			}


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
			console.verbose("")
			console.verbose("==========")
			console.verbose(" Playing tick frame #"+model.framesTicked);
			console.verbose("==========")
			display("");
			display("...");
			display("");
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