export class Animation {
    _keys;
    _keyTime;
    _currentKey = 0;
    _timeFromKeyStart = 0;
    _currentValue = 0;
    constructor(keyTime, ...keys) {
        this._keys = keys;
        this._keyTime = keyTime;
        this._currentValue = keys[0];
    }
    Update(dt) {
        this._timeFromKeyStart += dt;
        if (this._timeFromKeyStart >= this._keyTime) {
            this._timeFromKeyStart = 0;
            this._currentKey = (this._currentKey + 1) % this._keys.length;
        }
        if (this._currentKey === this._keys.length - 1)
            this._currentValue = this._keys[this._keys.length - 1];
        else
            this._currentValue = this._keys[this._currentKey] + (this._keys[this._currentKey + 1] - this._keys[this._currentKey]) * (this._timeFromKeyStart / this._keyTime);
    }
    GetCurrent() {
        return this._currentValue;
    }
    SetDuration(newDuration) {
        this._keyTime = newDuration;
    }
    Reset() {
        this._currentKey = 0;
    }
}
//# sourceMappingURL=Animation.js.map