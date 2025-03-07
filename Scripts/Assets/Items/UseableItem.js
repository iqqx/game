import { Item } from "./Item.js";
export class UseableItem extends Item {
    _usingSound;
    UseTime;
    _isUsing;
    _usingTime = -1;
    _usingCallback;
    _afterUse;
    constructor(id, name, icon, stack, isBig, useSound, afterUse, time) {
        super(id, name, icon, stack, isBig);
        this.UseTime = time;
        this._afterUse = afterUse;
        this._usingSound = useSound;
    }
    Is(other) {
        return this.Id === other.Id;
    }
    Clone() {
        return new UseableItem(this.Id, this.Name, this.Icon, this.MaxStack, this.IsBig, this._usingSound, this._afterUse, this.UseTime);
    }
    Update(dt, position, angle, direction) {
        super.Update(dt, position, angle, direction);
        if (this._usingTime >= 0) {
            this._usingTime += dt;
            if (this._usingTime >= this.UseTime) {
                this._usingTime = -1;
                this._usingCallback();
                this._afterUse();
            }
        }
    }
    Use(callback) {
        if (this._isUsing)
            return;
        this._isUsing = true;
        this._usingSound?.Play();
        this._usingCallback = callback;
        this._usingTime = 0;
    }
    IsUsing() {
        return this._isUsing;
    }
}
//# sourceMappingURL=UseableItem.js.map