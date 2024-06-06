let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let opened = false;
let mapOpen = false;
let inv = ["gun","aptechka","armor","granade"]
ctx.fillStyle = "gray";
ctx.fillRect(0, 0, 400, 300);

/*
circle = 0
square = 1

*/



function invent() {

    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 400, 50);
    
}

function toogle() {
    opened = !opened

    if (opened) {
        
        invent();
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case '1':
                    invent();
                    ctx.fillStyle = 'green';
                    ctx.fillRect(0,0,50,50);
                    break;
                case '2':
                    invent();
                    ctx.fillStyle = 'green';
                    ctx.fillRect(50,0,50,50);
                    break;
                case '3':
                    invent();
                    ctx.fillStyle = 'yellow';
                    ctx.fillRect(300,0,50,50);
                    break;
                case '4':
                    invent();
                    ctx.fillStyle = 'blue';
                    ctx.fillRect(200,0,50,50);
                    break;
            }
        });

    } else {
        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, 400, 300);
    }
}

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'q':
            if(mapOpen){
                ctx.fillStyle = "gray";
                ctx.fillRect(0, 0, 400, 300);
            }
            toogle()
            break;
        case 'm':
            if(opened){
                ctx.fillStyle = "gray";
                ctx.fillRect(0, 0, 400, 300);
            }
            mapOp();
            break;
    }
});


function mapOp(){
    mapOpen = !mapOpen;
    if(mapOpen){
        ctx.fillStyle = "gray";
        ctx.fillRect(100, 0, 250, 250);
        ctx.fillStyle = 'blue';
        ctx.fillRect(100,0,250,250)
    }
    else{
        ctx.fillStyle = "gray";
        ctx.fillRect(100, 0, 250, 250);
    }
}
function gameLoop() {
    window.requestAnimationFrame(gameLoop)


}

gameLoop()
