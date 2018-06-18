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
	sleep(0.2)
}


prompt = require('prompt');
//var sleep = require('sleep').sleep;
Roll = require('roll');
roll = new Roll();
clear = require('clear');
clear();

gamelogic = require('./src/gamelogic.js');
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




display("Loading data ... ");

function startCharacterCreation(onFinished) {

	var aNewCharacter = gamelogic.characterCreation.createANewCharacter();
	return onFinished(aNewCharacter);
		
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
		
		var world = gamelogic.buildWorld(airtableData);
		
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

			console.verbose("..........................")
			console.verbose(" Playing tick frame #"+model.framesTicked);
			//console.verbose("............................")
			display("..........(tick)..........");
			model = gamelogic.tickMainCharacter(model);
			sleep(0.5);
		}
		display("                  _/ /)					")
		display("                 /\\\\/ )					")
		display("                 |/)\\)						")
		display("                  /\\_						")
		display("                  \\__|=					")
		display("                 (    )					")
		display("                 __)(__					")
		display("           _____/      \\\\_____				")
		display("          |                  ||			")
		display("          |  _     ___   _   ||			")
		display("          | | \\     |   | \\  ||			")
		display("          | |  |    |   |  | ||			")
		display("          | |_/     |   |_/  ||			")
		display("          | | \     |   |    ||			")
		display("          | |  \    |   |    ||			")
		display("          | |   \. _|_. | .  ||			")
		display("          |                  ||			")
		display("  *       | *   **    * **   |**      **	")
		display("   \\)),,))./.,(//,,..,,\\||(,,.,\\\\,.((//	")	
		display("")
		display("x X x  ALAS! The Hero named "+model.playerCharacters[0].name+" is dead!  x X x");
		display("")
		display("They join the long list of heroes who sacrificed their lives:")
		display("")
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