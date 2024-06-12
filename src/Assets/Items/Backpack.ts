import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { GameObject, LoadImage, LoadSound, Rectangle } from "../../Utilites.js";
import { Weapon } from "../../Weapon.js";

export class Backpack extends GameObject {
	private static readonly _image = LoadImage(`Images/Player/Drop_backpack.png`, new Rectangle(11, 13, 10, 6), 5);
	private static readonly _sound = LoadSound("Sounds/backpack_pickup.mp3");
	private readonly _content: [Weapon?, GameObject?, GameObject?, GameObject?, GameObject?];

	constructor(x: number, y: number, content?: [Weapon?, GameObject?, GameObject?, GameObject?, GameObject?]) {
		super(50, 50);

		this._content = content;
		this.Tag = Tag.Pickable;
		this._x = x;
		this._y = y;
	}

	override Render(): void {
		Canvas.DrawImage(Backpack._image, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, Backpack._image.ScaledSize.X, Backpack._image.ScaledSize.Y));
	}

	public Pickup() {
		Backpack._sound.Play(.5);
		this.Destroy();
		return this._content;
	}
}
