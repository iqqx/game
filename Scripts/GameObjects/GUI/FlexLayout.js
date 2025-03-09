import { GUI } from "../../Context.js";
import { Layout } from "./Layout.js";
export class FlexLayout extends Layout {
    _justify;
    _align;
    _gap;
    _horizontal;
    constructor(justify = "START", align = "START", gap = 0, padding = [0, 0, 0, 0], isHorizontal = false) {
        super();
        this._horizontal = isHorizontal;
        this.Padding = padding;
        this._justify = justify;
        this._align = align;
        this._gap = gap;
    }
    Update(dt) {
        for (let i = 0; i < this._childs.length; ++i)
            this._childs[i].Update(dt);
    }
    Render() {
        for (let i = 0; i < this._childs.length; ++i) {
            this._childs[i].Render();
        }
    }
    Repack() {
        for (let i = 0; i < this._childs.length; ++i) {
            const child = this._childs[i];
            if (child instanceof Layout)
                child.Repack();
        }
        let totalHeight = (this._childs.length - 1) * this._gap;
        for (let i = 0; i < this._childs.length; ++i) {
            if (this._horizontal)
                totalHeight = Math.max(this._childs[i].Height, totalHeight);
            else
                totalHeight += this._childs[i].Height;
        }
        let totalWidth = this._justify === "SPACE" ? GUI.Width : (this._childs.length - 1) * this._gap;
        if (this._justify !== "SPACE")
            for (let i = 0; i < this._childs.length; ++i) {
                totalWidth += this._childs[i].Width;
            }
        this.Width = totalWidth;
        this.Height = totalHeight;
        let x = (() => {
            switch (this._justify) {
                case "START": {
                    return this.Padding[3];
                }
                case "CENTER": {
                    return 0.5 * (GUI.Width - totalWidth);
                }
                case "END": {
                    return GUI.Width - totalWidth - this.Padding[1];
                }
                case "SPACE": {
                    return this.Padding[3];
                }
            }
        })();
        let y = (() => {
            switch (this._align) {
                case "START": {
                    return this.Padding[0];
                }
                case "CENTER": {
                    return 0.5 * (GUI.Height - totalHeight);
                }
                case "END": {
                    return GUI.Height - totalHeight - this.Padding[2];
                }
            }
        })();
        for (let i = 0; i < this._childs.length; ++i) {
            const child = this._childs[i];
            if (this._horizontal) {
                switch (this._align) {
                    case "START": {
                        child.Y = y;
                        break;
                    }
                    case "CENTER": {
                        break;
                    }
                    case "END": {
                        child.Y = y;
                        break;
                    }
                }
                child.X = x;
                x += child.Width + this._gap;
            }
            else {
                child.X = x;
                child.Y = y;
                switch (this._align) {
                    case "START": {
                        child.Y = 0;
                        break;
                    }
                    case "CENTER": {
                        y += child.Height + this._gap;
                        break;
                    }
                    case "END": {
                        break;
                    }
                }
                switch (this._justify) {
                    case "START": {
                        child.X = 0;
                        break;
                    }
                    case "CENTER": {
                        child.X = 0.5 * (GUI.Width - child.Width);
                        break;
                    }
                    case "END": {
                        break;
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=FlexLayout.js.map