import { Canvas } from "../Context.js";
import { GetSprite } from "../Game.js";
import { Scene } from "../Scene.js";
import { Rectangle, Sprite, Vector2 } from "../Utilites.js";
import { GameObject } from "./GameObject.js";

export class Fireball extends GameObject {
	private readonly _frames: Sprite[] = GetSprite("Fireball");
	private readonly _angle: number;
	private readonly _offset: Vector2;
	private _lifetime = 100;

	constructor(x: number, y: number, angle: number, offset: Vector2) {
		super(length, 2);

		this._x = x;
		this._y = y;
		this._angle = angle;
		this._offset = this._angle < Math.PI / -2 || this._angle > Math.PI / 2 ? new Vector2(-offset.X, -offset.Y) : offset;
	}

	override Update(dt: number) {
		this._lifetime -= dt;

		if (this._lifetime <= 0) this.Destroy();
	}

	override Render(): void {
		Canvas.DrawImageWithAngle(
			this._frames[Math.floor(3 * Math.max(0, this._lifetime / 100))],
			new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, 50, 25),
			this._angle,
			0,
			25 / 2 - this._offset.Y
		);
	}
}
