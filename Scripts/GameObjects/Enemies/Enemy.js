import { Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { Vector2 } from "../../Utilites.js";
import { Entity } from "../Entity.js";
import { Player } from "../Player.js";
export class Enemy extends Entity {
    _type;
    constructor(width, height, speed, maxHealth, type) {
        super(width, height, speed, maxHealth);
        this._type = type;
        this.Tag = Tag.Enemy;
    }
    IsSpotPlayer() {
        const plrPos = Scene.Current.Player.GetPosition();
        const hit = Scene.Current.Raycast(new Vector2(this._x, this._y + 1), new Vector2(plrPos.X - this._x, plrPos.Y - this._y + 1), 1000, Tag.Player | Tag.Wall)[0];
        return hit !== undefined && hit.instance instanceof Player && hit.instance.IsAlive();
    }
    Update(dt) {
        this.ApplyVForce();
        if (!this.IsSpotPlayer())
            return;
        const plrPos = Scene.Current.Player.GetPosition();
        const plrSize = Scene.Current.Player.GetCollider();
        this.Direction = Math.sign(plrPos.X + plrSize.Width / 2 - (this._x + this.Width / 2));
        if (Math.abs(this._x - (plrPos.X + plrSize.Width / 2)) < 5)
            return;
        if (this.Direction == 1)
            this.MoveRight();
        else
            this.MoveLeft();
    }
}
