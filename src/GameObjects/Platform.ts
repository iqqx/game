import { Tag } from "../Enums.js";
import { Rectangle, GameObject } from "../Utilites.js";

export class Platform extends GameObject {
	constructor(x: number, y: number, width: number, height: number) {
		super(width, height);

		this.Tag = Tag.Platform;
		this._x = x;
		this._y = y;

		this._collider = new Rectangle(0, 0, width, height);
	}
}
