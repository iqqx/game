import { PLAYER_MAX_HEALTH } from "./constants.js";
import { Rectangle } from "./utilites.js";
export const player = {
    x: 1000,
    y: 0,
    xMouse: 5000,
    yMouse: 100,
    direction: 1,
    health: PLAYER_MAX_HEALTH,
    lastFrameTimeStamp: 0,
    frameIndex: 0,
    sit: false,
    movingLeft: false,
    movingRight: false,
    verticalAcceleration: 0,
    lastShootTick: 0,
    LMBPressed: false,
};
export const platforms = [
    new Rectangle(300, 0, 300, 25),
    new Rectangle(500, 0, 25, 100),
    new Rectangle(900, 220, 200, 25),
    new Rectangle(1500, 200, 80, 30),
    new Rectangle(2000 - 25, 350, 25, 100),
];
export const enemies = [
// new Rat(), new Human()
];
export const bullets = [
    {
        x: 0,
        y: 0,
        length: 0,
        angle: 0,
        shootTimeStamp: 0,
    },
];
export const sounds = {
    Shoot: (function () {
        const s = new Audio("Sounds/shoot-1.wav");
        s.preload = "auto";
        s.load();
        return {
            Play: (volume) => {
                const c = s.cloneNode();
                c.volume = volume;
                c.play();
            },
        };
    })(),
};
export const images = {
    Player: {
        Walk: (function () {
            const images = [];
            for (let i = 0; i < 4; i++) {
                const img = new Image();
                img.src = `Images/Player_${i}.png`;
                images.push(img);
            }
            return images;
        })(),
        Sit: (function () {
            const images = [];
            for (let i = 0; i < 4; i++) {
                const img = new Image();
                img.src = `Images/Player_sit_${i}.png`;
                images.push(img);
            }
            return images;
        })(),
    },
    AK: (function () {
        const img = new Image();
        img.src = "Images/Gun.png";
        return img;
    })(),
};
