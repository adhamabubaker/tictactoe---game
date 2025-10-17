document.addEventListener("DOMContentLoaded", () => {

const board = document.getElementById("board");
const cells = document.querySelectorAll(".cell");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const resetAllBtn = document.getElementById("resetAllBtn");
const modeSelect = document.getElementById("mode");
const difficultySelect = document.getElementById("difficulty");

let player1Name="", player2Name="", currentPlayer="X";
let player1Symbol="X", player2Symbol="O", gameMode="computer";
let gameState=["","","","","","","","",""];
let score1=0, score2=0, drawScore=0;
let gameStarted=false;

// تحميل النقاط من localStorage
function loadScores(){
    score1 = parseInt(localStorage.getItem("score1")) || 0;
    score2 = parseInt(localStorage.getItem("score2")) || 0;
    drawScore = parseInt(localStorage.getItem("drawScore")) || 0;
    updateScore();
}
loadScores();

// حفظ النقاط
function saveScores(){
    localStorage.setItem("score1", score1);
    localStorage.setItem("score2", score2);
    localStorage.setItem("drawScore", drawScore);
}

// بدء اللعبة
startBtn.addEventListener("click",()=>{
    const p1=document.getElementById("player1").value.trim();
    const p2=document.getElementById("player2").value.trim();

    if(!p1){ 
        alert("يرجى إدخال اسم اللاعب 1!");
        return; 
    }
    player1Name = p1;

    if(modeSelect.value === "computer"){
        player2Name = "Jocker";
        document.getElementById("player2").value = player2Name;
        document.getElementById("player2").setAttribute("readonly", true);
        document.getElementById("player2").style.background="#ccc";
        gameMode = "computer";
    } else {
        if(!p2){
            alert("يرجى إدخال اسم اللاعب 2!");
            return;
        }
        player2Name = p2;
        document.getElementById("player2").removeAttribute("readonly");
        document.getElementById("player2").style.background="#fff";
        gameMode = "friend";
    }

    document.getElementById("player1-name").textContent = player1Name;
    document.getElementById("player2-name").textContent = player2Name;

    player1Symbol = "X";
    player2Symbol = "O";
    currentPlayer = player1Symbol;

    resetBoard();
    gameStarted = true;
});

// إعادة اللعبة
resetBtn.addEventListener("click", resetBoard);

// إعادة ضبط النقاط
resetAllBtn.addEventListener("click", () => {
    score1 = score2 = drawScore = 0;
    updateScore();
    saveScores();
    resetBoard();
});

// تحديث النقاط والإحصائيات
function updateScore(){
    document.getElementById("score1").textContent = score1;
    document.getElementById("score2").textContent = score2;
    document.getElementById("drawScore").textContent = drawScore;

    const total = score1 + score2 + drawScore || 1;
    document.getElementById("stat1").textContent = Math.round(score1/total*100)+"%";
    document.getElementById("stat2").textContent = Math.round(score2/total*100)+"%";
    document.getElementById("statDraw").textContent = Math.round(drawScore/total*100)+"%";
}

// إعادة اللوحة
function resetBoard(){
    gameState = ["","","","","","","","",""];
    currentPlayer = player1Symbol;
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("winner-cell");
    });
}

// تحقق من الفائز
function checkWinner(state){
    const combos = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(let c of combos){
        const [a,b,d] = c;
        if(state[a] && state[a] === state[b] && state[a] === state[d]) return c;
    }
    return state.includes("") ? null : "draw";
}

// حركة اللاعب
function makeMove(index){
    if(!gameStarted) return;
    if(gameState[index]===""){
        gameState[index] = currentPlayer;
        cells[index].textContent = currentPlayer;

        const winner = checkWinner(gameState);
        if(winner){
            if(winner==="draw"){
                drawScore++;
                alert("تعادل!");
            } else {
                highlightWinner(winner);
                if(currentPlayer===player1Symbol){
                    score1++;
                    alert(player1Name + " فاز!");
                } else {
                    score2++;
                    alert(player2Name + " فاز!");
                }
            }
            updateScore();
            saveScores();
            setTimeout(resetBoard,500);
            return;
        }

        currentPlayer = currentPlayer === player1Symbol ? player2Symbol : player1Symbol;

        if(gameMode==="computer" && currentPlayer===player2Symbol){
            setTimeout(computerMove,300);
        }
    }
}

// حركة الكمبيوتر
function computerMove(){
    if(!gameStarted) return;
    const level = difficultySelect.value;
    let move;
    const empty = gameState.map((v,i)=>v===""?i:null).filter(v=>v!==null);

    if(level==="easy"){
        move = empty[Math.floor(Math.random()*empty.length)];
    } else if(level==="medium"){
        move = getMediumMove();
    } else {
        move = getHardMove();
    }

    if(move !== undefined) makeMove(move);
}

// متوسط المستوى
function getMediumMove(){
    for(let i=0;i<gameState.length;i++){
        if(gameState[i]===""){
            gameState[i] = player2Symbol;
            if(checkWinner(gameState)!==null){ gameState[i]=""; return i;}
            gameState[i]="";
        }
    }
    for(let i=0;i<gameState.length;i++){
        if(gameState[i]===""){
            gameState[i] = player1Symbol;
            if(checkWinner(gameState)!==null){ gameState[i]=""; return i;}
            gameState[i]="";
        }
    }
    const empty = gameState.map((v,i)=>v===""?i:null).filter(v=>v!==null);
    return empty[Math.floor(Math.random()*empty.length)];
}

// صعب - استراتيجية كاملة
function getHardMove(){
    for(let i=0;i<gameState.length;i++){
        if(gameState[i]===""){
            gameState[i]=player2Symbol;
            if(checkWinner(gameState)!==null){ gameState[i]=""; return i; }
            gameState[i]="";
        }
    }
    for(let i=0;i<gameState.length;i++){
        if(gameState[i]===""){
            gameState[i]=player1Symbol;
            if(checkWinner(gameState)!==null){ gameState[i]=""; return i; }
            gameState[i]="";
        }
    }
    const preferred=[4,0,2,6,8,1,3,5,7];
    for(let i of preferred){
        if(gameState[i]==="") return i;
    }
    return undefined;
}

// تمييز الفائز
function highlightWinner(combo){
    combo.forEach(i => cells[i].classList.add("winner-cell"));
}

// أحداث الخانات
cells.forEach((cell,index)=>{
    cell.addEventListener("click", ()=>{ 
        if(!gameStarted) return;
        if(gameMode==="friend" || (gameMode==="computer" && currentPlayer===player1Symbol))
            makeMove(index);
    });
});

});
