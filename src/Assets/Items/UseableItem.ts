import { Direction } from "../../Enums.js";
import { IItem, Sound, Sprite, Vector2 } from "../../Utilites.js";
import { Item } from "./Item.js";

export class UseableItem extends Item {
	private readonly _usingSound: Sound;
	public readonly UseTime: number;
	private _isUsing;
	private _usingTime = -1;
	private _usingCallback: () => void;
	private readonly _afterUse: () => void;

	constructor(id: string, icon: Sprite, stack: number, isBig: boolean, useSound: Sound, afterUse: () => void, time: number) {
		super(id, icon, stack, isBig);

		this.UseTime = time;
		this._afterUse = afterUse;
		this._usingSound = useSound;
	}

	public Is(other: IItem): other is UseableItem {
		return this.Id === other.Id;
	}

	public Clone(): UseableItem {
		return new UseableItem(this.Id, this.Icon, this.MaxStack, this.IsBig, this._usingSound, this._afterUse, this.UseTime);
	}

	public Update(dt: number, position: Vector2, angle: number, direction: Direction) {
		super.Update(dt, position, angle, direction);

		if (this._usingTime >= 0) {
			this._usingTime += dt;

			if (this._usingTime >= this.UseTime) {
				this._usingTime = -1;
				this._usingCallback();
				this._afterUse();
			}
		}
	}

	public Use(callback: () => void) {
		if (this._isUsing) return;
		this._isUsing = true;

		this._usingSound?.Play();
		this._usingCallback = callback;
		this._usingTime = 0;
	}

	public IsUsing() {
		return this._isUsing;
	}
}
