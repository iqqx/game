export var EnemyType;
(function (EnemyType) {
    EnemyType[EnemyType["Rat"] = 0] = "Rat";
    EnemyType[EnemyType["Yellow"] = 1] = "Yellow";
    EnemyType[EnemyType["Red"] = 2] = "Red";
    EnemyType[EnemyType["Green"] = 3] = "Green";
})(EnemyType || (EnemyType = {}));
export var Tag;
(function (Tag) {
    Tag[Tag["Player"] = 1] = "Player";
    Tag[Tag["Enemy"] = 2] = "Enemy";
    Tag[Tag["Wall"] = 4] = "Wall";
    Tag[Tag["Platform"] = 8] = "Platform";
    Tag[Tag["NPC"] = 16] = "NPC";
    Tag[Tag["Pickable"] = 32] = "Pickable";
    Tag[Tag["Ladder"] = 64] = "Ladder";
    Tag[Tag["Clip"] = 128] = "Clip";
})(Tag || (Tag = {}));
export var Direction;
(function (Direction) {
    Direction[Direction["Right"] = 1] = "Right";
    Direction[Direction["Left"] = -1] = "Left";
})(Direction || (Direction = {}));
export var PointerActionState;
(function (PointerActionState) {
    PointerActionState[PointerActionState["Down"] = 0] = "Down";
    PointerActionState[PointerActionState["Move"] = 1] = "Move";
    PointerActionState[PointerActionState["Up"] = 2] = "Up";
})(PointerActionState || (PointerActionState = {}));
//# sourceMappingURL=Enums.js.map