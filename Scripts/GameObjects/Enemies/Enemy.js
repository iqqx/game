import { Tag } from "../../Enums.js";
import { Scene } from "../../Scenes/Scene.js";
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
        const plrPos = Scene.Current.Player.GetCenter();
        const myPos = this.GetCenter();
        const hit = Scene.Current.Raycast(myPos, Vector2.Sub(plrPos, myPos), 1000, Tag.Player | Tag.Wall)[0];
        return hit !== undefined && hit.instance instanceof Player && hit.instance.IsAlive();
    }
    Update(dt) {
        this.ApplyVForce(dt);
        if (!this.IsSpotPlayer())
            return;
        const plrPos = Scene.Current.Player.GetCenter();
        this.Direction = Math.sign(plrPos.X - (this._x + this.Width / 2));
        if (this.GetDistanceToPlayer() < 50) {
            if (Scene.Current.Player.GetPosition().Y > this._y) {
                this._movingDown = false;
                this.Jump();
            }
            else if (Scene.Current.Player.GetPosition().Y < this._y)
                this._movingDown = true;
            return;
        }
        if (this.Direction == 1)
            this.MoveRight(dt);
        else
            this.MoveLeft(dt);
    }
    GetDistanceToPlayer() {
        const plr = Scene.Current.Player.GetCenter();
        return Math.abs(plr.X - (this._x + this.Width / 2));
    }
    GetDirectionToPlayer() {
        return Math.sign(Scene.Current.Player.GetCenter().X - (this._x + this.Width / 2));
    }
}
//# sourceMappingURL=Enemy.js.map