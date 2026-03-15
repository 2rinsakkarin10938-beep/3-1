import { DashSkill, ShieldSkill, StrikeSkill } from "../skills/base-skills.js";
import { createMageSpecial } from "./mage.js";
import { createRogueSpecial } from "./rogue.js";
import { createWarriorSpecial } from "./warrior.js";

export const CHARACTER_DATA = {
  warrior: {
    key: "warrior",
    label: "Warrior",
    hp: 160,
    attack: 18,
    defense: 9,
    speed: 122,
    color: "#d97706",
    sprite: "/assets/sprites/warrior.png",
    specialName: "Ground Slam",
    specialFactory: createWarriorSpecial,
  },
  mage: {
    key: "mage",
    label: "Mage",
    hp: 92,
    attack: 26,
    defense: 3,
    speed: 108,
    color: "#2563eb",
    sprite: "/assets/sprites/mage.png",
    specialName: "Fireball",
    specialFactory: createMageSpecial,
  },
  rogue: {
    key: "rogue",
    label: "Rogue",
    hp: 118,
    attack: 20,
    defense: 5,
    speed: 148,
    color: "#10b981",
    sprite: "/assets/sprites/rogue.png",
    specialName: "Shadow Step",
    specialFactory: createRogueSpecial,
  },
};

export function getCharacterDefinition(className) {
  return CHARACTER_DATA[className] ?? CHARACTER_DATA.warrior;
}

export function createSkillLoadout(className) {
  const definition = getCharacterDefinition(className);
  return [new DashSkill(), new StrikeSkill(), new ShieldSkill(), definition.specialFactory()];
}
