import { Canvas } from "../../Context.js";
import { Direction } from "../../Enums.js";
import { Rectangle, Vector2 } from "../../Utilites.js";
export class Item {
    Name;
    Id;
    Icon;
    IsBig;
    MaxStack;
    _count = 0;
    _x;
    _y;
    _angle;
    _direction;
    constructor(id, name, icon, stack, isBig = false) {
        this.Id = id;
        this.Icon = icon;
        this.MaxStack = stack;
        this.IsBig = isBig;
        this.Name = name;
    }
    Is(other) {
        return this.Id === other.Id;
    }
    Clone() {
        return new Item(this.Id, this.Name, this.Icon, this.MaxStack);
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
            Canvas.DrawImageWithAngleVFlipped(this.Icon, new Rectangle(this._x, this._y, this.Icon.ScaledSize.X, this.Icon.ScaledSize.Y), this._angle, gripOffset.X, gripOffset.Y);
        }
        else {
            Canvas.DrawImageWithAngle(this.Icon, new Rectangle(this._x, this._y, this.Icon.ScaledSize.X, this.Icon.ScaledSize.Y), this._angle, gripOffset.X, gripOffset.Y);
        }
    }
    GetCount() {
        return this._count;
    }
    Take(count) {
        const was = this._count;
        this._count = Math.clamp(this._count - count, 0, this.MaxStack);
        return was - this._count;
    }
    Add(count) {
        count = Math.abs(count);
        const toAdd = Math.min(count, this.MaxStack - this._count);
        this._count += toAdd;
        return toAdd;
    }
    AddItem(item) {
        if (this._count >= this.MaxStack)
            return false;
        const toAdd = Math.min(item.GetCount(), this.MaxStack - this._count);
        this._count += toAdd;
        item.Take(toAdd);
        return item.GetCount() === 0;
    }
}
//# sourceMappingURL=Item.js.map