export class Item {
    _usingSound;
    Icon;
    UseTime;
    Big;
    _isUsing;
    _usingTime = -1;
    _usingCallback;
    _count;
    constructor(count) {
        this._count = this.GetStack() > 1 ? Math.clamp(count ?? Math.round(Math.random() * this.GetStack()), 0, this.GetStack()) : 1;
    }
    Update(dt, position, angle) {
        if (this._usingTime >= 0) {
            this._usingTime += dt;
            if (this._usingTime >= this.UseTime) {
                this._usingTime = -1;
                this._usingCallback();
                this.OnUsed();
            }
        }
    }
    Use(callback) {
        if (this.UseTime === undefined)
            return;
        if (this._isUsing)
            return;
        this._isUsing = true;
        this._usingSound?.Play();
        this._usingCallback = callback;
        this._usingTime = 0;
    }
    Render(at, angle) { }
    IsUsing() {
        return this._isUsing;
    }
    GetCount() {
        return this._count;
    }
    Take(count) {
        this._count = Math.clamp(this._count - count, 0, this.GetStack());
    }
    Add(count) {
        count = Math.abs(count);
        const toAdd = Math.min(count, this.GetStack() - this._count);
        this._count += toAdd;
        return toAdd;
    }
    GetStack() {
        return 1;
    }
    OnUsed() { }
}
//# sourceMappingURL=Item.js.map