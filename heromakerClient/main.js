//something
var app = new Vue({
  el: '#app',
  data: {
	api: {
	},
    character : {
            abilities:{  },
            race: "noRace" 	
    },
	ui: {
		selectedAbility: false,
    selectedRace: false
	}
  },
  methods: {
    getAbilities: function () {
      	jQuery.getJSON( "http://www.dnd5eapi.co/api/ability-scores/", function( json ) {
	  		app.api.abilities = json.results;
	  		jQuery.each(app.api.abilities,function( i ) {	// for every ability in abilities, call me back with its index
  				app.hydrateObject(app.api.abilities[i],function(hydratedObject){ // call hydtate with an ability and a callback for the hydrated object
	  				app.api.abilities[i] = hydratedObject // <<-- Essentially THIS is the callback 
	  				app.ui.selectedAbility = app.api.abilities[i];

	  			});
				
				// Adding a new reactive property (i.e one not defined in the client skeleton)
				// add a new property to character.abilities, using ability's name and a default of 3d6;
				app.$set(app.character.abilities, app.api.abilities[i].name, d20.roll('3d6'));

			});



		});
    },
    getRaces: function () {
        jQuery.getJSON( "http://www.dnd5eapi.co/api/races/", function( json ) {
        app.api.races = json.results;
        jQuery.each(app.api.races,function( i ) { // for every ability in abilities, call me back with its index
          app.hydrateObject(app.api.races[i],function(hydratedObject){ // call hydtate with an ability and a callback for the hydrated object
            app.api.races[i] = hydratedObject // <<-- Essentially THIS is the callback 
            app.ui.selectedRace = app.api.races[i];
            if (i == 0){
              console.log ("just this once: ", app.ui.selectedRace )
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


      




    selectAbility: function (ability){
    	console.log(ability)
    	app.ui.selectedAbility=ability
    },

    abilityRaise: function (ability){
    	console.log("plus one to: "+ability.name)
    	app.character.abilities[ability.name]++;

    },

    abilityLower: function (ability){
    	console.log("minus one to: "+ability.name)
    	app.character.abilities[ability.name]--;
    }




  }
})

$( document ).ready(function() {
    app.getAbilities ();
    app.getRaces ();
});