import { GUI } from "../../Context.js";
import { Color } from "../../Utilites.js";
import { GameObject } from "../GameObject.js";

export class Label extends GameObject {
	private readonly _size: number;
	private readonly _text: string;
	private readonly _color: Color;

	constructor(text: string, x: number, y: number, width: number, height: number, size = 12, color = Color.White) {
		super(width, height);

		this._text = text;
		this._x = x;
		this._y = y;
		this._color = color;
		this._size = size;
	}

	public Render(): void {
		GUI.SetFillColor(this._color);
		GUI.SetFont(this._size);
		GUI.DrawTextCenterLineBreaked(this._x, this._y, this._text);
	}
}
