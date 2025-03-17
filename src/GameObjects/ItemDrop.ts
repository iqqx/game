import { Weapon } from "../Assets/Weapons/Weapon.js";
import { Canvas } from "../Context.js";
import { Tag } from "../Enums.js";
import { Scene } from "../Scenes/Scene.js";
import { IItem, Rectangle, Sprite } from "../Utilites.js";
import { Interactable } from "./GameObject.js";

export class ItemDrop extends Interactable {
	public readonly ContentItem: IItem;
	public readonly Image: Sprite;
	private _verticalAcceleration = 0;
	private _grounded = false;
	private readonly _weight = 1;

	constructor(x: number, y: number, item: IItem) {
		super(
			item instanceof Weapon ? item.Sprites.Image.ScaledSize.X : item.Icon.ScaledSize.X,
			item instanceof Weapon ? item.Sprites.Image.ScaledSize.Y : item.Icon.ScaledSize.Y
		);

		this.Image = item instanceof Weapon ? item.Sprites.Image : item.Icon;

		this.ContentItem = item;
		this._collider = new Rectangle(0, 0, this.Width, this.Height);
		this._x = x;
		this._y = y;
	}

	public Update(dt: number): void {
		if (!this._grounded) this.ApplyVForce(dt);
	}

	public Render(): void {
		Canvas.DrawImage(this.Image, new Rectangle(this._x, this._y, this.Width, this.Height));
	}

	GetInteractives(): string[] {
		return ["подобрать"];
	}

	OnInteractSelected(id: number): void {
		if (id === 0 && Scene.Current.Player.TryPushItem(this.ContentItem)) Scene.Destroy(this);
	}

	private ApplyVForce(dt: number) {
		const offsets = Scene.Current.GetCollidesByRect(
			new Rectangle(this._x, this._y + this._verticalAcceleration * (dt / 15), this._collider.Width, this._collider.Height),
			Tag.Wall | Tag.Platform
		);

		offsets.sort((a, b) => (a.instance.Tag !== b.instance.Tag ? b.instance.Tag - a.instance.Tag : a.instance.Tag === Tag.Platform ? a.start.Y - b.start.Y : b.start.Y - a.start.Y));

		if (offsets.length > 0 && offsets[0].start.Y >= 0) {
			this._grounded = true;
			this._y = offsets[0].instance.GetPosition().Y + offsets[0].instance.GetCollider().Height;
		} else {
			this._y += this._verticalAcceleration * (dt / 15);
			this._verticalAcceleration -= (dt / 15) * this._weight;
		}
	}
}
