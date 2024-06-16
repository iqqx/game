import { GUI } from "../../Context.js";
import { Color, Rectangle } from "../../Utilites.js";
import { GameObject } from "../GameObject.js";

export class BlinkingRectangle extends GameObject {
	private readonly _colorOff: Color;
	private readonly _colorOn: Color;
	private readonly _cooldown: number;

	private _timeToBlink = 0;
	private _on = false;

	constructor(rect: Rectangle, colorOff: Color, colorOn: Color, cooldown: number) {
		super(rect.Width, rect.Height);

		this._x = rect.X;
		this._y = rect.Y;
		this._colorOff = colorOff;
		this._colorOn = colorOn;
		this._cooldown = cooldown;
	}

	public override Update(dt: number): void {
		this._timeToBlink -= dt;

		if (this._timeToBlink <= 0) {
			this._timeToBlink = this._cooldown;

			this._on = !this._on;
		}
	}

	public override Render(): void {
		GUI.SetFillColor(this._on ? this._colorOn : this._colorOff);
		GUI.ClearStroke();

		GUI.DrawRectangle(this._x - this.Width / 2, this._y - this.Height / 2, this.Width, this.Height);
	}
}
