import { Canvas } from "../../Context.js";
import { Direction } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { Rectangle, Vector2 } from "../../Utilites.js";
export class Item {
    Id;
    Icon;
    IsBig;
    MaxStack;
    _count = 0;
    _x;
    _y;
    _angle;
    _direction;
    constructor(id, icon, stack, isBig = false) {
        this.Id = id;
        this.Icon = icon;
        this.MaxStack = stack;
        this.IsBig = isBig;
    }
    Is(other) {
        return this.Id === other.Id;
    }
    Clone() {
        return new Item(this.Id, this.Icon, this.MaxStack);
    }
    Update(dt, position, angle, direction) {
        this._x = position.X;
        this._y = position.Y;
        this._angle = angle;
        this._direction = direction;
    }
    Render() {
        const gripOffset = new Vector2(this.Icon.ScaledSize.X * -0.5, this.Icon.ScaledSize.Y * 0.5);
        if (this._direction === Direction.Left) {
            Canvas.DrawImageWithAngleVFlipped(this.Icon, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Icon.ScaledSize.X, this.Icon.ScaledSize.Y), this._angle, gripOffset.X, gripOffset.Y);
        }
        else {
            Canvas.DrawImageWithAngle(this.Icon, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Icon.ScaledSize.X, this.Icon.ScaledSize.Y), this._angle, gripOffset.X, gripOffset.Y);
        }
    }
    GetCount() {
        return this._count;
    }
    Take(count) {
        this._count = Math.clamp(this._count - count, 0, this.MaxStack);
    }
    Add(count) {
        count = Math.abs(count);
        const toAdd = Math.min(count, this.MaxStack - this._count);
        this._count += toAdd;
        return toAdd;
    }
}
//# sourceMappingURL=Item.js.map