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
export function DrawCircle(x, y, radius) {
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
    ctx.fill();
}
export function Clear() {
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
export function DrawRectangleWithAngle(x, y, width, height, angle, xPivot, yPivot) {
    var prev = ctx.getTransform();
    ctx.translate(x, ctx.canvas.height - height - y);
    ctx.rotate(angle);
    ctx.fillRect(xPivot, yPivot, width, height);
    ctx.setTransform(prev);
}
