import { Scene } from "../Scenes/Scene.js";
import { Canvas } from "../Context.js";
import { Color, Rectangle } from "../Utilites.js";
import { GameObject } from "./GameObject.js";

export class Bullet extends GameObject {
	private static readonly _bulletColor0 = new Color(255, 255, 255, 5);
	private static readonly _bulletColor1 = new Color(255, 255, 255, 50);
	private static readonly _maxLifetime = 200;

	private readonly _length: number;
	private readonly _angle: number;
	private _lifetime = 0;

	constructor(x: number, y: number, length: number, angle: number) {
		super(length, 2);

		this._x = x;
		this._y = y;
		this._length = length;
		this._angle = angle;
	}

	override Update(dt: number) {
		this._lifetime += dt;

		if (this._lifetime >= Bullet._maxLifetime) Scene.Destroy(this);
	}

	override Render(): void {
		Canvas.DrawRectangleWithGradientAndAngle(
			new Rectangle(this._x, this._y, this._length, 2),
			[this._lifetime / Bullet._maxLifetime, Bullet._bulletColor0],
			[1, Bullet._bulletColor1],
			this._angle,
			0,
			1
		);
	}
}
