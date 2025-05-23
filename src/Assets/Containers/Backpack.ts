import { GetSprite, GetSound } from "../../AssetsLoader.js";
import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { IPickapable } from "../../GameObjects/GameObject.js";
import { Scene } from "../../Scenes/Scene.js";
import { IItem, Rectangle } from "../../Utilites.js";
import { Container } from "./Containers.js";

export class Backpack extends Container implements IPickapable {
	public readonly OnPickup?: () => void;

	constructor(x: number, y: number, ...content: IItem[]) {
		super(50, 35, 4, 1);

		for (let i = 0; i < content.length; i++) this._items[0][i] = content[i];

		this.Tag = Tag.Pickable;
		this._x = x;
		this._y = y;
	}

	override Render(): void {
		Canvas.DrawImage(GetSprite("Drop_Backpack"), new Rectangle(this._x  , this._y, this.Width, this.Height));
	}

	public Pickup() {
		if (this.OnPickup !== undefined) this.OnPickup();

		Scene.Current.Player.PutBackpack(this);
		GetSound("Backpack_Pickup").Play(0.5);
		Scene.Destroy(this);

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
				Scene.Current.Player.OpenContainer(this);

				break;
		}
	}
}
