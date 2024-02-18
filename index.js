let state = {}

let isDragging = false;
let dragStartX = 0;
let dragStarty = 0;

let previousAnimationTimestamp = undefined;

const canvas = document.getElementById("game");

const angle1DOM = document.querySelector("#info-left .angle")
const velocity1DOM = document.querySelector("#info-left .velocity")

const angle2DOM = document.querySelector("#info-right .angle")
const velocity2DOM = document.querySelector("#info-right .velocity")

const bombGrabAreaDOM = document.querySelector("#bomb-grab-area")

const congratulationsDOM = document.getElementById('congratulations')
const winnerDOM = document.getElementById('winner')
const newGameButtonDOM = document.getElementById('new-game')

const blastHoleRadius = 18;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

newGame()

function newGame() {

    state = {
        phase: "aiming",
        currentPlayer: 1,
        bomb: {
            x: undefined,
            y: undefined,
            rotation: 0,
            velocity: { x: 0, y: 0 }
        },
        backgroundBuildings: [],
        buildings: [],
        blastHoles: [],
        scale: 1,
    }
    for (let i = 0; i < 11; i++) {
        generateBackgroundBuilding(i);
    }
    for (let i = 0; i < 8; i++) {
        generateBuilding(i);
    }

    calculateScale();

    initializeBombPosition();
    congratulationsDOM.style.visibility = "hidden"
    angle1DOM.innerText = 0;
    velocity1DOM.innerText = 0;
    angle2DOM.innerText = 0;
    velocity2DOM.innerText = 0;

    draw()

}

function calculateScale() {
    const lastBuilding = state.buildings.at(-1);
    const totalWidthOfTheCity = lastBuilding.x + lastBuilding.width;

    state.scale = window.innerWidth / totalWidthOfTheCity;
}

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    calculateScale();
    initializeBombPosition();
    draw();
})

function draw() {
    ctx.save()

    ctx.translate(0, window.innerHeight);
    ctx.scale(1, -1);
    ctx.scale(state.scale, state.scale)

    drawBackground();
    drawBackgroundBuildings();
    drawBuildingsWithBlastHoles();
    drawGorilla(1);
    drawGorilla(2);
    drawBomb();


    ctx.restore();
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight / state.scale);
    gradient.addColorStop(1, "#F8BA85");
    gradient.addColorStop(0, "#FFC28E");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, window.innerWidth / state.scale, window.innerHeight / state.scale);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.beginPath();
    ctx.arc(300, 350, 60, 0, 2 * Math.PI);
    ctx.fill();
};

function generateBackgroundBuilding(index) {
    const previousBuilding = state.backgroundBuildings[index - 1];

    const x = previousBuilding ? previousBuilding.x + previousBuilding.width + 4 : -30;

    const minWidth = 60;
    const maxWidth = 110;
    const width = minWidth + Math.random() * (maxWidth - minWidth);

    const minHeight = 80;
    const maxHeight = 350;
    const height = minHeight + Math.random() * (maxHeight - minHeight);

    state.backgroundBuildings.push({ x, width, height })

};

function drawBackgroundBuildings() {
    state.backgroundBuildings.forEach((building) => {
        ctx.fillStyle = "#947285";
        ctx.fillRect(building.x, 0, building.width, building.height)
    });
};

function generateBuilding(index) {
    const previousBuilding = state.buildings[index - 1];

    const x = previousBuilding ? previousBuilding.x + previousBuilding.width + 4 : 0;

    const minWidth = 80;
    const maxWidth = 130;
    const width = minWidth + Math.random() * (maxWidth - minWidth);

    const platformWithGorilla = index === 1 || index === 6;

    const minHeight = 40;
    const maxHeight = 300;
    const minHeightGorilla = 30;
    const maxHeightGorilla = 150;


    const height = platformWithGorilla
        ? minHeightGorilla + Math.random() * (maxHeightGorilla - minHeightGorilla)
        : minHeight + Math.random() * (maxHeight - minHeight);

    const lightsOn = [];
    for (let i = 0; i < 50; i++) {
        const light = Math.random() <= 0.33 ? true : false;
        lightsOn.push(light)
    }
    state.buildings.push({ x, width, height, lightsOn })

};

function drawBuildings() {
    state.buildings.forEach((building) => {
        ctx.fillStyle = "#4A3C68";
        ctx.fillRect(building.x, 0, building.width, building.height)

        const windowWidth = 10;
        const windowHeight = 12;
        const gap = 15;
        const numberOfFloors = Math.ceil(
            (building.height - gap) / (windowHeight + gap)
        );
        const numberOfRooms = Math.floor(
            (building.width - gap) / (windowWidth + gap)
        );

        for (let floor = 0; floor < numberOfFloors; floor++) {
            for (let room = 0; room < numberOfRooms; room++) {
                if (building.lightsOn[floor * numberOfRooms + room]) {
                    ctx.save();

                    ctx.translate(building.x + gap, building.height - gap);
                    ctx.scale(1, -1);

                    const x = room * (windowWidth + gap);
                    const y = floor * (windowHeight + gap);

                    ctx.fillStyle = "#E886A2"
                    ctx.fillRect(x, y, windowWidth, windowHeight);

                    ctx.restore();
                }
            }
        }
    })
}

function drawGorilla(player) {

    ctx.save();

    const building =
        player === 1
            ? state.buildings.at(1)
            : state.buildings.at(-2);

    ctx.translate(building.x + building.width / 2, building.height)

    drawGorillaBody();
    drawGorillaLeftArm(player);
    drawGorillaRightArm(player);
    drawGorillaFace(player);


    ctx.restore()
}

function drawGorillaBody() {
    ctx.fillStyle = "black";

    ctx.beginPath();
    ctx.moveTo(0, 15);
    ctx.lineTo(-7, 0);
    ctx.lineTo(-20, 0);
    ctx.lineTo(-17, 10);
    ctx.lineTo(-20, 44);

    ctx.lineTo(-11, 77);
    ctx.lineTo(0, 84);
    ctx.lineTo(11, 77);

    ctx.lineTo(20, 44);
    ctx.lineTo(17, 18);
    ctx.lineTo(20, 0);
    ctx.lineTo(7, 0);

    ctx.fill();
};

function drawGorillaLeftArm(player) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 18;

    ctx.beginPath();
    ctx.moveTo(-14, 50)

    if (state.phase === "aiming" && state.currentPlayer === 1 && player === 1) {
        ctx.quadraticCurveTo(
            -44,
            63,
            -28 - state.bomb.velocity.x / 6.25,
            107 - state.bomb.velocity.y / 6.25
        );
    } else if (state.phase === "celebrating" && state.currentPlayer === player) {
        ctx.quadraticCurveTo(-44, 63, -28, 107);
    } else {
        ctx.quadraticCurveTo(-44, 45, -28, 12);
    }


    ctx.stroke();
}

function drawGorillaRightArm(player) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 18;

    ctx.beginPath();
    ctx.moveTo(+14, 50)

    if (state.phase === "aiming" && state.currentPlayer === 2 && player === 2) {
        ctx.quadraticCurveTo(
            +44,
            63,
            +28 - state.bomb.velocity.x / 6.25,
            107 - state.bomb.velocity.y / 6.25
        );
    } else if (state.phase === "celebrating" && state.currentPlayer === player) {
        ctx.quadraticCurveTo(+44, 63, +28, 107);
    } else {
        ctx.quadraticCurveTo(+44, 45, +28, 12);
    }

    ctx.stroke();

};

function drawGorillaFace(player) {
    ctx.fillStyle = "lightgray";
    ctx.beginPath();
    ctx.arc(0, 63, 9, 0, 2 * Math.PI)
    ctx.moveTo(-3.5, 70);
    ctx.arc(-3.5, 70, 4, 0, 2 * Math.PI)
    ctx.moveTo(+3.5, 70);
    ctx.arc(+3.5, 70, 4, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(-3.5, 70, 1.4, 0, 2 * Math.PI)
    ctx.moveTo(+3.5, 70)
    ctx.arc(+3.5, 70, 1.4, 0, 2 * Math.PI)
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.moveTo(-3.5, 66.5)
    ctx.lineTo(-1.5, 65)
    ctx.moveTo(3.5, 66.5)
    ctx.lineTo(1.5, 65)
    ctx.stroke()

    ctx.beginPath();
    if (state.phase === "celebrating" && state.currentPlayer === player) {
        ctx.moveTo(-5, 60)
        ctx.quadraticCurveTo(0, 56, 5, 60)
    } else {
        ctx.moveTo(-5, 56)
        ctx.quadraticCurveTo(0, 60, 5, 56)
    }
    ctx.stroke()
}
function initializeBombPosition() {
    const building =
        state.currentPlayer === 1
            ? state.buildings.at(1)
            : state.buildings.at(-2)

    const gorillaX = building.x + building.width / 2;
    const gorillaY = building.height;

    const gorillaHandOffsetX = state.currentPlayer === 1 ? -28 : 28;
    const gorillaHandOffsetY = 107;

    state.bomb.x = gorillaX + gorillaHandOffsetX
    state.bomb.y = gorillaY + gorillaHandOffsetY
    state.bomb.velocity.x = 0;
    state.bomb.velocity.y = 0;
    state.bomb.rotation = 0;

    const grabAreaRadius = 15;
    const left = state.bomb.x * state.scale - grabAreaRadius;
    const bottom = state.bomb.y * state.scale - (grabAreaRadius * 2);
    bombGrabAreaDOM.style.left = `${left}px`;
    bombGrabAreaDOM.style.bottom = `${bottom}px`;
}


function drawBomb() {
    ctx.save();
    ctx.translate(state.bomb.x, state.bomb.y);

    if (state.phase === "aiming") {
        ctx.translate(-state.bomb.velocity.x / 6.25, -state.bomb.velocity.y / 6.25)

        ctx.strokeStyle = "red"
        ctx.setLineDash([3, 8])
        ctx.lineWidth = 3

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(state.bomb.velocity.x, state.bomb.velocity.y)
        ctx.stroke()

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, 2 * Math.PI)
        ctx.fill()

        ctx.strokeStyle = "white";
        ctx.setLineDash([0, 0])
        ctx.lineWidth = 2
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, 2 * Math.PI)
        ctx.stroke()
    } else if (state.phase === "in flight") {
        ctx.fillStyle = "red";
        ctx.rotate(state.bomb.rotation);
        ctx.beginPath();
        ctx.moveTo(-8, -2);
        ctx.quadraticCurveTo(0, 12, 8, -2)
        ctx.quadraticCurveTo(0, 2, -8, -2)
        ctx.fill()

    } else {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, 2 * Math.PI)
    }

    ctx.restore();
}

bombGrabAreaDOM.addEventListener("mousedown", function (e) {
    if (state.phase === "aiming") {
        isDragging = true;
        dragStartX = e.clientX;
        dragStarty = e.clientY;
        document.body.style.cursor = "grabbing";
    }
})

window.addEventListener("mousemove", function (e) {
    if (isDragging) {
        let deltaX = e.clientX - dragStartX;
        let deltaY = e.clientY - dragStarty;

        state.bomb.velocity.x = -deltaX;
        state.bomb.velocity.y = +deltaY;
        setInfo(deltaX, deltaY);

        draw()
    }
})

window.addEventListener("mouseup", function (e) {
    if (isDragging) {
        isDragging = false;
        document.body.style.cursor = "default";

        throwBomb();
    }

})

function setInfo(deltaX, deltaY) {
    const hypotenuse = Math.sqrt(deltaX ** 2 + deltaY ** 2)
    const angleInRadians = Math.asin(deltaY / hypotenuse)
    const angleInDegrees = (angleInRadians / Math.PI) * 180;

    if (state.currentPlayer === 1) {
        angle1DOM.innerText = Math.round(angleInDegrees)
        velocity1DOM.innerText = Math.round(hypotenuse)
    } else {
        angle2DOM.innerText = Math.round(angleInDegrees)
        velocity2DOM.innerText = Math.round(hypotenuse)
    }
}

function throwBomb() {
    state.phase = "in flight";
    previousAnimationTimestamp = undefined;
    requestAnimationFrame(animate);
}

function animate(timestamp) {
    if (previousAnimationTimestamp === undefined) {
        previousAnimationTimestamp = timestamp;
        requestAnimationFrame(animate)
        return;
    }


    const elapsedTime = timestamp - previousAnimationTimestamp

    const hitDetectionPrecision = 10;
    for (let i = 0; i < hitDetectionPrecision; i++) {


        moveBomb(elapsedTime / hitDetectionPrecision)


        const miss = checkFrameHit() || checkBuildingHit();
        const hit = checkGorillaHit();

        if (miss) {
            state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
            state.phase = "aiming";
            initializeBombPosition()

            draw()

            return
        }
        if (hit) {
            state.phase = "celebrating"
            announceWinner()
            draw();
            return
        }
    }

    draw()

    previousAnimationTimestamp = timestamp
    requestAnimationFrame(animate)
}

function moveBomb(elapsedTime) {
    const multiplier = elapsedTime / 200;

    state.bomb.velocity.y -= 20 * multiplier;

    state.bomb.x += state.bomb.velocity.x * multiplier
    state.bomb.y += state.bomb.velocity.y * multiplier

    const direction = state.currentPlayer === 1 ? -1 : +1;
    state.bomb.rotation += direction * 5 * multiplier;
}

function checkFrameHit() {
    if (
        state.bomb.y < 0 || state.bomb.x < 0 || state.bomb.x > window.innerWidth / state.scale
    ) {
        return true
    }
}

function checkBuildingHit() {
    for (let i = 0; i < state.buildings.length; i++) {
        const building = state.buildings[i];
        if (
            state.bomb.x + 4 > building.x &&
            state.bomb.x - 4 < building.x + building.width &&
            state.bomb.y - 4 < 0 + building.height
        ) {
            for (let j = 0; j < state.blastHoles.length; j++) {
                const blasthole = state.blastHoles[j];

                const horizontalDistance = state.bomb.x - blasthole.x;
                const verticalDistance = state.bomb.y - blasthole.y;
                const distance = Math.sqrt(
                    horizontalDistance ** 2 + verticalDistance ** 2
                )
                if (distance < blastHoleRadius) {
                    return false
                }
            }
            state.blastHoles.push({ x: state.bomb.x, y: state.bomb.y })
            return true
        }
    }
}

function drawBuildingsWithBlastHoles() {
    ctx.save();
    state.blastHoles.forEach((blasthole) => {
        ctx.beginPath();

        ctx.rect(
            0,
            0,
            window.innerWidth / state.scale,
            window.innerHeight / state.scale
        )
        ctx.arc(blasthole.x, blasthole.y, blastHoleRadius, 0, 2 * Math.PI, true)
        ctx.clip()
    })
    drawBuildings()

    ctx.restore()
}

function checkGorillaHit() {
    const enemyPlayer = state.currentPlayer === 1 ? 2 : 1;
    const enemyBuilding =
        enemyPlayer === 1
            ? state.buildings.at(1)
            : state.buildings.at(-2)

    ctx.save()
    ctx.translate(
        enemyBuilding.x + enemyBuilding.width / 2,
        enemyBuilding.height
    )

    drawGorillaBody();
    let hit = ctx.isPointInPath(state.bomb.x, state.bomb.y)

    drawGorillaLeftArm(enemyPlayer)
    hit ||= ctx.isPointInPath(state.bomb.x, state.bomb.y)

    drawGorillaRightArm(enemyPlayer)
    hit ||= ctx.isPointInPath(state.bomb.x, state.bomb.y)

    ctx.restore()
    return hit
}

function announceWinner() {
    winnerDOM.innerText = `Jugador ${state.currentPlayer}`
    congratulationsDOM.style.visibility = "visible";
}

newGameButtonDOM.addEventListener("click", newGame)