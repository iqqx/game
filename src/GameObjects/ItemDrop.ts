import { Canvas } from "../Context.js";
import { Scene } from "../Scene.js";
import { IItem, Rectangle } from "../Utilites.js";
import { Interactable } from "./GameObject.js";

export class ItemDrop extends Interactable {
	public readonly ContentItem: IItem;

	constructor(x: number, y: number, item: IItem) {
		super(item.Icon.BoundingBox.Width, item.Icon.BoundingBox.Height);

		this.ContentItem = item;
		this._x = x;
		this._y = y;
	}

	public Render(): void {
		Canvas.DrawImage(this.ContentItem.Icon, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
	}

	GetInteractives(): string[] {
		return ["подобрать"];
	}

	OnInteractSelected(id: number): void {
		if (id === 0 && Scene.Player.TryPushItem(this.ContentItem)) Scene.Current.DestroyGameObject(this);
	}
}
