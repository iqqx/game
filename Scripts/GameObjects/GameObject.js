import { Rectangle, Vector2 } from "../Utilites.js";
export class GameObject {
    _x = 0;
    _y = 0;
    Width;
    Height;
    _collider;
    OnDestroy;
    Tag;
    constructor(width, height) {
        this.Width = width;
        this.Height = height;
    }
    Destroy() {
        if (this.OnDestroy !== undefined)
            this.OnDestroy();
    }
    GetRectangle() {
        return new Rectangle(this._x, this._y, this.Width, this.Height);
    }
    GetPosition() {
        return new Vector2(this._x, this._y);
    }
    GetSize() {
        return new Vector2(this.Width, this.Height);
    }
    GetCenter() {
        return new Vector2(this._x + this.Width / 2, this._y + this.Height / 2);
    }
    Update(dt) { }
    Render() { }
    GetCollider() {
        return this._collider;
    }
    static IsCollide(who, other) {
        const colliderWho = who.GetCollider();
        const colliderOther = other.GetCollider();
        return (colliderWho !== undefined &&
            colliderOther !== undefined &&
            who._x + colliderWho.Width > other._x &&
            who._x < other._x + colliderOther.Width &&
            who._y + colliderWho.Height > other._y &&
            who._y < other._y + colliderOther.Height);
    }
    static GetCollide(who, other) {
        if (this.IsCollide(who, other) === false)
            return false;
        const xstart = who._x + who.Width - other._x;
        const xend = other._x + other.Width - who._x;
        const ystart = other._y + other.Height - who._y;
        // const yend = who._y + who.Height - other._y;
        const yend = other._y - (who._y + who.Height);
        let xOffset = 0;
        let yOffset = 0;
        // if (xstart > 0 && xend > 0 && xend < other.Width && xstart < other.Width) xOffset = 0;
        // else if (xstart > 0 && (xend < 0 || xstart < xend)) xOffset = xstart;
        // else if (xend > 0) xOffset = -xend;
        // if (ystart > 0 && yend > 0 && yend < other.Height && ystart < other.Height) yOffset = 0;
        // else if (ystart > 0 && (yend < 0 || ystart < yend)) yOffset = ystart;
        // else if (yend > 0) yOffset = -yend;
        // if (xOffset == 0 && yOffset == 0) return false;
        return {
            instance: other,
            position: new Vector2(xOffset, yOffset),
            Normal: new Vector2(Math.sign(xOffset), Math.sign(yOffset)),
            start: new Vector2(xstart, ystart),
            end: new Vector2(xend, yend),
        };
    }
}
export class Interactable extends GameObject {
}
