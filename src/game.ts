
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const MAX_ENEMIES = 3;

const rl = createInterface({
  input: stdin,
  output: stdout,
});

// classes

abstract class Combatant {
  hp: number;
  maxhp: number;
  att: number;
  def: number;
  isDefending = false;

  constructor(hp: number, att: number, def: number) {
    this.hp = hp;
    this.maxhp = hp;
    this.att = att;
    this.def = def;
  }

  attack(target: Combatant): void {
    target.takeDamage(this.att);
  }

  defend(): void {
    this.isDefending = true;
    console.log("You bracxe for the next attack.");
  }

  takeDamage(damage: number): void {
    const effectiveDefense = this.isDefending
      ? this.def * 2
      : this.def;

    const actualDamage = Math.max(0, damage - effectiveDefense);

    this.hp = Math.max(0, this.hp - actualDamage);
    this.isDefending = false;

    console.log(`Took ${actualDamage} damage.`);

    if (this.hp === 0) {
      console.log("Defeated");
    }
  }
}

class Hero extends Combatant {
  potions = 3;
  level = 1;

  levelUp(): void {
    this.level++;
    this.maxhp += 10;
    this.hp = Math.min(this.maxhp, this.hp + 10);
    this.att += 2;
    this.def += 1;

    console.log(`Level up. You are now level ${this.level}.`);
    console.log("Max HP increased by 10.");
    console.log("Attack increased by 2.");
    console.log("Defense increased by 1.");
    console.log("You recovered up to 10 HP.");
  }

  useHealthPotion(): void {
    const oldHp = this.hp;

    this.hp = Math.min(this.maxhp, this.hp + 30);
    this.potions--;

    console.log(`You recovered ${this.hp - oldHp} HP.`);
    console.log(`Potions remaining: ${this.potions}`);
  }

  override attack(target: Combatant): void {
    console.log(`${this.att} damage dealt`);
    target.takeDamage(this.att);
  }
}

class Enemy extends Combatant {
  override attack(target: Combatant): void {
    console.log(`The enemy attacks for ${this.att} base damage`);
    target.takeDamage(this.att);
  }
}

//create instances

const hero = new Hero(120, 12, 8);

function createEnemy(): Enemy {
  return new Enemy(45, 18, 7);
}

//battle system

async function battle(): Promise<void> {
  for (
    let enemyNumber = 1;
    enemyNumber <= MAX_ENEMIES;
    enemyNumber++
  ) {
    const enemy = createEnemy();

    console.log(
      `========== ENEMY ${enemyNumber} OF ${MAX_ENEMIES} ==========`
    );

    while (hero.hp > 0 && enemy.hp > 0) {
      console.log("--- Status ---");
      console.log(`Hero HP: ${hero.hp}/${hero.maxhp}`);
      console.log(`Enemy HP: ${enemy.hp}/${enemy.maxhp}`);
      console.log(`Level: ${hero.level}`);
      console.log(`Potions: ${hero.potions}`);

      console.log("1. Attack");
      console.log("2. Defend");
      console.log("3. Use Health Potion");

      const choice = (
        await rl.question("Choose an action: ")
      ).trim();

      if (choice === "1") {
        hero.attack(enemy);
      } else if (choice === "2") {
        hero.defend();
      } else if (choice === "3") {
        if (hero.potions <= 0) {
          console.log("None left");
          continue;
        }

        if (hero.hp === hero.maxhp) {
          console.log("Health still full");
          continue;
        }

        hero.useHealthPotion();
      } else {
        console.log("Invalid choice. Enter 1, 2, or 3.");
        continue;
      }

      // Enemy attack
      if (enemy.hp > 0) {
        enemy.attack(hero);
      }
    }

    // Check if hero is defeated
    if (hero.hp <= 0) {
      console.log("DEFEAT");
      return;
    }

    // level up
    console.log(`Enemy ${enemyNumber} defeated`);
    hero.levelUp();
  }

  console.log(`ALL ENEMIES DEFEATED`);
}

battle()
  .catch((error: unknown) => {
    console.error("An error occurred:", error);
  })
  .finally(() => {
    rl.close();
  });
