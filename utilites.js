import { Canvas } from "./context.js";
import { Tag } from "./Enums.js";
export function Lerp(start, end, t) {
    return start * (1 - t) + end * t;
}
export class Color {
    R;
    G;
    B;
    A;
    static White = new Color(255, 255, 255, 255);
    static Black = new Color(0, 0, 0, 255);
    static Red = new Color(255, 0, 0, 255);
    static Transparent = new Color(0, 0, 0, 0);
    constructor(r, g, b, a = 255) {
        this.R = r;
        this.G = g;
        this.B = b;
        this.A = a;
    }
    toString() {
        return this.A === 255
            ? `rgb(${this.R}, ${this.G}, ${this.B})`
            : `rgba(${this.R}, ${this.G}, ${this.B}, ${this.A / 255})`;
    }
}
export class Rectangle {
    X;
    Y;
    Width;
    Height;
    constructor(x, y, width, height) {
        this.X = x;
        this.Y = y;
        this.Width = width;
        this.Height = height;
    }
}
export class Line {
    X0;
    Y0;
    X1;
    Y1;
    constructor(x0, y0, x1, y1) {
        this.X0 = x0;
        this.Y0 = y0;
        this.X1 = x1;
        this.Y1 = y1;
    }
}
export function UnorderedRemove(array, index) {
    const element = array[index];
    array[index] = array.pop();
    return element;
}
Array.prototype.minBy = function (by) {
    let min = this[0];
    for (const element of this)
        if (by(element) < by(min))
            min = element;
    return min;
};
Math.clamp = function (n, min, max) {
    return Math.min(Math.max(n, min), max);
};
export function GetIntersectPoint(line0, line1) {
    const v = line0.X1 - line0.X0;
    const w = line0.Y1 - line0.Y0;
    const v2 = line1.X1 - line1.X0;
    const w2 = line1.Y1 - line1.Y0;
    const t2 = (-w * line1.X0 + w * line0.X0 + v * line1.Y0 - v * line0.Y0) /
        (w * v2 - v * w2);
    const t = (line1.X0 - line0.X0 + v2 * t2) / v;
    if (t < 0 ||
        t > 1 ||
        t2 < 0 ||
        t2 > 1 ||
        Number.isNaN(t2) ||
        Number.isNaN(t))
        return undefined;
    else
        return new Vector2(line1.X0 + v2 * t2, line1.Y0 + w2 * t2);
}
export function SquareMagnitude(x0, y0, x1, y1) {
    return (x0 - x1) ** 2 + (y0 - y1) ** 2;
}
export class GameObject {
    _x = 0;
    _y = 0;
    _width;
    _height;
    _collider;
    OnDestroy;
    Tag;
    constructor(width, height) {
        this._width = width;
        this._height = height;
    }
    Destroy() {
        if (this.OnDestroy !== undefined)
            this.OnDestroy();
    }
    GetPosition() {
        return new Vector2(this._x, this._y);
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
        const xstart = who._x + who._width - other._x;
        const xend = other._x + other._width - who._x;
        const ystart = other._y + other._height - who._y;
        const yend = who._y + who._height - other._y;
        let xOffset = 0;
        let yOffset = 0;
        if (xstart > 0 &&
            xend > 0 &&
            xend < other._width &&
            xstart < other._width)
            xOffset = 0;
        else if (xstart > 0 && (xend < 0 || xstart < xend))
            xOffset = xstart;
        else if (xend > 0)
            xOffset = -xend;
        if (ystart > 0 &&
            yend > 0 &&
            yend < other._height &&
            ystart < other._height)
            yOffset = 0;
        else if (ystart > 0 && (yend < 0 || ystart < yend))
            yOffset = ystart;
        else if (yend > 0)
            yOffset = -yend;
        if (xOffset == 0 && yOffset == 0)
            return false;
        return new Vector2(xOffset, yOffset);
    }
}
export class Entity extends GameObject {
    _maxHealth;
    _speed;
    _direction = 1;
    _health;
    _movingLeft = false;
    _movingRight = false;
    _verticalAcceleration = 0;
    _grounded = true;
    _jumpForce = 25;
    _xTarget = 0;
    _yTarget = 0;
    constructor(width, height, speed, maxHealth) {
        super(width, height);
        this._speed = Math.clamp(speed, 0, Number.MAX_VALUE);
        this._health = Math.clamp(maxHealth, 1, Number.MAX_VALUE);
        this._maxHealth = this._health;
        this._collider = new Rectangle(this._x, this._y, this._width, this._height);
    }
    Update(dt) {
        this.ApplyVForce();
        if (this._movingLeft)
            this.MoveLeft();
        else if (this._movingRight)
            this.MoveRight();
        this._direction = this._xTarget > this._x + this._width / 2 ? 1 : -1;
    }
    MoveRight() {
        this._x += this._speed;
        const collideOffsets = Scene.Current.GetCollide(this, Tag.Platform);
        if (collideOffsets !== false && collideOffsets.X != 0)
            this._x -= collideOffsets.X;
    }
    MoveLeft() {
        this._x -= this._speed;
        const collideOffsets = Scene.Current.GetCollide(this, Tag.Platform);
        if (collideOffsets !== false && collideOffsets.X != 0)
            this._x -= collideOffsets.X;
    }
    Jump() {
        if (!this._grounded)
            return;
        this._verticalAcceleration = this._jumpForce;
    }
    ApplyVForce() {
        this._verticalAcceleration -= this._verticalAcceleration > 0 ? 2 : 3;
        this._y += this._verticalAcceleration;
        if (this._verticalAcceleration <= 0) {
            const offsets = Scene.Current.GetCollide(this, Tag.Platform);
            if (offsets !== false && offsets.Y !== 0) {
                this._verticalAcceleration = 0;
                this._grounded = true;
                this._y += offsets.Y;
            }
        }
        else if (this._verticalAcceleration > 0) {
            this._grounded = false;
            const offsets = Scene.Current.GetCollide(this, Tag.Platform);
            if (offsets !== false) {
                this._verticalAcceleration = 0;
                this._y += offsets.Y;
                return;
            }
        }
    }
    TakeDamage(damage) {
        this._health -= damage;
    }
}
export class Platform extends GameObject {
    constructor(x, y, width, height) {
        super(width, height);
        this.Tag = Tag.Platform;
        this._x = x;
        this._y = y;
        this._collider = new Rectangle(0, 0, width, height);
    }
    Render() {
        Canvas.SetFillColor(Color.Black);
        Canvas.DrawRectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this._width, this._height);
    }
}
export class Vector2 {
    X;
    Y;
    constructor(X, Y) {
        this.X = X;
        this.Y = Y;
    }
    Normalize() {
        const length = this.GetLength();
        return new Vector2(this.X / length, this.Y / length);
    }
    GetLength() {
        return Math.sqrt(this.X ** 2 + this.Y ** 2);
    }
}
export class Scene {
    static Current;
    _gameObjects;
    Player;
    Length;
    _levelPosition = 0;
    constructor(player, Length) {
        this.Length = Length;
        this.Player = player;
        Scene.Current = this;
        this._gameObjects = [
            player,
            new Platform(0, 750, Length, 100),
            new Platform(Length, 0, 100, 1000),
            new Platform(0, -100, Length, 100),
            new Platform(-100, 0, 100, 1000),
        ];
    }
    GetLevelPosition() {
        return this._levelPosition;
    }
    GetCollide(who, tag) {
        for (const object of this._gameObjects) {
            if (tag !== undefined && object.Tag !== tag)
                continue;
            const collide = GameObject.GetCollide(who, object);
            if (collide !== false)
                return collide;
        }
        return false;
    }
    IsCollide(who, tag) {
        for (const object of this._gameObjects) {
            if (tag !== undefined && object.Tag !== tag)
                continue;
            const collide = GameObject.IsCollide(who, object);
            if (collide !== false)
                return collide;
        }
        return false;
    }
    Raycast(from, direction, distance, tag) {
        const result = [];
        const normalized = direction.Normalize();
        const line = new Line(from.X, from.Y, from.X + normalized.X * distance, from.Y + normalized.Y * distance);
        for (const object of this._gameObjects) {
            if (tag !== undefined && (object.Tag & tag) === 0)
                continue;
            const collider = object.GetCollider();
            if (collider === undefined)
                continue;
            const pos = object.GetPosition();
            const top = GetIntersectPoint(line, new Line(pos.X, pos.Y + collider.Height, pos.X + collider.Width, pos.Y + collider.Height));
            const right = GetIntersectPoint(line, new Line(pos.X + collider.Width, pos.Y, pos.X + collider.Width, pos.Y + collider.Height));
            const bottom = GetIntersectPoint(line, new Line(pos.X, pos.Y, pos.X + collider.Width, pos.Y));
            const left = GetIntersectPoint(line, new Line(pos.X, pos.Y, pos.X, pos.Y + collider.Height));
            if (top !== undefined)
                result.push({ position: top, instance: object });
            if (right !== undefined)
                result.push({ position: right, instance: object });
            if (bottom !== undefined)
                result.push({ position: bottom, instance: object });
            if (left !== undefined)
                result.push({ position: left, instance: object });
        }
        return result.length === 0
            ? undefined
            : result.sort((a, b) => (a.position.X - from.X) ** 2 +
                (a.position.Y - from.Y) ** 2 -
                ((b.position.X - from.X) ** 2 +
                    (b.position.Y - from.Y) ** 2));
    }
    Update(dt) {
        const plrPos = this.Player.GetPosition();
        const plrSize = this.Player.GetCollider();
        this._levelPosition = Lerp(this._levelPosition, Math.clamp(plrPos.X - 1500 / 2 - plrSize.Width / 2, 0, this.Length - 1500), dt / 500);
        for (const object of this._gameObjects)
            object.Update(dt);
    }
    Render() {
        Canvas.SetFillColor(new Color(50, 50, 50));
        Canvas.DrawRectangleFixed(0, 0, this.Length, 750);
        for (const object of this._gameObjects)
            object.Render();
    }
    RenderOverlay() {
        this.Player.RenderOverlay();
    }
    Instantiate(object) {
        const index = this._gameObjects.push(object) - 1;
        object.OnDestroy = () => this._gameObjects.splice(index);
    }
}
export class Bullet extends GameObject {
    static _bulletColor0 = new Color(255, 255, 255, 5);
    static _bulletColor1 = new Color(255, 255, 255, 50);
    static _maxLifetime = 200;
    _length;
    _angle;
    _lifetime = 0;
    constructor(x, y, length, angle) {
        super(length, 2);
        this._x = x;
        this._y = y;
        this._length = length;
        this._angle = angle;
    }
    Update(dt) {
        this._lifetime += dt;
        if (this._lifetime >= Bullet._maxLifetime)
            this.Destroy();
    }
    Render() {
        Canvas.DrawRectangleWithGradientAndAngle(new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this._length, 2), [this._lifetime / Bullet._maxLifetime, Bullet._bulletColor0], [1, Bullet._bulletColor1], this._angle, 0, 1);
    }
}
