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