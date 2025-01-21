import { Sound, Sprite, Vector2 } from "../../Utilites.js";

export class Item {
	protected readonly _usingSound: Sound;
	readonly Icon: Sprite;
	readonly UseTime: number;
	readonly Big: boolean;
	protected _isUsing;
	protected _usingTime = -1;
	protected _usingCallback: () => void;
	protected _count: number;

	constructor(count?: number) {
		this._count = this.GetStack() > 1 ? Math.clamp(count ?? Math.round(Math.random() * this.GetStack()), 0, this.GetStack()) : 1;
	}

	public Update(dt: number, position: Vector2, angle: number) {
		if (this._usingTime >= 0) {
			this._usingTime += dt;

			if (this._usingTime >= this.UseTime) {
				this._usingTime = -1;
				this._usingCallback();
				this.OnUsed();
			}
		}
	}

	public Use(callback: () => void) {
		if (this.UseTime === undefined) return;
		if (this._isUsing) return;
		this._isUsing = true;

		this._usingSound?.Play();
		this._usingCallback = callback;
		this._usingTime = 0;
	}

	public Render(at: Vector2, angle: number) {}

	public IsUsing() {
		return this._isUsing;
	}

	public GetCount() {
		return this._count;
	}

	public Take(count: number) {
		this._count = Math.clamp(this._count - count, 0, this.GetStack());
	}

	public Add(count: number) {
		count = Math.abs(count);

		const toAdd = Math.min(count, this.GetStack() - this._count);

		this._count += toAdd;

		return toAdd;
	}

	public GetStack() {
		return 1;
	}

	protected OnUsed() {}
}
