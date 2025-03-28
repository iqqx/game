import { Canvas } from "../../Context.js";
import { Direction } from "../../Enums.js";
import { IItem, Rectangle, Sprite, Vector2 } from "../../Utilites.js";

export class Item implements IItem {
	public readonly Name: string;
	public readonly Id: string;
	public readonly Icon: Sprite;
	public readonly IsBig: boolean;
	public readonly MaxStack: number;

	protected _count: number = 0;
	protected _x: number;
	protected _y: number;
	protected _angle: number;
	protected _direction: Direction;

	constructor(id: string, name: string, icon: Sprite, stack: number, isBig = false) {
		this.Id = id;
		this.Icon = icon;
		this.MaxStack = stack;
		this.IsBig = isBig;
		this.Name = name;
	}

	public Is(other: IItem): other is Item {
		return this.Id === other.Id;
	}

	public Clone(): Item {
		return new Item(this.Id, this.Name, this.Icon, this.MaxStack);
	}

	public Update(dt: number, position: Vector2, angle: number, direction: Direction) {
		this._x = position.X;
		this._y = position.Y;
		this._angle = angle;
		this._direction = direction;
	}

	public Render() {
		const gripOffset = new Vector2(this.Icon.ScaledSize.X * -0.5, this.Icon.ScaledSize.Y * 0.5);

		if (this._direction === Direction.Left) {
			Canvas.DrawImageWithAngleVFlipped(this.Icon, new Rectangle(this._x, this._y, this.Icon.ScaledSize.X, this.Icon.ScaledSize.Y), this._angle, gripOffset.X, gripOffset.Y);
		} else {
			Canvas.DrawImageWithAngle(this.Icon, new Rectangle(this._x, this._y, this.Icon.ScaledSize.X, this.Icon.ScaledSize.Y), this._angle, gripOffset.X, gripOffset.Y);
		}
	}

	public GetCount() {
		return this._count;
	}

	public Take(count: number) {
		const was = this._count;

		this._count = Math.clamp(this._count - count, 0, this.MaxStack);

		return was - this._count;
	}

	public Add(count: number) {
		count = Math.abs(count);

		const toAdd = Math.min(count, this.MaxStack - this._count);

		this._count += toAdd;

		return toAdd;
	}

	public AddItem(item: IItem) {
		if (this._count >= this.MaxStack) return false;

		const toAdd = Math.min(item.GetCount(), this.MaxStack - this._count);

		this._count += toAdd;
		item.Take(toAdd);

		return item.GetCount() === 0;
	}
}
