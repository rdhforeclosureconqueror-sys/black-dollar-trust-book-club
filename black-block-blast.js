const canvas=document.getElementById("tetrisCanvas"),ctx=canvas.getContext("2d");
const startBtn=document.getElementById("tetrisStartBtn");
const stopBtn=document.getElementById("tetrisStopBtn");
const scoreEl=document.getElementById("tetrisScore");

const COLS=10,ROWS=20,BLOCK=24;
canvas.width=COLS*BLOCK;canvas.height=ROWS*BLOCK;
let board,player,score=0,running=false,anim;
const COLORS=[null,"#22c55e","#facc15","#ef4444","#3b82f6","#eab308","#14b8a6","#f97316"];
const SHAPES={I:[[1,1,1,1]],O:[[2,2],[2,2]],T:[[0,3,0],[3,3,3]],S:[[0,4,4],[4,4,0]],Z:[[5,5,0],[0,5,5]],J:[[6,0,0],[6,6,6]],L:[[0,0,7],[7,7,7]]};
const keys=Object.keys(SHAPES);
function matrix(w,h){return Array.from({length:h},()=>Array(w).fill(0));}
function collide(b,p){for(let y=0;y<p.shape.length;y++)for(let x=0;x<p.shape[y].length;x++)if(p.shape[y][x]&&b[y+p.pos.y]?.[x+p.pos.x])return true;return false;}
function merge(b,p){p.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v)b[y+p.pos.y][x+p.pos.x]=v;}));}
function rotate(m){const t=m.map((r,i)=>m.map(c=>c[i]).reverse());return t;}
function drawMatrix(m,o){m.forEach((r,y)=>r.forEach((v,x)=>{if(v){ctx.fillStyle=COLORS[v];ctx.fillRect((x+o.x)*BLOCK,(y+o.y)*BLOCK,BLOCK-1,BLOCK-1);}}));}
function draw(){ctx.fillStyle="#0a0a0a";ctx.fillRect(0,0,canvas.width,canvas.height);drawMatrix(board,{x:0,y:0});drawMatrix(player.shape,player.pos);}
function clearLines(){for(let y=ROWS-1;y>=0;y--){if(board[y].every(v=>v)){board.splice(y,1);board.unshift(Array(COLS).fill(0));score+=100;y++;}}}
function drop(){player.pos.y++;if(collide(board,player)){player.pos.y--;merge(board,player);reset();clearLines();updateScore();}}
function update(){if(!running)return;drop();draw();anim=setTimeout(update,600);}
function newPiece(){const k=keys[(Math.random()*keys.length)|0];return SHAPES[k].map(r=>r.slice());}
function reset(){player={pos:{x:COLS/2-1,y:0},shape:newPiece()};if(collide(board,player)){running=false;alert("Game Over – Score "+score);}}
function updateScore(){scoreEl.textContent=score;}
function start(){board=matrix(COLS,ROWS);score=0;reset();running=true;update();}
function stop(){running=false;clearTimeout(anim);}
startBtn.onclick=start;stopBtn.onclick=stop;
document.addEventListener("keydown",e=>{if(!running)return;
  if(e.key==="ArrowLeft")player.pos.x--;
  else if(e.key==="ArrowRight")player.pos.x++;
  else if(e.key==="ArrowDown")drop();
  else if(e.key==="ArrowUp")player.shape=rotate(player.shape);
  if(collide(board,player))player.pos.x+=e.key==="ArrowLeft"?1:-1;draw();});
