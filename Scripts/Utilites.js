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
    static Yellow = new Color(255, 255, 0, 255);
    static Transparent = new Color(0, 0, 0, 0);
    constructor(r, g, b, a = 255) {
        this.R = r;
        this.G = g;
        this.B = b;
        this.A = a;
    }
    toString() {
        return this.A === 255 ? `rgb(${this.R}, ${this.G}, ${this.B})` : `rgba(${this.R}, ${this.G}, ${this.B}, ${this.A / 255})`;
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
export function GetIntersectPoint(line0, line1) {
    const denominator = (line1.Y1 - line1.Y0) * (line0.X0 - line0.X1) - (line1.X1 - line1.X0) * (line0.Y0 - line0.Y1);
    if (denominator == 0) {
        //   if ((x1 * y2 - x2 * y1) * (x4 - x3) - (x3 * y4 - x4 * y3) * (x2 - x1) == 0 && (x1 * y2 - x2 * y1) * (y4 - y3) - (x3 * y4 - x4 * y3) * (y2 - y1) == 0)
        //     System.Console.WriteLine("Отрезки пересекаются (совпадают)");
        //   else
        //     System.Console.WriteLine("Отрезки не пересекаются (параллельны)");
        return undefined;
    }
    else {
        const numerator_a = (line1.X1 - line0.X1) * (line1.Y1 - line1.Y0) - (line1.X1 - line1.X0) * (line1.Y1 - line0.Y1);
        const numerator_b = (line0.X0 - line0.X1) * (line1.Y1 - line0.Y1) - (line1.X1 - line0.X1) * (line0.Y0 - line0.Y1);
        const Ua = numerator_a / denominator;
        const Ub = numerator_b / denominator;
        if (Ua >= 0 && Ua <= 1 && Ub >= 0 && Ub <= 1)
            return new Vector2(line1.X0 * Ub + line1.X1 * (1 - Ub), line1.Y0 * Ub + line1.Y1 * (1 - Ub));
        else
            return undefined;
    }
}
export function SquareMagnitude(x0, y0, x1, y1) {
    return (x0 - x1) ** 2 + (y0 - y1) ** 2;
}
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
        const yend = who._y + who.Height - other._y;
        let xOffset = 0;
        let yOffset = 0;
        if (xstart > 0 && xend > 0 && xend < other.Width && xstart < other.Width)
            xOffset = 0;
        else if (xstart > 0 && (xend < 0 || xstart < xend))
            xOffset = xstart;
        else if (xend > 0)
            xOffset = -xend;
        if (ystart > 0 && yend > 0 && yend < other.Height && ystart < other.Height)
            yOffset = 0;
        else if (ystart > 0 && (yend < 0 || ystart < yend))
            yOffset = ystart;
        else if (yend > 0)
            yOffset = -yend;
        if (xOffset == 0 && yOffset == 0)
            return false;
        return { instance: other, position: new Vector2(xOffset, yOffset) };
    }
}
export class Vector2 {
    X;
    Y;
    static Down = new Vector2(0, -1);
    static Zero = new Vector2(0, 0);
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
let imagesLoaded = 0;
export function IsImagesLoaded() {
    return imagesLoaded >= 36;
}
export function LoadImage(source, boundingBox, scale) {
    const img = new Image();
    const cte = {
        Image: img,
        BoundingBox: boundingBox,
        Scale: scale,
        ScaledSize: new Vector2(0, 0),
    };
    img.onload = () => {
        cte.Scale = scale ?? 1;
        cte.BoundingBox = boundingBox ?? new Rectangle(0, 0, img.naturalWidth, img.naturalHeight);
        cte.ScaledSize = new Vector2(cte.BoundingBox.Width * scale, cte.BoundingBox.Height * scale);
        imagesLoaded++;
    };
    img.src = source;
    return cte;
}
export function LoadSound(source) {
    const s = new Audio(source);
    s.volume = 1;
    return {
        Speed: 1,
        Volume: 1,
        Play: function (volume, speed) {
            if (volume === undefined && speed === undefined)
                s.cloneNode().play();
            else {
                const c = s.cloneNode();
                c.volume = volume ?? this.Volume;
                c.playbackRate = speed ?? this.Speed;
                c.play();
            }
        },
        Apply: function () {
            s.volume = this.Volume;
            s.playbackRate = this.Speed;
        },
        PlayOriginal: function () {
            s.play();
        },
    };
}
export class Interactable extends GameObject {
}
