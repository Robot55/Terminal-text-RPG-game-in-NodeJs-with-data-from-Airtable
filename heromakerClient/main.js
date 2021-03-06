//something
var app = new Vue({
  el: '#app',
  data: {
	api: {
	},
    character : {
            abilities:{  },
			class : {}
    },
	ui: {
		selectedAbility: false
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
	getClasses : function () {
		this.getBasicAPIEndpoint("classes");
	},
	getBasicAPIEndpoint : function(endpointName) {
		jQuery.getJSON( "http://www.dnd5eapi.co/api/"+endpointName, function( json ) {
			app.api[endpointName] = json.results;
			jQuery.each(app.api[endpointName],function( i ) {	
			app.hydrateObject(app.api[endpointName][i],function(hydratedObject){
					app.api[endpointName][i] = hydratedObject 
				});

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
    	app.ui.selectedAbility=ability
    },

    abilityRaise: function (ability){
    	console.log("plus one to: "+ability.name)
    	app.character.abilities[ability.name]++;

    },

    abilityLower: function (ability){
    	console.log("minus one to: "+ability.name)
    	app.character.abilities[ability.name]--;
    },
	setClass : function(charclass) {
		character.charclass = charclass;
	}

  }
  
})

$(document).ready(function(){
	app.getAbilities ();
	app.getClasses ();
})
