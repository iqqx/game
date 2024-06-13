import { LoadImage, Sprite } from "../../Utilites.js";

export abstract class Item {
	abstract readonly Icon: Sprite;
}

export class Vodka extends Item {
	public readonly Icon = LoadImage("Images/Items/Vodka.png");

	static toString(): string {
		return "Водка";
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
