export class GUIBase {
    _x = 0;
    _y = 0;
    Width;
    Height;
    IsDirt;
    constructor(width, height) {
        this.Width = width;
        this.Height = height;
        this.IsDirt = true;
    }
    Update(dt, time) { }
    Render() { }
}
