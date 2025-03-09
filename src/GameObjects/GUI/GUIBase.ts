import { Layout } from "./Layout.js";

export abstract class GUIBase {
	public Width: number;
	public Height: number;
	public Padding: [number, number, number, number];
	public X: number;
	public Y: number;
	public Parent: Layout;

	public abstract Update(dt: number): void;
	public abstract Render(): void;
	public OnDestroy(): void {}
}
