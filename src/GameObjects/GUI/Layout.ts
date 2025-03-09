import { GUIBase } from "./GUIBase.js";

export abstract class Layout extends GUIBase {
	protected readonly _childs: GUIBase[] = [];

	public abstract Repack(): void;

	public AddChild(child: GUIBase) {
		child.Parent = this;

		this._childs.push(child);
	}

	public ReplaceChild(child: GUIBase, withChild: GUIBase) {
		this._childs[this._childs.indexOf(child)] = withChild;
		withChild.Parent = this;
		child.Parent = undefined;
		child.OnDestroy();

		this.Repack();
	}

	public override OnDestroy(): void {
		for (const child of this._childs) {
			child.Parent = undefined;
			child.OnDestroy();
		}
	}
}
