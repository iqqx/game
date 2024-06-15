import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { IPickapable, LoadImage, LoadSound, Rectangle } from "../../Utilites.js";
import { Item } from "../Items/Item.js";
import { Container } from "./Containers.js";

export class Backpack extends Container implements IPickapable {
	private static readonly _image = LoadImage(`Images/Player/Drop_backpack.png`, new Rectangle(11, 13, 10, 6), 5);
	private static readonly _sound = LoadSound("Sounds/backpack_pickup.mp3");
	public readonly OnPickup?: () => void;

	constructor(x: number, y: number, ...content: Item[]) {
		super(4, 1);

		for (let i = 0; i < content.length; i++) this._items[0][i] = content[i];

		this.Tag = Tag.Pickable;
		this._x = x;
		this._y = y;
	}

	override Render(): void {
		Canvas.DrawImage(Backpack._image, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, Backpack._image.ScaledSize.X, Backpack._image.ScaledSize.Y));
	}

	public Pickup() {
		if (this.OnPickup !== undefined) this.OnPickup();

		Scene.Player.PutBackpack(this);
		Backpack._sound.Play(0.5);
		this.Destroy();
		return this._items;
	}

	public GetInteractives(): string[] {
		return ["подобрать", "открыть"];
	}

	OnInteractSelected(id: number): void {
		switch (id) {
			case 0:
				this.Pickup();

				break;
			case 1:
				Scene.Player.OpenContainer(this);

				break;
		}
	}
}
