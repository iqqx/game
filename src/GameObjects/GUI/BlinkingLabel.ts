import { GUI } from "../../Context.js";
import { Color } from "../../Utilites.js";
import { GameObject } from "../GameObject.js";

export class BlinkingLabel extends GameObject {
	private readonly _text: string;
	private readonly _colorOff: Color;
	private readonly _colorOn: Color;
	private readonly _cooldown: number;

	private _timeToBlink = 0;
	private _on = false;

	constructor(text: string, x: number, y: number, width: number, height: number, colorOff: Color, colorOn: Color, cooldown: number) {
		super(width, height);

		this._text = text;
		this._x = x;
		this._y = y;
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

	public Render(): void {
		GUI.SetFillColor(this._on ? this._colorOn : this._colorOff);
		GUI.ClearStroke();

		GUI.SetFont(32);
		GUI.DrawTextCenterLineBreaked(this._x, this._y, this._text);
	}
}
