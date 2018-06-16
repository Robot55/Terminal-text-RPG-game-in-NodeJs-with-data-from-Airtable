
Roll = require('roll');
roll = new Roll();

module.exports = {


	surpriseCheckRoll: function  (someone, someoneElse){
		someone.surpriseModifier=0
		someoneElse.surpriseModifier=0
		
		someoneModifiedRoll = roll.roll("d100").result + someone.AGI - someoneElse.PER
		someoneElseModifiedRoll = roll.roll("d100").result + someoneElse.AGI - someone.PER
		console.verbose("")
		console.verbose("??? Checking for Surprise ???")
		console.verbose(someone.name + " rolled " + someoneModifiedRoll + "for surprise")
		console.verbose(someoneElse.name + " rolled " + someoneElseModifiedRoll + "for surprise")

		if (someoneModifiedRoll > someoneElseModifiedRoll) {
			display("")
			display(someone.name + " managed to surprise the " +someoneElse.name)
			someone.surpriseModifier=10;
		} else if (someoneElseModifiedRoll > someoneModifiedRoll) {
			display("")
			display(someone.name + " managed to surprise the " +someoneElse.name)
			someoneElse.surpriseModifier=10;
		} else {
			console.verbose("")
			console.verbose("neither side managed to surprise the other")
		}
	},

	basicMeleeToHitRoll: function  (attacker,defender,meleeHandycap){
		console.verbose("")
		console.verbose(attacker.name + " is attacking " + defender.name)
		//attacker modified roll
		attackerModifiedRoll = roll.roll("d100").result + Math.max(attacker.STR, attacker.AGI, 10) + attacker.surpriseModifier;
		attackerModifiedRoll -= attacker.wounds*8 || 0
		attackerModifiedRoll -= meleeHandycap || 0
		//defender modified roll
		defenderModifiedRoll = roll.roll("d100").result + defender.AGI;
		defenderModifiedRoll -= defender.wounds*8 || 0
		defenderModifiedRoll -= (defender.disabled > 0 ? 100 : 0) // -100 to defender if disabled
		
		console.verbose(">>> "+attacker.name+"'s NATURAL attack bonus is: "+ Math.max(attacker.STR, attacker.AGI, 10).toString())
		console.verbose(">>> "+attacker.name+"'s modified ATTACK roll: " + attackerModifiedRoll)
		console.verbose("<<< "+defender.name+"'s modified DEFENSE roll: " + defenderModifiedRoll)
		
		if (attacker.surpriseModifier != 0)	{
			attacker.surpriseModifier = 0
			console.verbose (attacker.name + "'s surprise modifier was used and will be set to 0 now")
		}

		if (attackerModifiedRoll > defenderModifiedRoll) {
			return "hit"
		} else {
			return "miss"	
		}


		

	},
	// basic Damage Roll
	basicMeleeDamage: function  (attacker, defender, baseDamage){
		modifiedDamage = baseDamage
		console.verbose("")
		console.verbose ("modified damage starts at: " + modifiedDamage)
		attackerDamageRoll = roll.roll("d100").result + attacker.STR
		defenderDamageRoll = roll.roll("d100").result + defender.END

		console.verbose(attacker.name + "'s STR modified roll is: " + attackerDamageRoll)
		console.verbose(defender.name + "'s END modified roll is: " + defenderDamageRoll)


		if((attackerDamageRoll - defenderDamageRoll) > 10){
			display("")
			display (attacker.name + " strikes a critical blow")
			modifiedDamage++;
			console.verbose ("modified damage boosted to: " + modifiedDamage)

		} else if ((defenderDamageRoll - attackerDamageRoll) >10){
			display("")
			display (defender.name + " withstands the force of the blow (DMG RESIST)")
			modifiedDamage--;
			console.verbose ("modified damage nerfed to: " + modifiedDamage)

		}
		if (modifiedDamage > 0){


			if (defender.wounds==undefined){
				defender.wounds=modifiedDamage
			} else {
				defender.wounds = defender.wounds + modifiedDamage
			}
		display("")
		display("xXx")
		display (defender.name + " winces in pain.")
		console.verbose (defender.name + " is hit for: " + modifiedDamage)
		display("xXx")
			
		} else { // if modified damage not larger than zero
			display("")
			display("xXx")
			display(defender.name + " shrugs off the blow")
			console.verbose (defender.name + " is 'hit' for: " + modifiedDamage)
			display("xXx")
			

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