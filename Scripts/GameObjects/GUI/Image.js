import { GUI } from "../../Context.js";
import { GUIBase } from "./GUIBase.js";
export class Image extends GUIBase {
    _image;
    constructor(width, height, image) {
        super();
        this.Width = width;
        this.Height = height;
        this._image = image;
    }
    Update(dt) { }
    Render() {
        GUI.DrawImage(this._image, this.X, this.Y, this.Width, this.Height);
    }
}
//# sourceMappingURL=Image.js.map