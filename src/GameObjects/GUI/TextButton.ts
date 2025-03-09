import { GUI } from "../../Context.js";
import { Color } from "../../Utilites.js";
import { Button } from "./Button.js";

export class TextButton extends Button {
	private _text: string;
	private _size: number;

	constructor(width: number, height: number, text: string, size: number) {
		super(width, height);

		this._text = text;
		this._size = size;
	}

	public override Render() {
		super.Render();

		GUI.SetFillColor(this.Enabled ? Color.White : new Color(100, 100, 100));
		GUI.SetFont(this._size);
		GUI.DrawTextCenter(this._text, this.X, this.Y, this.Width, this.Height);
	}
}
