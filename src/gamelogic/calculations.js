
Roll = require('roll');
roll = new Roll();

module.exports = {

	//Surprise Roll
	surpriseCheckRoll: function  (someone, someoneElse){
		someone.surpriseModifier=0
		someoneElse.surpriseModifier=0
		
		someoneModifiedRoll = roll.roll("d100").result + someone.AGI - someoneElse.PER
		someoneElseModifiedRoll = roll.roll("d100").result + someoneElse.AGI - someone.PER
		console.verbose("SURPRISE check:")
		console.verbose("    "+someone.name + " rolled " + someoneModifiedRoll + " for surprise")
		console.verbose("    "+someoneElse.name + " rolled " + someoneElseModifiedRoll + " for surprise")

		if (someoneModifiedRoll - someoneElseModifiedRoll > 25) {
			display(someone.name + " managed to SURPRISE the " +someoneElse.name)
			someone.surpriseModifier=10;
		} else if (someoneElseModifiedRoll - someoneModifiedRoll > 25) {
			display(someone.name + " managed to SURPRISE the " +someoneElse.name)
			someoneElse.surpriseModifier=10;
		} else {
			console.verbose("    Neither side managed to SURPRISE the other")
			display(someone.name + "and "+someoneElse.name+" face each other")
		}
	},

	basicMeleeToHitRoll: function  (attacker,defender,meleeHandicap){
		console.verbose("MELEE HIT ROLL:")
		console.verbose("    "+attacker.name + " is attacking " + defender.name)
		//ATTACKER base roll
		baseAtkRoll = roll.roll("d100").result
		attackerModifiers = 0
		//adding presumably positive modifiers
		attackerModifiers += Math.max(attacker.STR, attacker.AGI, 10) // best of STR or AGI added
		attackerModifiers += attacker.surpriseModifier; // adding surprise modifier
		//subtracting presumingly negative modifies
		attackerModifiers -= attacker.wounds*8 || 0 //wounded effects
		//calc final attacker modified results
		levelRangeModifier = 10*(attacker.level-defender.level)
		attackerModifiedRoll = baseAtkRoll + attackerModifiers - meleeHandicap + levelRangeModifier
		//DEFENDER modified roll
		baseDefRoll = roll.roll("d100").result
		defenderModifiers = 0
		//adding presumably positive modifiers
		defenderModifiers +=defender.AGI;
		//subtracting presumingly negative modifies
		defenderModifiers -= defender.wounds*8 || 0
		defenderModifiers -= (defender.disabled > 0 ? defender.AGI+25 : 0) // -lose AGI bonus+25 disabled
		//calc final defender modified results
		defenderModifiedRoll = baseDefRoll + defenderModifiers
		
		console.verbose("    Attacker: "+attackerModifiedRoll+" [ roll:(" + baseAtkRoll + ") + modifiers:(" + attackerModifiers + ") - handicap:(" + meleeHandicap + ") + lvl gap:(" + levelRangeModifier + ") ]")
		console.verbose("    Defender: "+defenderModifiedRoll+" [ roll:(" + baseDefRoll + ") + modifiers:(" + defenderModifiers+ ") ]")
		
		if (attacker.surpriseModifier != 0)	{
			attacker.surpriseModifier = 0
			console.verbose ("    "+attacker.name + "'s surprise modifier was used and will be set to 0 now")
		}

		if (attackerModifiedRoll > defenderModifiedRoll) {
			return "hit"
		} else {
			return "miss"	
		}
	

		

	},
	basicMagicToHitRoll: function  (attacker,defender,magicHandiCap){
		console.verbose("MAGIC HIT ROLL:")
		console.verbose("    "+attacker.name + " is casting on " + defender.name)
		//ATTACKER base roll
		baseAtkRoll = roll.roll("d100").result
		attackerModifiers = 0
		//adding presumably positive modifiers
		attackerModifiers += attacker.INT
		attackerModifiers += attacker.surpriseModifier; // adding surprise modifier
		//subtracting presumingly negative modifies
		attackerModifiers -= attacker.wounds*8 || 0 //wounded effects
		//calc final attacker modified results
		levelRangeModifier = 10*(attacker.level-defender.level)
		attackerModifiedRoll = baseAtkRoll + attackerModifiers - magicHandiCap + levelRangeModifier
		//DEFENDER modified roll
		baseDefRoll = roll.roll("d100").result
		defenderModifiers = 0
		//adding presumably positive modifiers
		defenderModifiers +=defender.WIL;
		//subtracting presumingly negative modifies
	
		
		//calc final defender modified results
		
		defenderModifiedRoll = baseDefRoll + defenderModifiers
		
		console.verbose("    Caster: "+attackerModifiedRoll+" [ roll:(" + baseAtkRoll + ") + modifiers:(" + attackerModifiers + ") - handicap:(" + magicHandiCap + ") + lvl gap:(" + levelRangeModifier + ") ]")
		
		console.verbose("    Defender: "+defenderModifiedRoll+" [ roll:(" + baseDefRoll + ") + modifiers:(" + defenderModifiers+ ") ]")
		
		if (attacker.surpriseModifier != 0)	{
			attacker.surpriseModifier = 0
			console.verbose ("    "+attacker.name + "'s surprise modifier was used and will be set to 0 now")
		}

		if (attackerModifiedRoll > defenderModifiedRoll) {
			return "hit"
		} else {
			return "miss"	
		}
	

		

	},
	// basic Damage Roll
	basicMeleeDamage: function  (attacker, defender, baseDamage){
		console.verbose("DAMAGE ROLL:")
		console.verbose ("    base damage: " + baseDamage)
		modifiedDamage = baseDamage
		attackerDamageRoll = roll.roll("d100").result + attacker.STR
		defenderDamageRoll = roll.roll("d100").result + defender.END

		console.verbose("    "+attacker.name + "'s STR roll: " + attackerDamageRoll)
		console.verbose("    "+defender.name + "'s END roll: " + defenderDamageRoll)


		if((attackerDamageRoll - defenderDamageRoll) > 15){
			modifiedDamage++;
			console.verbose ("    "+attacker.name +" crits. Modified damage: " + modifiedDamage)
			display (attacker.name + " strikes a CRITICAL blow")

		} else if ((defenderDamageRoll - attackerDamageRoll) > 15){
			modifiedDamage--;
			console.verbose ("    "+defender.name+" resists. Modified damage: " + modifiedDamage)
			display (defender.name + " RESISTS the force of the blow")

		}
		if (modifiedDamage > 0){


			if (defender.wounds==undefined){
				defender.wounds=modifiedDamage
			} else {
				defender.wounds = defender.wounds + modifiedDamage
			}
		console.verbose ("    "+defender.name + " is hit for: " + modifiedDamage)
		txt = modifiedDamage==1 ? " WINCES in pain." : modifiedDamage==2 ? " SCREAMS in great pain!" : " SHRIEKS in anguish!!"
		display (defender.name + txt)

			
		} else { // if modified damage not larger than zero
			console.verbose ("    "+defender.name + " is 'hit' for: " + modifiedDamage)
			display(defender.name + " SCOFFS at the weak blow")
		}
		
	},

	checkIfDead: function  (someone){
		if (someone.wounds>=3){
			return true
		} else {
			return false
		}
	}

}