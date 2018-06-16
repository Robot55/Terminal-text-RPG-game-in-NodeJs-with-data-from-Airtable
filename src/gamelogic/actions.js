var calculations = require('./calculations.js');


// ================== All Possible Action Functions ================
			
function doNothing(attemptor,target,model) {
	//use this for when stunned, disabled, mesmerized, etc.
	if (attemptor.disabled > 0){ // if char is doinf nothing because of disabled status
		attemptor.disabled--; // reduce disabled status by 1 round
	}
	display("")
	display(attemptor.name+" isn't doing anything...")
	
}

function melee(attemptor,target,model) { //use for basic melee attacks
	characterAttackRoll = calculations.basicMeleeToHitRoll(attemptor, target,0)
	
	if (characterAttackRoll=="hit"){ // if attemptor managed to hit target
		display("")
		display(attemptor.name + " hits " + target.name)
		calculations.basicMeleeDamage (attemptor, target, 1)
	} else { // if attemptor missed target
		display("")
		display(attemptor.name + " strikes at " + target.name + " but misses...")
	}

}

function wildAttack(attemptor,target,model) { // more likely to miss but more dmg
	characterAttackRoll = calculations.basicMeleeToHitRoll(attemptor, target,25)
	
	if (characterAttackRoll=="hit"){ // if attemptor managed to hit target
		display("")
		display(attemptor.name + " hits wildly at " + target.name)
		calculations.basicMeleeDamage (attemptor, target, 2)
	} else { // if attemptor missed target
		display("")
		display(attemptor.name + " strikes wildly at " + target.name + " but misses...")
	}

}

function sneak(attemptor,target,model) { 	// can be done on first round or when enemy disabled. 
									//lets player go to next room or monster to disable player for 1 round
	//check if succeed
	// if so do:
	if (attemptor == model.playerCharacters[0]){
		//move to next room and set rounds to 0
		model.playerCharacters[0].currentRoom+=1;
		model.rounds=0
	} else {
		target.disabled=target.disabled==undefined ? 1 : target.disabled+1
	}
	display("")
	display("sneaking")
	
}

function castIllusion(attemptor,target,model) {
	//check if succeed
	// if so do:
	if (attemptor == model.playerCharacters[0]){ // if attemptor is player character
		//move to next room and set rounds to 0
		model.playerCharacters[0].currentRoom+=1;
		model.rounds=0
	} else { //if attemptor is monster
		target.disabled=target.disabled==undefined ? 2 : target.disabled+2
	}
	display("")
	display(attemptor.name + "is casting Illusion")
	
}

function castLifeSkin(attemptor,target,model) {
	//check if succeed
	// if so do:
	attemptor.wounds-= roll.roll("12d").result
	display("")
	display(attemptor.name + "is casting LifeSkin")
	
}

function doNothingPriority (character,opponent,action,model) {
		var modifiedPriority = 0;
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

function meleePriority(character,opponent,action,model) {
	var modifiedPriority = 0;
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

function wildAttackPriority(character,opponent,action,model) {
				var modifiedPriority = 0;
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
			
			
function sneakPriority(character,opponent,action,model) {
	var modifiedPriority = 0;
	modifiedPriority = roll.roll("d10").result
	if (character.class=="sneaker")  {
		modifiedPriority+=50;
	}
	if (model.rounds==0)  {
		modifiedPriority+=60;
	}
	if (model.rounds>0 && character==model.playerCharacters[0] && opponent.disabled<1)  {// if not first round character can't sneak but mobs can
	// if monster is disabled then player can try to sneak past it
		modifiedPriority-=999;
	}
	modifiedPriority += opponent.disabled*50
	modifiedPriority += character.wounds*15 || 0
	modifiedPriority += character.AGI/10 || 0
	modifiedPriority += (character.PER - opponent.PER) /10
	
	return modifiedPriority
}

function castIllusionPriority (character,opponent,action,model) {
				var modifiedPriority = 0;
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
			
			
function castLifeSkinPriority (character,opponent,action,model) {
				var modifiedPriority = 0;
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
			
// =============== AI Decision Making Logic and Action Choosing =====================
			
module.exports = {getAllActions : function() {		

	// All possible actions are here (action name and its corresponding func name)
	return [
		{
			"name":"do nothing",
			"actionFunction" : doNothing,
			"priorityFunction" : doNothingPriority
		},
		{
			"name":"attack",
			"actionFunction" : melee,
			"priorityFunction" : meleePriority
		},
		{
			"name":"wild attack",
			"actionFunction" : wildAttack,
			"priorityFunction" : wildAttackPriority
		},
		{
			"name":"sneak",
			"actionFunction" : sneak,
			"priorityFunction" : sneakPriority
		},
		{
			"name":"cast Illusion",
			"actionFunction" : castIllusion,
			"priorityFunction" : castIllusionPriority
		},
		{
			"name":"cast LifeSkin",
			"actionFunction" : castLifeSkin,
			"priorityFunction" : castLifeSkinPriority
		}
	]


	
}}