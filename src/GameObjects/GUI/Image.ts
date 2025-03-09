import { GUI } from "../../Context.js";
import { Sprite } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";

export class Image extends GUIBase {
	private readonly _image: Sprite;

	constructor(width: number, height: number, image: Sprite) {
		super();

		this.Width = width;
		this.Height = height;
		this._image = image;
	}

	public override Update(dt: number) {}

	public override Render() {
		GUI.DrawImage(this._image, this.X, this.Y, this.Width, this.Height);
	}
}
