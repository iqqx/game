import { Enemy } from "./Enemy.js";
export class Human extends Enemy {
    static Damage = 1;
    constructor() {
        super(100, 200, 1, 100);
        this._x = 1300;
    }
}
