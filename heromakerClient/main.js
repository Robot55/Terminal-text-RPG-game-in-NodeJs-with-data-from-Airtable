//something
var app = new Vue({
  el: '#app',
  data: {
    abilities: [
      {
			"name": "loading...",
			"url": "http://www.dnd5eapi.co/api/ability-scores/1"
		}
    ],
    selectedAbility: false
  },
  methods: {
    getAbilities: function () {
      	jQuery.getJSON( "http://www.dnd5eapi.co/api/ability-scores/", function( json ) {
	  		app.abilities = json.results;

	  		jQuery.each(app.abilities,function( i ) {	// for every ability in abilities, call me back with its index

  				app.hydrateObject(app.abilities[i],function(hydratedObject){ // call hydtate with an ability and a callback for the hydrated object
	  				app.abilities[i] = hydratedObject // <<-- Essentially THIS is the callback 
	  				app.selectedAbility = app.abilities[i];

	  			});

	  			app.character.abilities[app.abilities[i].name] = d20.roll('3d6')

			});



		});
    },
    // I get an object and a callback.
    // I callback with the hydratedObject
    hydrateObject: function (object, callback) {
    	jQuery.getJSON( object.url, callback);
    },
    selectAbility: function (ability){
    	console.log(ability)
    	app.selectedAbility=ability
    },

    abilityRaise: function (ability){
    	console.log("plus one to: "+ability.name)
    	app.character.abilities[ability.name]++;
    },

    abilityLower: function (ability){
    	console.log("minus one to: "+ability.name)
    	app.character.abilities[ability.name]--;
    },

    createBlankCharacter: function (){
    	app.character = {
    		abilities:{}
    	}
    }




  }
})

$( document ).ready(function() {
    app.createBlankCharacter ();
    app.getAbilities ();
});