import { Canvas } from "../Context.js";
import { Scene } from "../Scene.js";
import { GameObject, Rectangle, LoadImage } from "../Utilites.js";

export class Fireball extends GameObject {
	private static readonly _image = LoadImage("Images/fire.png");
	private static readonly _maxLifetime = 100;

	private readonly _angle: number;
	private _lifetime = 0;

	constructor(x: number, y: number, angle: number) {
		super(length, 2);

		this._x = x;
		this._y = y;
		this._angle = angle;
	}

	override Update(dt: number) {
		this._lifetime += dt;

		if (this._lifetime >= Fireball._maxLifetime) this.Destroy();
	}

	override Render(): void {
		Canvas.DrawImageWithAngle(
			Fireball._image,
			new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, 100, 50),
			this._angle,
			0,
			25
		);
	}
}
