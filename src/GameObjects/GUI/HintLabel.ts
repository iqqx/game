import { GUI } from "../../Context.js";
import { Scene } from "../../Scenes/Scene.js";
import { Color } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";

export class HintLabel extends GUIBase {
	private readonly _text: string;
	private readonly _size: number;

	constructor(text: string, fontSize: number) {
		super();

		this._text = text;
		this._size = fontSize;

		GUI.SetFont(fontSize);
		this.Width = GUI.GetTextSize(text, true).X;
		this.Height = GUI.GetTextSize(text, true).Y;
	}

	public override Update(dt: number) {}

	public override Render(): void {
		GUI.SetFillColor(new Color(255, 255, 255, 100 + (Math.sin(Scene.Time / 500) + 1) * 20));
		GUI.SetFont(this._size);
		GUI.DrawText(this.X, this.Y, this._text);
	}
}
