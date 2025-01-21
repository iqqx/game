import { Rectangle } from "../Utilites.js";
import { Tag } from "../Enums.js";
import { GameObject } from "./GameObject.js";

export class Wall extends GameObject {
	constructor(x: number, y: number, width: number, height: number) {
		super(width, height);

		this.Tag = Tag.Wall;
		this._x = x;
		this._y = y;

		this._collider = new Rectangle(0, 0, width, height);
	}
}
