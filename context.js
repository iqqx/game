import { Clamp, Lerp } from "./utilites.js";
const ctx = document.getElementById("main-canvas").getContext("2d");
export const levelLength = 2000;
let levelPosition = 0;
let needLevelPosition = 0;
export function GetFillColor() {
    return ctx.fillStyle;
}
export function SetFillColor(color) {
    ctx.fillStyle = color;
}
export function SetFillColorRGB(r, g, b) {
    ctx.fillStyle = `rgb(${r},${g},${b})`;
}
export function ResetTransform() {
    ctx.resetTransform();
}
export function Translate(x, y) {
    ctx.translate(x, y);
}
export function DrawRectangle(x, y, width, height) {
    ctx.fillRect(x - levelPosition, ctx.canvas.height - y - height, width, height);
}
export function DrawRectangleFixed(x, y, width, height) {
    ctx.fillRect(x, ctx.canvas.height - y - height, width, height);
}
export function DrawCircle(x, y, radius) {
    ctx.beginPath();
    ctx.ellipse(x - levelPosition, y, radius, radius, 0, 0, Math.PI * 2);
    ctx.fill();
}
export function Clear() {
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
export function SetLevelPosition(position) {
    needLevelPosition = Clamp(position - 750 - 50, 0, levelLength - 1500);
}
export function GetLevelPosition() {
    return levelPosition;
}
export function ProgradeLerp() {
    levelPosition = Lerp(levelPosition, needLevelPosition, 0.1);
}
export function DrawRectangleWithAngle(x, y, width, height, angle, xPivot, yPivot) {
    var prev = ctx.getTransform();
    ctx.resetTransform();
    ctx.translate(x - levelPosition, ctx.canvas.height - height - y);
    ctx.rotate(angle);
    ctx.fillRect(xPivot, yPivot, width, height);
    ctx.setTransform(prev);
}
export function DrawText(x, y, text) {
    ctx.fillText(text, x, y);
}
export function DrawVignette() {
    var outerRadius = 1500 * 0.6;
    var innerRadius = 1500 * 0.5;
    var grd = ctx.createRadialGradient(1500 / 2, 750 / 2, innerRadius, 1500 / 2, 750 / 2, outerRadius);
    grd.addColorStop(0, "rgba(0, 0, 0, .1)");
    grd.addColorStop(1, "rgba(0, 0, 0, .6)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 1500, 750);
}
export function DrawAntiVignette() {
    var outerRadius = 1500 * 0.6;
    var innerRadius = 1500 * 0.5;
    var grd = ctx.createRadialGradient(1500 / 2, 750 / 2, innerRadius, 1500 / 2, 750 / 2, outerRadius);
    grd.addColorStop(0, "rgba(255, 255, 255, .1)");
    grd.addColorStop(1, "rgba(255, 255, 255, .4)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 1500, 750);
}
export function SetGradientFill(start, end) {
    const grd = ctx.createLinearGradient(500, 0, 600, 0);
    grd.addColorStop(0, start.toString());
    grd.addColorStop(1, end.toString());
    ctx.fillStyle = grd;
}
export function DrawRectangleWithGradient(rect, start, end) {
    const grd = ctx.createLinearGradient(rect.X - levelPosition, ctx.canvas.height - rect.Height - rect.Y, rect.X - levelPosition + rect.Width, ctx.canvas.height - rect.Height - rect.Y + rect.Height);
    grd.addColorStop(0, start.toString());
    grd.addColorStop(1, end.toString());
    ctx.fillStyle = grd;
    DrawRectangle(rect.X - levelPosition, rect.Y, rect.Width, rect.Height);
}
export function DrawRectangleWithGradientAndAngle(rect, start, end, angle, xPivot, yPivot) {
    var prev = ctx.getTransform();
    ctx.resetTransform();
    ctx.translate(rect.X - levelPosition, ctx.canvas.height - rect.Height - rect.Y);
    ctx.rotate(angle);
    const grd = ctx.createLinearGradient(xPivot - 50, yPivot, xPivot + rect.Width, yPivot + rect.Height);
    grd.addColorStop(start[0], start[1].toString());
    grd.addColorStop(end[0], end[1].toString());
    ctx.fillStyle = grd;
    ctx.fillRect(xPivot, yPivot, rect.Width, rect.Height);
    ctx.setTransform(prev);
}
