var newsleep = require('system-sleep');
sleep = function(x) {
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


prompt = require('prompt');
//var sleep = require('sleep').sleep;
Roll = require('roll');
roll = new Roll();
clear = require('clear');
clear();

logicLibrary = require('./src/gamelogic.js');
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
			model = logicLibrary.tickMainCharacter(model);
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