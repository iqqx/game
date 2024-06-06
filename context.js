const ctx = document.getElementById("main-canvas").getContext("2d");
export function GetFillColor() {
    return ctx.fillStyle;
}
export function SetFillColor(color) {
    ctx.fillStyle = color;
}
export function DrawRectangle(x, y, width, height) {
    ctx.fillRect(x, ctx.canvas.height - y - height, width, height);
}
export function Clear() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
