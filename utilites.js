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
export function UnorderedRemove(array, index) {
    const element = array[index];
    array[index] = array.pop();
    return element;
}
