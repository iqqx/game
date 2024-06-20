import { EnemyType } from "./Enums.js";
Array.prototype.minBy = function (by) {
    let min = this[0];
    for (const element of this)
        if (by(element) < by(min))
            min = element;
    return min;
};
Array.prototype.clear = function () {
    this.length = 0;
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
const imagesLoaded = [];
export function GetLoadedImagesCount() {
    return imagesLoaded.length;
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
        imagesLoaded.push(source);
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
        IsPlayingOriginal: function () {
            return !s.paused;
        },
        StopOriginal: function () {
            s.pause();
        },
    };
}
export function GetEnemyTypeName(enemyType) {
    switch (enemyType) {
        case EnemyType.Rat:
            return "Крыса";
        case EnemyType.Yellow:
            return "Боец ВДНХ";
        case EnemyType.Red:
            return "Боец Ганза";
        case EnemyType.Green:
            return "Боец Ордена";
    }
}
//# sourceMappingURL=Utilites.js.map