import { Canvas } from "../Context.js";
import { Tag } from "../Enums.js";
import { Scene } from "../Scene.js";
import { IItem, Rectangle } from "../Utilites.js";
import { Interactable } from "./GameObject.js";

export class ItemDrop extends Interactable {
	public readonly ContentItem: IItem;
	private _verticalAcceleration = 0;
	private _grounded = false;
	private readonly _weight = 1;

	constructor(x: number, y: number, item: IItem) {
		super(item.Icon.BoundingBox.Width, item.Icon.BoundingBox.Height);

		this.ContentItem = item;
		this._collider = new Rectangle(0, 0, item.Icon.ScaledSize.X, item.Icon.ScaledSize.Y);
		this._x = x;
		this._y = y;
	}

	public Update(dt: number): void {
		if (!this._grounded) this.ApplyVForce(dt);
	}

	public Render(): void {
		Canvas.DrawImage(this.ContentItem.Icon, new Rectangle(this._x  , this._y, this.Width, this.Height));
	}

	GetInteractives(): string[] {
		return ["подобрать"];
	}

	OnInteractSelected(id: number): void {
		if (id === 0 && Scene.Player.TryPushItem(this.ContentItem)) Scene.Current.DestroyGameObject(this);
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
