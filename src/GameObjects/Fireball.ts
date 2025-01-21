import { Canvas } from "../Context.js";
import { GetSprite } from "../AssetsLoader.js";
import { Scene } from "../Scene.js";
import { Rectangle, Sprite, Vector2 } from "../Utilites.js";
import { GameObject } from "./GameObject.js";

export class Fireball extends GameObject {
	private readonly _frames: Sprite[] = GetSprite("Fireball");
	private readonly _angle: number;
	private _lifetime = 80;
	private readonly _frameNumber;

	constructor(position: Vector2, angle: number) {
		super(length, 2);

		this._x = position.X;
		this._y = position.Y;
		this._angle = angle;

		this._frameNumber = Math.floor(Math.random() * this._frames.length) % this._frames.length;
	}

	override Update(dt: number) {
		this._lifetime -= dt;

		if (this._lifetime <= 0) this.Destroy();
	}

	override Render(): void {
		const frame = this._frames[this._frameNumber];

		Canvas.DrawImageWithAngle(
			frame,
			new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, frame.ScaledSize.X, frame.ScaledSize.Y),
			this._angle,
			0,
			frame.ScaledSize.Y * 0.5
		);
	}
}
