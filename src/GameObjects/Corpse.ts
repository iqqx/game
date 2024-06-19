import { Container } from "../Assets/Containers/Containers.js";
import { Item } from "../Assets/Items/Item.js";
import { Canvas } from "../Context.js";
import { GetSprite } from "../Game.js";
import { Scene } from "../Scene.js";
import { Rectangle } from "../Utilites.js";

export class Corpse extends Container {
	constructor(x: number, y: number, ...items: Item[]) {
		super(32 * 3, 9 * 3, 3, 1);

		this._x = x;
		this._y = y;

		for (const item of items) this.TryPushItem(item);
	}

	public override Render(): void {
		Canvas.DrawImage(GetSprite("Corpse"), new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
	}
}
