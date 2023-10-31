// Set up button objects.
const atkBtn = document.getElementById("atkButton");
const defBtn = document.getElementById("defButton");
const resetBtn = document.getElementById("resetButton");

// Set up heading (fight name).
const fightNameHeading = document.getElementById("fightName");

// Set up output log box as well as player and enemy stats.
const outputLogBox = document.getElementById("outputBox");
const pStatsBox = document.getElementById("playerStatBox");
const eStatsBox = document.getElementById("enemyStatBox");

// Set up player and enemy sprite image objects.
const pSprite = document.getElementById("pImage");
const eSprite = document.getElementById("eImage");

// Initialize innerHTML of output log + player and enemy stats.
let outputLog = "";
let pStatsLog = "";
let eStatsLog = "";

// Misc.
let gameOver = false;  

let pOriginalVit, eOriginalVit = 0;

/* Fighter class with instance variables str, dex, spd, vit, and name.

   The first four stats will be calculated into the fight with several methods.
   - name is used to change sprites.
   - finish is a boolean to see whether the Fighter is able to use their Finishing Move.
   - atkOut deals damage.
   - defOut is boosted defense from defending.
*/
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

    /* This method sets the Fighter's atkOut into its calculated value.
       Called when Fighter attacks.
    */
    setAtk() {
        this.atkOut = Math.trunc((this.str + this.spd + this.dex) / getRnd(1, 3));
    }

    /* This method sets the Fighter's atkOut into its calculated value (Finishing Move).
       Called when Fighter can FINISH THEM.
    */
    setFinishing() {
        this.atkOut = Math.trunc((this.str + this.spd) / getRnd(1, 3));
    }

    /* @param isDefending -> boolean value to see if the Fighter is defending or not.
       This method sets the Fighter's defOut into its calculated value depending on isDefending.
       Called when the Fighter is defending.
    */
    setDef(isDefending) {
        if (isDefending) {
            this.defOut = this.spd + this.dex;
        }
        else {
            this.defOut = this.spd + getRnd(1, 6);
        }
    }

    /* @param stat -> String value that specifies which stat to change.
       @param change -> Integer value that specifies if the stat change will be an increment or decrement.
       @param amt -> Integer value that specifies the amount the stat will change.
       This method changes the Fighter's stats. Only one stat can be changed per call.
       Called when stats need changing, e.g. start of the game/reset.
    */
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

    /* This method resets the Fighter's calculated atkOut and defOut.
       Called at the end of a turn and game reset.
    */
    resetOutput() {
        this.atkOut = 0;
        this.defOut = 0;
    }
}

/* This function returns a String value depending on a random number.
   Called when creating a new Fighter (opponent) object. 
*/
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

// Create two new Fighter objects.
let f1 = new Fighter(6, 6, 6, 30, rndName());
let player = new Fighter(6, 6, 6, 30, "Gerold");

/* This function assigns values to initialized variables. Sets up the game.
   Called when the body HTML loads.
*/
function initialize() {
    // Change both Fighter stats to random stats.
    setUpFighters(f1);
    setUpFighters(player);

    // Set each Fighter's sprite.
    setImage(f1.name, 0);
    setImage(player.name, 0);

    // Set heading.
    fightNameHeading.innerHTML = player.name + " VS " + f1.name;

    // Keep original HP values.
    pOriginalVit = player.vit;
    eOriginalVit = f1.vit;

    // Add event listeners to all buttons.
    atkBtn.addEventListener("click", function () { playerAction(0); });
    atkBtn.src = "atkBtn.jpg";

    defBtn.addEventListener("click", function () { playerAction(1); });
    defBtn.src = "defBtn.jpg";

    resetBtn.addEventListener("click", reset);
}

/* This function checks to see if either Fighter can do a Finishing Move.
   If neither Fighter can, set both finish values to false.
   Otherwise, change button displays.
   Called at the end of each turn.
*/
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

/* @param action -> Passed when the player clicks to attack or defend.
   => 0 to attack, 1 to defend.

   This function is when most of my hair fell out. It updates the innerHTML for both
   enemy and player stats. First, it checks to see if global var gameOver is false so the game
   can keep going. It calls the player's setAtk() or setDef() depending on what action is.

   Then, it checks if the player can FINISH THEM [and] if they chose to use the FINISH THEM (attack button).
   If not, the opponent automatically FINISHES the player if they are able to.
   If neither Fighter can FINISH EACH OTHER, store the enemy's move into a temporary variable.

   Some awesome stuff is done (attacking, defending, etc) and the turn ends.
   Calculated attack and defense is reset, setAndCheck() is called, and then update the visuals. 
*/
const playerAction = (action) => {
    // Update stats.
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
        // if enemy can finish
        else if (f1.finish) {
            f1.setFinishing();
            if (f1.atkOut > 1) {
                gameOver = true;
                ending("f1");
            }
        }
        // normal turn
        else {
            // enemy move
            let enemyMove = enemyTurn();
            // enemy attacks
            if (enemyMove === 0) {
                // changing sprite depending on Fighter state
                setImage(f1.name, 1);
                outputLog += "<br/ >The opponent attacks for " + f1.atkOut + " damage!";
                // player defends but no dmg taken
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
                    // take damage
                    if (f1.atkOut > player.defOut) {
                        player.setStats("vit", -1, f1.atkOut - player.defOut);
                    }
                    // take damage
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

/* This function updates the innerHTML of both stat boxes and the output log box.
   Called at the end of each turn.
*/
const display = () => {
    outputLogBox.innerHTML = outputLog;
    pStatsBox.innerHTML = pStatsLog;
    eStatsBox.innerHTML = eStatsLog;
}

/* @param fighter -> a Fighter object.
   This function alters the Fighter's stats accordingly.
   Called at the beginning of each game.
*/
const setUpFighters = (fighter) => {
    let stat = "";
    let rnd = 0;
    for (i = 0; i <= 3; i++) {
        // random stat to change
        rnd = getRnd(0,2);
        // change stat (increment) x2
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
            // change stat
            fighter.setStats(stat, 1, getRnd(0,1));
        }
        else {
            // random stat to change
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
            // change stat (decrement) x2
            fighter.setStats(stat, 0, getRnd(0,1));
        }
    }
    rnd = getRnd(0, 6);
    // Fighter gets vitality buff.
    fighter.setStats("vit", 1, rnd);
}

/* @param name -> String value. Should be a Fighter's name. Specifies which Fighter's sprite to change.
   @param state -> Specifies what state the Fighter is in. These states are:
   - 0: default sprite.
   - 1: attack sprite.
   - 2: defend sprite.
   - 3: death sprite.
   This function changes pSprite and eSprite src images accordingly.
   Called when either Fighter does something.
*/
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

/* @param min -> minimum number.
   @param max -> maximum number.
   This function returns a number between min and max (both inclusive).
   Called... all the time, really.
*/
function getRnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

/* This function returns a value that specifies if the enemy defended or attacked.
   Their move is equivalent to flipping a coin.
   Called in playerAction().
*/
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

/* @param fighter -> Fighter object that won.
   This function sets the loser and winner sprites + resets outlog text.
   Called when a Fighter uses their Finishing Move.
*/
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

/* This function resets the game.
   New Fighter objects are created.
   Button displays are reset to its default display.
   Similar to intialize().

   Called when the player clicks the reset button.
*/
const reset = () => {
    f1 = new Fighter(6, 6, 6, 30, rndName());
    player = new Fighter(6, 6, 6, 30, "Gerold");

    atkBtn.style.backgroundColor = "red";
    atkBtn.innerHTML = "ATTACK!";

    setUpFighters(f1);
    setUpFighters(player);

    setImage(f1.name, 0);
    setImage(player.name, 0);

    fightNameHeading.innerHTML = player.name + " VS " + f1.name;

    gameOver = false;

    outputLog = "Game reset. Choose a move.";
    display();
}