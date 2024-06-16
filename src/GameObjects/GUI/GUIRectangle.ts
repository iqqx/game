import { GUI } from "../../Context.js";
import { Color, Rectangle } from "../../Utilites.js";
import { GameObject } from "../GameObject.js";

export class GUIRectangle extends GameObject {
	private readonly _color: Color;

	constructor(rect: Rectangle, color: Color) {
		super(rect.Width, rect.Height);

		this._x = rect.X;
		this._y = rect.Y;
		this._color = color;
	}

	public override Render(): void {
		GUI.SetFillColor(this._color);
		GUI.ClearStroke();

		GUI.DrawRectangle(this._x - this.Width / 2, this._y - this.Height / 2, this.Width, this.Height);
	}
}
