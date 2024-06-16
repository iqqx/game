import { GetSprite } from "../../Game.js";
import { LoadImage, Sprite } from "../../Utilites.js";
import { Weapon } from "../Weapons/Weapon.js";

export abstract class Item {
	abstract readonly Icon: Sprite;

	public static Parse(raw: string) {
		switch (raw) {
			case "Bread":
				return new Bread();
			case "Vodka":
				return new Vodka();
			case "Sausage":
				return new Sausage();
			case "AidKit":
				return new AidKit();
			case "AK":
			case "Glock":
				return Weapon.Parse(raw);
			case "Radio":
				return new Radio();
			default:
				throw new Error("Предмет не удалось распарсить: " + raw);
		}
	}
}

export class Vodka extends Item {
	public readonly Icon = LoadImage("Images/Items/Vodka.png");

	static toString(): string {
		return "Водка";
	}
}

export class Radio extends Item {
	public readonly Icon = GetSprite("Radio") as Sprite;

	static toString(): string {
		return "Радио";
	}
}

export class AidKit extends Item {
	public readonly Icon = LoadImage("Images/Items/FirstAid.png");

	static toString(): string {
		return "Аптека";
	}
}

export class Sausage extends Item {
	public readonly Icon = LoadImage("Images/Items/MeatStick.png");

	static toString(): string {
		return "Колбаса";
	}
}

export class Adrenalin extends Item {
	public readonly Icon = LoadImage("Images/Items/Syringe.png");

	static toString(): string {
		return "Адреналин";
	}
}

export class Bread extends Item {
	public readonly Icon = LoadImage("Images/Items/Bread.png");

	static toString(): string {
		return "Хлеб";
	}
}
