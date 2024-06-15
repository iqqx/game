import { Scene } from "../Scene.js";
import { Canvas } from "../Context.js";
import { Color, GameObject, Rectangle } from "../Utilites.js";
import { Tag } from "../Enums.js";

export class Ladder extends GameObject {
	constructor(x: number, y: number, height: number) {
		super(50, height);

		this.Tag = Tag.Ladder;
		this._x = x;
		this._y = y;
		this._collider = new Rectangle(0, 0, 50, height);
	}

	override Render(): void {
		Canvas.SetFillColor(new Color(100, 50, 50, 100));
		Canvas.DrawRectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height);
	}
}
