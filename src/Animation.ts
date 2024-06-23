export class Animation {
	private readonly _keys: number[];
	private _keyTime: number;
	private _currentKey = 0;
	private _timeFromKeyStart = 0;
	private _currentValue = 0;

	constructor(keyTime: number, ...keys: number[]) {
		this._keys = keys;
		this._keyTime = keyTime;
		this._currentValue = keys[0];
	}

	public Update(dt: number) {
		this._timeFromKeyStart += dt;

		if (this._timeFromKeyStart >= this._keyTime) {
			this._timeFromKeyStart = 0;
			this._currentKey = (this._currentKey + 1) % this._keys.length;
		}

		if (this._currentKey === this._keys.length - 1) this._currentValue = this._keys[this._keys.length - 1];
		else this._currentValue = this._keys[this._currentKey] + (this._keys[this._currentKey + 1] - this._keys[this._currentKey]) * (this._timeFromKeyStart / this._keyTime);
	}

	public GetCurrent() {
		return this._currentValue;
	}

	public SetDuration(newDuration: number) {
		this._keyTime = newDuration;
	}
}
