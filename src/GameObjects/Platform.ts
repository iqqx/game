import { Tag } from "../Enums.js";
import { Rectangle } from "../Utilites.js";
import { GameObject } from "./GameObject.js";

export class Platform extends GameObject {
	constructor(x: number, y: number, width: number, height: number) {
		super(width, height);

		this.Tag = Tag.Platform;
		this._x = x;
		this._y = y;

		this._collider = new Rectangle(0, 0, width, height);
	}
}
