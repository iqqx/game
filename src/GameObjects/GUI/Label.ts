import { GUI } from "../../Context.js";
import { Color } from "../../Utilites.js";
import { GameObject } from "../GameObject.js";

export class Label extends GameObject {
	private readonly _text: string;
	private readonly _color: Color;

	constructor(text: string, x: number, y: number, width: number, height: number, color = Color.White) {
		super(width, height);

		this._text = text;
		this._x = x;
		this._y = y;
		this._color = color;
	}

	public Render(): void {
		GUI.SetFillColor(this._color);
		GUI.SetFont(36);
		GUI.DrawTextCenter(this._text, this._x, this._y, this.Width, this.Height);
	}
}
