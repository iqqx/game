import { Container } from "../Assets/Containers/Containers.js";
import { Item } from "../Assets/Items/Item.js";
import { Canvas } from "../Context.js";
import { Scene } from "../Scene.js";
import { LoadImage, Rectangle } from "../Utilites.js";

export class Corpse extends Container {
	private static readonly _sprite = LoadImage("Images/Corpse.png");

	constructor(x: number, y: number, ...items: Item[]) {
		super(100, 50, 3, 1);

		this._x = x;
		this._y = y;

		for (const item of items) this.TryPushItem(item);
	}

	public override Render(): void {
		Canvas.DrawImage(Corpse._sprite, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
	}
}
