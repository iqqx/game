import { Container } from "../Assets/Containers/Containers.js";
import { Canvas } from "../Context.js";
import { GetSprite } from "../Game.js";
import { Scene } from "../Scene.js";
import { Rectangle } from "../Utilites.js";
export class RatCorpse extends Container {
    constructor(x, y, ...items) {
        super(32 * 2, 10 * 2, 3, 1);
        this._x = x;
        this._y = y;
        for (const item of items)
            this.TryPushItem(item);
    }
    Render() {
        Canvas.DrawImage(GetSprite("RatCorpse"), new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
    }
}
