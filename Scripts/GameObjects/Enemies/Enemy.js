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
        const plrPos = Scene.Current.Player.GetCenter();
        const hit = Scene.Current.Raycast(new Vector2(this._x, this._y + this.Height), new Vector2(plrPos.X - this._x, plrPos.Y - this._y), 1000, Tag.Player | Tag.Wall)[0];
        return hit !== undefined && hit.instance instanceof Player && hit.instance.IsAlive();
    }
    Update(dt) {
        this.ApplyVForce();
        if (!this.IsSpotPlayer())
            return;
        const plrPos = Scene.Current.Player.GetCenter();
        this.Direction = Math.sign(plrPos.X - (this._x + this.Width / 2));
        if (this.GetDistanceToPlayer() < 50) {
            if (Scene.Player.GetPosition().Y > this._y) {
                if (Scene.Player.GetPosition().Y === this._y)
                    this._movingDown = false;
                this.Jump();
            }
            else
                this._movingDown = true;
            return;
        }
        if (this.Direction == 1)
            this.MoveRight(dt);
        else
            this.MoveLeft(dt);
    }
    GetDistanceToPlayer() {
        const plr = Scene.Player.GetCenter();
        return Math.abs(plr.X - (this._x + this.Width / 2));
    }
    GetDirectionToPlayer() {
        return Math.sign(Scene.Player.GetCenter().X - (this._x + this.Width / 2));
    }
}
//# sourceMappingURL=Enemy.js.map