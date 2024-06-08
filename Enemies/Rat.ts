import { Enemy } from "./Enemy.js";

export class Rat extends Enemy {
    public static readonly Damage = 1; 

    constructor() {
        super(50, 25, 1, 100);

        this._x = 1000
    }
}