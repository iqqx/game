import { Layout } from "./Layout.js";

export class GridLayout extends Layout {
	constructor() {
		super();
	}

	public override Update(dt: number): void {
		for (let i = 0; i < this._childs.length; ++i) this._childs[i].Update(dt);
	}

	public override Render() {
		for (let i = 0; i < this._childs.length; ++i) {
			this._childs[i].Render();
		}
	}

	public Repack() {
		for (let i = 0; i < this._childs.length; ++i) {
			const child = this._childs[i];

			if (child instanceof Layout) child.Repack();
		}
	}
}
