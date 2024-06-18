import { Canvas } from "../Context.js";
import { Scene } from "../Scene.js";
import { Rectangle } from "../Utilites.js";
import { Interactable } from "./GameObject.js";
export class ItemDrop extends Interactable {
    ContentItem;
    constructor(x, y, item) {
        super(item.Icon.BoundingBox.Width, item.Icon.BoundingBox.Height);
        this.ContentItem = item;
        this._x = x;
        this._y = y;
    }
    Render() {
        Canvas.DrawImage(this.ContentItem.Icon, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
    }
    GetInteractives() {
        return ["подобрать"];
    }
    OnInteractSelected(id) {
        if (id === 0 && Scene.Player.TryPushItem(this.ContentItem))
            Scene.Current.DestroyGameObject(this);
    }
}
