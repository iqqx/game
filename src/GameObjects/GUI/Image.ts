import { GUI } from "../../Context.js";
import { Sprite } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";

export class Image extends GUIBase {
	private readonly _image: Sprite;

	constructor(x: number, y: number, width: number, height: number, image: Sprite) {
		super(width, height);

		this._x = x;
		this._y = y;
		this._image = image;
	}

	public override Render() {
		GUI.DrawImage(this._image, this._x - this.Width / 2, this._y - this.Height / 2, this.Width, this.Height);
	}
}
