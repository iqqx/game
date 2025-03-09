import { Rectangle } from "../Utilites.js";
import { Tag } from "../Enums.js";
import { GameObject } from "./GameObject.js";

export class Ladder extends GameObject {
	constructor(x: number, y: number, height: number) {
		super(1, height);

		this.Tag = Tag.Ladder;
		this._x = x;
		this._y = y;
		this._collider = new Rectangle(0, 0, this.Width, height);
	}
}
