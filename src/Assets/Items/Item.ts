import { LoadImage, Sprite } from "../../Utilites.js";

export interface IItem {
	readonly Icon: Sprite;
}

export class Vodka implements IItem {
	public readonly Icon = LoadImage("Images/Items/Vodka.png");
}

export class AidKit implements IItem {
	public readonly Icon = LoadImage("Images/Items/FirstAid.png");
}

export class Sausage implements IItem {
	public readonly Icon = LoadImage("Images/Items/MeatStick.png");
}

export class Adrenalin implements IItem {
	public readonly Icon = LoadImage("Images/Items/Syringe.png");
}

export class Bread implements IItem {
	public readonly Icon = LoadImage("Images/Items/Bread.png");
}
