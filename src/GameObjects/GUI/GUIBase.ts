export class GUIBase {
	protected _x = 0;
	protected _y = 0;
	public Width: number;
	public Height: number;
	public IsDirt: boolean;

	constructor(width: number, height: number) {
		this.Width = width;
		this.Height = height;

		this.IsDirt = true;
	}

	public Update(dt: number, time: number) {}
	public Render() {}
}
