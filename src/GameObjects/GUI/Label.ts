import { GUI } from "../../Context.js";
import { Color } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";

export class Label extends GUIBase {
	private readonly _size: number;
	private readonly _text: string;
	private readonly _color: Color;

	constructor(text: string, size = 12, color = Color.White) {
		super();

		this._text = text;
		this._color = color;
		this._size = size;

		GUI.SetFont(size);
		this.Width = GUI.GetTextSize(text, true).X;
		this.Height = GUI.GetTextSize(text, true).Y;
	}

	public Update(dt: number): void {}

	public Render(): void {
		GUI.SetFillColor(this._color);
		GUI.SetFont(this._size);
		GUI.DrawText(this.X, this.Y, this._text);
	}
}
