import { GUI } from "../../Context.js";
import { Color } from "../../Utilites.js";
import { Button } from "./Button.js";

export class TextButton extends Button {
	private _text: string;
	private _size: number;

	constructor(x: number, y: number, width: number, height: number, text: string, size: number) {
		super(x, y, width, height);

		this._text = text;
		this._size = size;
	}

	public override Render() {
		super.Render();

		GUI.SetFillColor(Color.White);
		GUI.SetFont(this._size);
		GUI.DrawTextCenter(this._text, this._x - this.Width / 2, this._y - this.Height / 2, this.Width, this.Height);
	}
}
