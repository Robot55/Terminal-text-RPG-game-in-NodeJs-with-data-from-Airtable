var newsleep = require('system-sleep');
sleep = function(x) {
    //newsleep(x*1000)
    return 0;
}

var colors = require('colors/safe');

console.verbose = function() {
  if(process.argv[2]=="verbose") {
  	console.log.apply(null,arguments);
  }
}


lastRequest = [];
display = function(){
	console.log.apply(null,arguments);
	lastRequest.push(JSON.stringify(arguments));
}


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


function isMainCharacterAlive() {
	return (model.playerCharacters[0].alive)
}









// Initialization




// the game's main loop is from char creation to death and then create another char



var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('client'))
var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.post('/createCharacter', function(req, res) {
    
    
    //soon: var aNewCharacter = req.body;
    
    var aNewCharacter = {}
    
    // in meantime:
    
    
		aNewCharacter.name = req.body.name || "Benjy";
	
		display("Assigning random attributes cause this is just a prototype atm");
		aNewCharacter.STR = roll.roll("d100").result+9;
		aNewCharacter.PER = roll.roll("d100").result+9;
		aNewCharacter.END = roll.roll("d100").result+9;
		aNewCharacter.INT = roll.roll("d100").result+9;
		aNewCharacter.AGI = roll.roll("d100").result+9;
		//Introducing mana to chars with over 50 INT
		aNewCharacter.mana = aNewCharacter.INT > 50 ? Math.floor((aNewCharacter.INT -40)/10) + roll.roll("d2").result-1 : 0
		display (aNewCharacter.name + "starting Mana: "+aNewCharacter.mana)
		
		// for class/archetype generation.
		//ch.archetype = roll.roll("d3").result
		//ch.archetype = ch.archetype ==1 ? "fighter" : ch.archetype==2 ? "mage" : "thief"
		display(aNewCharacter.name +" is a " + aNewCharacter.archetype)
		aNewCharacter.level = 1
		display("Starting " + aNewCharacter.name + " at level "+aNewCharacter.level)
		
		
  	
    
    model.playerCharacters.unshift(aNewCharacter);
		model.playerCharacters[0].currentRoom = 0;
		model.playerCharacters[0].alive = true;
    res.json({ message: 'Character is ready for action!' });   
});

router.get('/tick', function(req, res) {
    lastRequest = [];
    if(isMainCharacterAlive()) {
      model = logicLibrary.tickMainCharacter(model);
      res.json({ message: lastRequest, "model": model})
    } else {
    	res.json({ message: 'Last Character is dead - create a new one!' });   
    }
    
});

router.get('/model', function(req, res) {
    res.json({ message: model})
});


// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

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
		
		app.listen(port);
		// start the main loop!
		//return mainCreateCharacterDieLoop();
	})
})


// START THE SERVER
// =============================================================================

console.log('Magic happens on localhost, port ' + port);