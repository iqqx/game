export function Clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}
export function Lerp(start, end, t) {
    return start * (1 - t) + end * t;
}
export class Color {
    _r;
    _g;
    _b;
    _a;
    static White = new Color(255, 255, 255, 255);
    static Black = new Color(0, 0, 0, 255);
    static Transparent = new Color(0, 0, 0, 0);
    constructor(r, g, b, a = 255) {
        this._r = r;
        this._g = g;
        this._b = b;
        this._a = a;
    }
    toString() {
        return this._a === 255
            ? `rgb(${this._r}, ${this._g}, ${this._b})`
            : `rgba(${this._r}, ${this._g}, ${this._b}, ${this._a / 255})`;
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
export function GetIntersectPoint(line0, line1) {
    const v = line0.X1 - line0.X0;
    const w = line0.Y1 - line0.Y0;
    const v2 = line1.X1 - line1.X0;
    const w2 = line1.Y1 - line1.Y0;
    const t2 = (-w * line1.X0 + w * line0.X0 + v * line1.Y0 - v * line0.Y0) /
        (w * v2 - v * w2);
    const t = (line1.X0 - line0.X0 + v2 * t2) / v;
    if (t < 0 || t > 1 || t2 < 0 || t2 > 1)
        return undefined;
    else
        return { x: line1.X0 + v2 * t2, y: line1.Y0 + w2 * t2 };
}
export function GetIntersectPointWithRectangle(line, rectangle) {
    const result = [];
    const top = GetIntersectPoint(line, new Line(rectangle.X, rectangle.Y + rectangle.Height, rectangle.X + rectangle.Width, rectangle.Y + rectangle.Height));
    const right = GetIntersectPoint(line, new Line(rectangle.X + rectangle.Width, rectangle.Y, rectangle.X + rectangle.Width, rectangle.Y + rectangle.Height));
    const bottom = GetIntersectPoint(line, new Line(rectangle.X, rectangle.Y, rectangle.X + rectangle.Width, rectangle.Y));
    const left = GetIntersectPoint(line, new Line(rectangle.X, rectangle.Y, rectangle.X, rectangle.Y + rectangle.Height));
    // console.log("/////////////////");
    if (top !== undefined) {
        // console.log(`TOP: ${top.x}, ${top.y} => ${top.x ** 2 + top.y ** 2}`);
        result.push(top);
    }
    if (right !== undefined) {
        // console.log(
        // 	`RIGHT: ${right.x}, ${right.y} => ${right.x ** 2 + right.y ** 2}`
        // );
        result.push(right);
    }
    if (bottom !== undefined) {
        // console.log(
        // 	`BOTTOM: ${bottom.x}, ${bottom.y} => ${
        // 		bottom.x ** 2 + bottom.y ** 2
        // 	}`
        // );
        result.push(bottom);
    }
    if (left !== undefined) {
        // console.log(
        // 	`LEFT: ${left.x}, ${left.y} => ${left.x ** 2 + left.y ** 2}`
        // );
        result.push(left);
    }
    result.sort((a, b) => (a.x - line.X0) ** 2 +
        (a.y - line.Y0) ** 2 -
        ((b.x - line.X0) ** 2 + (b.y - line.Y0) ** 2));
    return result[0];
}
