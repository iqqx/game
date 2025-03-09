import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { Rectangle } from "../../Utilites.js";
import { Interactable } from "../GameObject.js";
export class Character extends Interactable {
    _completedQuests = 0;
    _isTalked = false;
    _sprite;
    constructor(x, y, sprite) {
        super(50, 100);
        this.Tag = Tag.NPC;
        this._x = x;
        this._y = y;
        this._sprite = sprite;
    }
    Render() {
        const ratio = this.Height / this._sprite.BoundingBox.Height;
        Canvas.DrawImage(this._sprite, new Rectangle(this._x, this._y, this._sprite.BoundingBox.Width * ratio, this.Height));
    }
    GetDialog() {
        this._isTalked = true;
        return;
    }
    IsTalked() {
        return this._isTalked;
    }
    GetAvatar() {
        return null;
    }
    GetInteractives() {
        return ["говорить"];
    }
    OnInteractSelected(id) {
        switch (id) {
            case 0:
                Scene.Current.Player.SpeakWith(this);
                break;
        }
    }
    GetCompletedQuestsCount() {
        return this._completedQuests;
    }
    GetName() {
        return "НЕКТО";
    }
}
//# sourceMappingURL=Character.js.map