const atkBtn = document.getElementById("atkButton");
const defBtn = document.getElementById("defButton");
const resetBtn = document.getElementById("resetButton");

const fightNameHeading = document.getElementById("fightName");

const outputLogBox = document.getElementById("outputBox");
const pStatsBox = document.getElementById("playerStatBox");
const eStatsBox = document.getElementById("enemyStatBox");

const pSprite = document.getElementById("pImage");
const eSprite = document.getElementById("eImage");

let outputLog = "";
let pStatsLog = "";
let eStatsLog = "";

let gameOver = false;  

let pOriginalVit, eOriginalVit = 0;

class Fighter {
    constructor (str, dex, spd, vit, name) {
        this.str = str;
        this.dex = dex;
        this.spd = spd;
        this.vit = vit;
        this.name = name;

        this.atkOut = 0;
        this.defOut = 0;

        this.finish = false;
    }

    setAtk() {
        this.atkOut = Math.trunc((this.str + this.spd + this.dex) / getRnd(1, 3));
    }

    setFinishing() {
        this.atkOut = Math.trunc((this.str + this.spd) / getRnd(1, 3));
    }

    setDef(isDefending) {
        if (isDefending) {
            this.defOut = this.spd + this.dex;
        }
        else {
            this.defOut = this.spd + getRnd(1, 6);
        }
    }

    setStats(stat, change, amt){
        switch (stat) {
            case "vit":
                if (change === 1) {
                    this.vit += amt;
                }
                else {
                    this.vit -= amt;
                }
                break;
            case "str":
                if (change === 1) {
                    this.str += amt;
                }
                else {
                    this.str -= amt;
                }
                break;
            case "dex":
                if (change === 1) {
                    this.dex += amt;
                }
                else {
                    this.dex -= amt;
                }
                break;
            default:
                if (change === 1) {
                    this.spd += amt;
                }
                else {
                    this.spd -= amt;
                }
                break;            
        }
    }

    resetOutput() {
        this.atkOut = 0;
        this.defOut = 0;
    }
}

const rndName = () => {
    let rnd = getRnd(0, 3);
    switch (rnd) {
        case 0:
            return "Leer";
        case 1:
            return "Chess";
        case 2:
            return "Allein";
        case 3:
            return "Sir Purple";
        default:
            break;
    }
}

let f1 = new Fighter(6, 6, 6, 30, rndName());
let player = new Fighter(6, 6, 6, 30, "Gerold");

function initialize() {
    setUpFighters(f1);
    setUpFighters(player);

    setImage(f1.name, 0);
    setImage(player.name, 0);

    fightNameHeading.innerHTML = player.name + " VS " + f1.name;

    pOriginalVit = player.vit;
    eOriginalVit = f1.vit;

    atkBtn.addEventListener("click", function () { playerAction(0); });
    atkBtn.src = "atkBtn.jpg";

    defBtn.addEventListener("click", function () { playerAction(1); });
    defBtn.src = "defBtn.jpg";

    resetBtn.addEventListener("click", reset);
}

const setAndCheckFinish = () => {
    if (player.vit >= f1.vit * 2 || f1.vit < 0) {
        player.finish = true;
        atkBtn.style.backgroundColor = "green";
        atkBtn.innerHTML = "FINISH THEM!";
    }
    else if (f1.vit >= player.vit * 2 || player.vit < 0) {
        f1.finish = true;
    }
    else {
        player.finish = false;
        f1.finish = false;
        atkBtn.style.backgroundColor = "red";
        atkBtn.innerHTML = "ATTACK!";
    }
}

const playerAction = (action) => {
    pStatsLog = "Str: " + player.str + "<br/ >Dex: " + player.dex + "<br/ >Spd: "
    + player.spd + "<br/ >Vit:" + pOriginalVit + " --> " + player.vit;

    eStatsLog = "Str: " + f1.str + "<br/ >Dex: " + f1.dex + "<br/ >Spd: "
    + f1.spd + "<br/ >Vit: " + eOriginalVit + " ---> " + f1.vit;

    if (!gameOver) {
        action === 0 ? player.setAtk() : player.setDef(true);
        // if player has finishing move
        if (player.finish && action === 0) {
            player.setFinishing();
            if (player.atkOut > 1) {
                gameOver = true;
                ending("player");
            }
        }
        else if (f1.finish) {
            f1.setFinishing();
            if (f1.atkOut > 1) {
                gameOver = true;
                ending("f1");
            }
        }
        else {
            // enemy move
            let enemyMove = enemyTurn();
            // enemy attacks
            if (enemyMove === 0) {
                setImage(f1.name, 1);
                outputLog += "<br/ >The opponent attacks for " + f1.atkOut + " damage!";
                // player defends but no dmg taken.
                if (action === 1) {
                    setImage(player.name, 2);
                    if (player.defOut > f1.atkOut) {
                        outputLog += "<br/ >Gerold defends and takes no damage!"
                        player.setStats("vit", 1, getRnd(1, 6));
                    }
                    // player defends and takes damage
                    else {
                        outputLog += "<br/ >Gerold defends and takes " + f1.atkOut - player.defOut + " damage!";
                        player.setStats("vit", -1, f1.atkOut - player.defOut);  
                  }
                }
                // player attacks
                else {
                    setImage(player.name, 1);
                    outputLog += "<br/ >Gerold attacks for " + player.atkOut + " damage!";
                    if (f1.atkOut > player.defOut) {
                        player.setStats("vit", -1, f1.atkOut - player.defOut);
                    }
                    if (player.atkOut > f1.defOut) {
                        f1.setStats("vit", -1, player.atkOut - f1.defOut);
                    }
                }
            }
            // enemy defends
            else if (enemyMove === 1) {
                setImage(f1.name, 2);
                // if they both defend
                if (action === 1) {
                    setImage(player.name, 2);
                    outputLog += "<br/ >Both Gerold and the opponent defends and gained back HP!";
                    f1.setStats("vit", 1, getRnd(1, 6));
                    player.setStats("vit", 1, getRnd(1, 6));
                }
                // player attacks
                else {
                    setImage(player.name, 1);
                    if (f1.defOut > player.atkOut) {
                        outputLog += "<br/ >The opponent defends and takes no damage!";
                        f1.setStats("vit", 1, getRnd(1, 6));
                    }
                    else {
                        outputLog += "<br/ >The opponent defends and takes " + player.atkOut - f1.defOut + " damage!";
                        f1.setStats("vit", -1, player.atkOut - f1.defOut);
                    }
                }
            }
        }
        // NEXT TURN        
        f1.resetOutput();
        player.resetOutput();
        setAndCheckFinish();
        display();
    }
}

const display = () => {
    outputLogBox.innerHTML = outputLog;
    pStatsBox.innerHTML = pStatsLog;
    eStatsBox.innerHTML = eStatsLog;
}

const setUpFighters = (fighter) => {
    let stat = "";
    let rnd = 0;
    for (i = 0; i <= 3; i++) {
        rnd = getRnd(0,2);
        if (i < 2) {
            switch (rnd) {
                case 0:
                    stat = "str";
                    break;
                case 1:
                    stat = "dex";
                    break;
                default:
                    stat = "spd";
                    break;            
            }
            fighter.setStats(stat, 1, getRnd(0,1));
        }
        else {
            switch (rnd) {
                case 0:
                    stat = "str";
                    break;
                case 2:
                    stat = "dex";
                    break;
                default:
                    stat = "spd";
                    break;
            }
            fighter.setStats(stat, 0, getRnd(0,1));
        }
    }
    rnd = getRnd(0, 6);
    fighter.setStats("vit", 1, rnd);
}

const setImage = (name, state) => {
    switch (name) {
        case "Gerold":
            switch (state) {
                case 0:
                    pSprite.src = "gerold_0.png";
                    break;
                case 1:
                    pSprite.src = "gerold_1.png";
                    break;
                case 2:
                    pSprite.src = "gerold_2.png";
                    break;
                case 3:
                    pSprite.src = "gerold_3.png";
                    break;
                default:
                    break;                
            }
            break;
        case "Leer":
            switch (state) {
                case 0:
                    eSprite.src = "leer_0.png";
                    break;
                case 1:
                    eSprite.src = "leer_1.png";
                    break;
                case 2:
                    eSprite.src = "leer_2.png";
                    break;
                case 3:
                    eSprite.src = "leer_3.png";
                    break;
                default:
                    break;                
            }
            break;
        case "Allein":
            switch (state) {
                case 0:
                    eSprite.src = "allein_0.png";
                    break;
                case 1:
                    eSprite.src = "allein_1.png";
                    break;
                case 2:
                    eSprite.src = "allein_2.png";
                    break;
                case 3:
                    eSprite.src = "allein_3.png";
                    break;
                default:
                    break;                
            }
            break;
        case "Chess":
            switch (state) {
                case 0:
                    eSprite.src = "chess_0.png";
                    break;
                case 1:
                    eSprite.src = "chess_1.png";
                    break;
                case 2:
                    eSprite.src = "chess_2.png";
                    break;
                case 3:
                    eSprite.src = "chess_3.png";
                    break;
                default:
                    break;                
            }
            break;
        case "Sir Purple":
            switch (state) {
                case 0:
                    eSprite.src = "sirPurple_0.png";
                    break;
                case 1:
                    eSprite.src = "sirPurple_1.png";
                    break;
                case 2:
                    eSprite.src = "sirPurple_2.png";
                    break;
                case 3:
                    eSprite.src = "sirPurple_3.png";
                    break;
                default:
                    break;                
            }   
            break;
        default:
            break;                    
    }
}

function getRnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

const enemyTurn = () => {
    let rnd = getRnd(0, 1);
    if (rnd === 0) {
        f1.setAtk();
        f1.setDef(false);
        return 0;
    }
    else {
        f1.setDef(true);
        return 1;
    }
}

const ending = (fighter) => {
    switch (fighter) {
        case "player":
            setImage(player.name, 1);
            setImage(f1.name, 3);
            outputLog = "GEROLD WINS!!!!";
            break;
        case "f1":
            setImage(f1.name, 1);
            setImage(player.name, 3);
            outputLog = "The opponent wins!!!";
            break;
        default:
            break;        
    }
}

const reset = () => {
    f1.resetOutput();
    player.resetOutput();

    f1 = new Fighter(6, 6, 6, 30, rndName());
    player = new Fighter(6, 6, 6, 30, "Gerold");

    atkBtn.style.backgroundColor = "red";
    atkBtn.innerHTML = "ATTACK!";

    setUpFighters(f1);
    setUpFighters(player);

    setImage(f1.name, 0);
    setImage(player.name, 0);

    gameOver = false;

    outputLog = "Game reset. Choose a move.";
    display();
}