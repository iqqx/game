import { GUIBase } from "./GUIBase.js";
export class Layout extends GUIBase {
    _childs = [];
    AddChild(child) {
        child.Parent = this;
        this._childs.push(child);
    }
    ReplaceChild(child, withChild) {
        this._childs[this._childs.indexOf(child)] = withChild;
        withChild.Parent = this;
        child.Parent = undefined;
        child.OnDestroy();
        this.Repack();
    }
    OnDestroy() {
        for (const child of this._childs) {
            child.Parent = undefined;
            child.OnDestroy();
        }
    }
}
//# sourceMappingURL=Layout.js.map