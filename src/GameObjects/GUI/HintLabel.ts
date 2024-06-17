import { GUI } from "../../Context.js";
import { Scene } from "../../Scene.js";
import { Color } from "../../Utilites.js";
import { GameObject } from "../GameObject.js";

export class HintLabel extends GameObject {
	private readonly _text: string;

	constructor(text: string, x: number, y: number) {
		super(500, 0);

		this._text = text;
		this._x = x;
		this._y = y;
	}

	public override Render(): void {
		GUI.SetFillColor(new Color(255, 255, 255, (Math.sin(Scene.Time / 1000) + 3) * 50));
		GUI.SetFont(12);
		GUI.DrawTextCenter(this._text, this._x - this.Width / 2, this._y - this.Height / 2, this.Width, this.Height);
	}
}
