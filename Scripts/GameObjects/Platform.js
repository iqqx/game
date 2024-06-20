import { Tag } from "../Enums.js";
import { Rectangle } from "../Utilites.js";
import { GameObject } from "./GameObject.js";
export class Platform extends GameObject {
    constructor(x, y, width) {
        super(width, 5);
        this.Tag = Tag.Platform;
        this._x = x;
        this._y = y;
        this._collider = new Rectangle(0, 0, width, 5);
    }
}
//# sourceMappingURL=Platform.js.map