//something
var app = new Vue({
  el: '#app',
  data: {
	api: {
	},
    character : {
            abilities:{  },
            race : {
              name: "noRace",
              ability_bonuses: {

              }
            }	
    },
	ui: {
		selectedAbility: false,
    selectedRace: false
	}
  },
  methods: {
    getAbilities: function (callback) {
      jQuery.getJSON( "http://www.dnd5eapi.co/api/ability-scores/", function( json ) {
	  		app.api.abilities = json.results;
	  		jQuery.each(app.api.abilities,function( i ) {	// for every ability in abilities, call me back with its index
  				app.hydrateObject(app.api.abilities[i],function(hydratedObject){ // call hydtate with an ability and a callback for the hydrated object
	  				app.api.abilities[i] = hydratedObject // <<-- Essentially THIS is the callback 
	  				app.ui.selectedAbility = app.api.abilities[i];

	  			})
				
				// Adding a new reactive property (i.e one not defined in the client skeleton)
				// add a new property to character.abilities, using ability's name and a default of 3d6;
				app.$set(app.character.abilities, app.api.abilities[i].name, d20.roll('3d6'));
         // this calls the callback NEXT FRAME so it don't block

			});
        setTimeout(callback,1);



		});
    },
    
    getRaces: function () {
        jQuery.getJSON( "http://www.dnd5eapi.co/api/races/", function( json ) {
        app.api.races = json.results;
        jQuery.each(app.api.races,function( i ) { // for every ability in abilities, call me back with its index
          app.hydrateObject(app.api.races[i],function(hydratedObject){ // call hydtate with an ability and a callback for the hydrated object

            var fixed = {};
            for(var j in app.api.abilities) {
              fixed[app.api.abilities[j].name] = hydratedObject.ability_bonuses[j]
            }
            hydratedObject.ability_bonuses = fixed;
            app.api.races[i] = hydratedObject // <<-- Essentially THIS is the callback 
            
            if (i == 0){

              console.log ("Got first race from json: ", app.ui.selectedRace )
              app.ui.selectedRace = app.api.races[i];
              //setCharacterRace(app.ui.selectedRace);
              app.character.race = app.ui.selectedRace
              console.log("char race not set to: ", app.character.race)
            }

            
           
          });
          
        

      });
        
        //app.character.race = "someRace" // ????
        //app.character.race = app.ui.selectedRace.name // ????

    });
    },
    // I get an object and a callback.
    // I callback with the hydratedObject
    hydrateObject: function (object, callback) {
    	jQuery.getJSON( object.url, callback);
    },

    setCharacterRace: function (race){
      console.log(race)
      app.character.race=race;
    },

    selectAbility: function (ability){
    	console.log(ability)
    	app.ui.selectedAbility=ability
    },

    selectNextRace: function (race){
      
      console.log("plus one to: "+ race.name, race.index)
      console.log("race index: ", race.index, "api.races.length: ", app.api.races.length)
      app.ui.selectedRace = race.index == app.api.races.length ? app.api.races[0] : app.api.races[race.index];
      app.character.race = app.ui.selectedRace;
      console.log("set to: "+ app.character.race.name, app.character.race.index)
    },    

    selectPrevRace: function (race){
      
      console.log("minus one to: "+ race.name, race.index)
      console.log("race index: ", race.index, "api.races.length: ", app.api.races.length)
      app.ui.selectedRace = race.index == 1 ? app.api.races[app.api.races.length-1] : app.api.races[race.index-2];
      app.character.race = app.ui.selectedRace;
      console.log("set to: "+ app.character.race.name, app.character.race.index)
    },    

    abilityRaise: function (ability){
    	console.log("plus one to: "+ability.name)
    	app.character.abilities[ability.name]++;

    },

    abilityLower: function (ability){
    	console.log("minus one to: "+ability.name)
    	app.character.abilities[ability.name]--;
    },
    getBonusName : function (bonus){
      //if((app.api.abilities)[bonus]) {
        return (app.api.abilities)[bonus].name
      //}
      //return "...";
    }



  }
})

$( document ).ready(function() {
    // get abilites AND THEN get races;
    app.getAbilities (app.getRaces);
    
});