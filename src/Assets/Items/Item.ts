import { LoadImage, Sprite } from "../../Utilites";

export interface Item {
	readonly Icon: Sprite;
}

export class Vodka implements Item {
	public readonly Icon = LoadImage("Images/Items/Vodka.png");
}
