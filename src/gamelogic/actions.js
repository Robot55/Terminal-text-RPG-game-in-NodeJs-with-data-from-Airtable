var calculations = require('./calculations.js');
Roll = require('roll');
roll = new Roll();

// == DAVE's Helper Functions

function checkIfPlayer (someone){ // returns true if someone is the player character
	if (someone == model.playerCharacters[0]){
		return true;
	}		
	
}

// ================== All Possible Action Functions ================
			
function doNothing(attemptor,target,model) {
	//use this for when stunned, disabled, mesmerized, etc.
	if (attemptor.disabled > 0){ // if char is doin nothing because of disabled status
		attemptor.disabled--; // reduce disabled status by 1 round
		console.verbose("    "+ attemptor.name+"'s disabled status reduced from: "+(attemptor.disabled+1) +" to: "+attemptor.disabled)
	}
	txt = attemptor.disabled > 0 ? " CAN'T ACT this round" : " is doing NOTHING"
	display(attemptor.name+txt)
	
}

function melee(attemptor,target,model) { //use for basic melee attacks
	characterAttackRoll = calculations.basicMeleeToHitRoll(attemptor, target,0)
	
	if (characterAttackRoll=="hit"){ // if attemptor managed to hit target
		display(attemptor.name + " HITS " + target.name)
		calculations.basicMeleeDamage (attemptor, target, 1)
	} else { // if attemptor missed target
		display(attemptor.name + " MISSES " + target.name)
	}

}

function wildAttack(attemptor,target,model) { // more likely to miss but more dmg
	characterAttackRoll = calculations.basicMeleeToHitRoll(attemptor, target,25)
	
	if (characterAttackRoll=="hit"){ // if attemptor managed to hit target
		display(attemptor.name + "'s wild attack HITS " + target.name)
		calculations.basicMeleeDamage (attemptor, target, 2)
	} else { // if attemptor missed target
		display(attemptor.name + "'s wild attack MISSES " + target.name)
	}

}

function sneak(attemptor,target,model) { 	// can be done on first round or when enemy disabled. 
									//lets player go to next room or monster to disable player for 1 round
	characterSneakRoll = calculations.basicStealthToHitRoll(attemptor, target,0)
	
	if (characterSneakRoll=="hit"){ // if attemptor managed to hit target

		if (attemptor == model.playerCharacters[0]){ // if SNEAK atttemptor is Player
				//move to next room and set rounds to 0
				display(attemptor.name + " quickly hides and SNEAKS past " + target.name + " to the next room")
				model.playerCharacters[0].currentRoom+=1;
				model.rounds=0
			} else {	//if SNEAK atttemptor is Monster
				target.disabled=target.disabled==undefined ? 1 : target.disabled+1
				display(attemptor.name + " quickly VANISHES in a shadow behind a corner and will gain a FREE ACTION round on " + target.name)
			}



		
		

	} else { // if attemptor missed target
		display(attemptor.name + " FAILS to sneak up on " + target.name)
	}
	
}

function castIllusion(attemptor,target,model) {
	attemptor.mana--
	
	handicap = -1
	handicap += Math.floor(target.PER/10) || 0
	handicap += Math.floor(target.INT/10) || 0
	casterAttackRoll = calculations.basicMagicToHitRoll(attemptor, target, handicap)
	//check if succeed
	if (casterAttackRoll=="hit"){
		if (attemptor == model.playerCharacters[0]){ // if attemptor is player character
			//move to next room and set rounds to 0
			model.playerCharacters[0].currentRoom+=1;
			model.rounds=0
		} else { //if attemptor is monster
			target.disabled=target.disabled==undefined ? 2 : target.disabled+2
		}

	display(attemptor.name + " cast ILLUSION on" + target.name + "and is free to move to the next room")
		
	} else {
		display(attemptor.name + " FAILS to cast an Illusion spell")
	}

	
}

function castLifeSkin(attemptor,target,model) {
	attemptor.mana--
	handicap = -1*(attemptor.WIL+33)
	// self spell so handicap is negative (means Easy)
	casterAttackRoll = calculations.basicMagicToHitRoll(attemptor, attemptor, handicap) // attemptor is both attacker and defender
	console.verbose("    starting lifeSkin calculations...")
	if (casterAttackRoll=="hit"){
		dieRoll = roll.roll("d2").result
		attemptor.wounds-= dieRoll
		console.verbose(attemptor.name + " rolled: " + dieRoll + "wounds to heal and now have: " + attemptor.wounds + " wounds")
		txt = attemptor.wounds >= 0 ? " was HEALED for " + dieRoll +" wounds" : " was FULLY HEALED and gained " + attemptor.wounds*-1 + " point(s) of magical armor"
		display(attemptor.name + " cast LifeSkin and" + txt)	
	} else {
		display(attemptor.name + " FAILS to cast LifeSkin")
	}
	
}


// Priorities and Probability Calculations

function doNothingPriority (character,opponent,action,model) {
		var modifiedPriority = 0;
		modifiedPriority = roll.roll("d10").result //+50
		
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
	modifiedPriority = roll.roll("d10").result //+50
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
				modifiedPriority = roll.roll("d10").result //+50
				if(character.class=="attacker") {
					modifiedPriority+=50;
				}
				
				modifiedPriority += opponent.disabled*55 || 0
				modifiedPriority -= character.wounds*15 || 0
				modifiedPriority += opponent.wounds*15 || 0
				modifiedPriority += character.STR/10 || 0
				modifiedPriority += character.STR-opponent.END/5 || 0
				//modifiedPriority += character.STR-opponent.END>25 ? 20 : 0
				return modifiedPriority
			}
			
			
function sneakPriority(character,opponent,action,model) {
	var modifiedPriority = 0;
	modifiedPriority = roll.roll("d10").result //+50
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
	modifiedPriority += character==model.playerCharacters[0] ? opponent.disabled*50 : opponent.disabled*-50
	modifiedPriority += character.wounds*15 || 0
	modifiedPriority += character.AGI/10 || 0
	modifiedPriority += (character.PER - opponent.PER) /10
	
	return modifiedPriority
}

function castIllusionPriority (character,opponent,action,model) {
				var modifiedPriority = 0;
				modifiedPriority = roll.roll("d10").result //+50
				if(character.class=="Wizz") {
					modifiedPriority+=50;
				}
				
				modifiedPriority -= opponent.disabled*50 || 0
				modifiedPriority += character.wounds*15 || 0
				modifiedPriority -= opponent.wounds*10 || 0
				modifiedPriority += character.INT/10 || 0
				modifiedPriority -= character.mana<1 ? 999 : 0
				return modifiedPriority
			}
			
			
function castLifeSkinPriority (character,opponent,action,model) {
				var modifiedPriority = 0;
				modifiedPriority = roll.roll("d10").result //+50
				if(character.class=="Wizz") {
					modifiedPriority+=50;
				}
				
				modifiedPriority -= opponent.disabled*5 || 0
				modifiedPriority += character.wounds*30 || 0
				modifiedPriority -= opponent.wounds*10 || 0
				modifiedPriority += character.INT/10 || 0
				modifiedPriority -= character.mana<1 ? 999 : 0
				
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