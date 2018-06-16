

window.gamedata = {
	"data": {
		"messageHistory":["Hi"],
		"model":{
			"playerCharacters":[{currentRoom:0}],
			"world" : [{Monster:""}]
		}
	}
};


var app = new Vue({
  el: '#app',
  data:  gamedata,
  methods : {
	  createCharacter : function() {
		  $.post("/api/createCharacter",{"name":"Benjy"},function(data){
			  if(typeof(data.message)=="string") {
				  gamedata.data.messageHistory.push(data.message);
			  } else {
				 for(var i in data.message) {
				   gamedata.data.messageHistory.push(JSON.parse(data.message[i])["0"]);
				}
			  }
			  
			 
			  gamedata.data.model = data.model;
		  })
	  },
	  nextTick : function() {
		  $.getJSON("/api/tick",function(data){
			  if(typeof(data.message)=="string") {
				  gamedata.data.messageHistory.push(data.message);
			  } else {
				  for(var i in data.message) {
				   gamedata.data.messageHistory.push(JSON.parse(data.message[i])["0"]);
				}
			  }
			  gamedata.data.model = data.model;
			  setTimeout(function(){
				  $("#history")[0].scrollTop = 100000000;
			  },200)
			  
			  
			  if($("#formInput23").prop('checked')) {
				  setTimeout(function(){
					  app.nextTick();
				  },1000)
			  }
		  });
	  }
  }
})

