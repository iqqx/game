import { Canvas } from "../Context.js";
import { Scene } from "../Scene.js";
import { Color, GameObject } from "../Utilites.js";

export class Box extends GameObject {
	constructor(x: number, y: number) {
		super(100, 100);

		this._x = x;
		this._y = y;
	}

	override Render(): void {
		Canvas.SetFillColor(new Color(0, 255, 0));
		Canvas.DrawRectangle(this._x - Scene.Current.GetLevelPosition(), this._y, 100, 100);
	}
}
