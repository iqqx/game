import { Container } from "../Assets/Containers/Containers.js";
import { Canvas } from "../Context.js";
import { GetSprite } from "../Game.js";
import { Scene } from "../Scene.js";
import { Rectangle } from "../Utilites.js";
export class Corpse extends Container {
    constructor(x, y, ...items) {
        super(32 * 3, 9 * 3, 3, 1);
        this._x = x;
        this._y = y;
        for (const item of items)
            this.TryPushItem(item);
    }
    Render() {
        Canvas.DrawImage(GetSprite("Corpse"), new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
    }
}
//# sourceMappingURL=Corpse.js.map