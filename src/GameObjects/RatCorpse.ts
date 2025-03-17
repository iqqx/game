import { Container } from "../Assets/Containers/Containers.js";
import { Item } from "../Assets/Items/Item.js";
import { GetSprite } from "../AssetsLoader.js";
import { Canvas } from "../Context.js";
import { Tag } from "../Enums.js";
import { Scene } from "../Scenes/Scene.js";
import { Rectangle, Vector2 } from "../Utilites.js";

export class RatCorpse extends Container {
	constructor(x: number, y: number, ...items: Item[]) {
		super(32 * 2, 10 * 2, 3, 1);

		this._x = x;

		const hits = Scene.Current.Raycast(new Vector2(this._x, y), Vector2.Down, 1000, Tag.Platform | Tag.Wall);
		this._y = hits.length > 0 ? hits[0].position.Y : y;

		for (const item of items) this.TryPushItem(item);
	}

	public override Render(): void {
		Canvas.DrawImage(GetSprite("RatCorpse"), new Rectangle(this._x  , this._y, this.Width, this.Height));
	}
}
