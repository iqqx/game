import { GUI } from "../../Context.js";
import { GUIBase } from "./GUIBase.js";
export class Image extends GUIBase {
    _image;
    constructor(x, y, width, height, image) {
        super(width, height);
        this._x = x;
        this._y = y;
        this._image = image;
    }
    Render() {
        GUI.DrawImage(this._image, this._x - this.Width / 2, this._y - this.Height / 2, this.Width, this.Height);
    }
}
//# sourceMappingURL=Image.js.map