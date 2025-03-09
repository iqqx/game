import { Layout } from "./Layout.js";
export class FreeLayout extends Layout {
    constructor() {
        super();
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
    }
}
//# sourceMappingURL=FreeLayout.js.map