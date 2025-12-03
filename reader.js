const netStatus=document.getElementById("netStatus");
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function updateNetwork(){netStatus.textContent=navigator.onLine?"🟢 Online":"🔴 Offline";}
window.addEventListener("online",updateNetwork);
window.addEventListener("offline",updateNetwork);
updateNetwork();

const bookInput=document.getElementById("bookInput");
const bookList=document.getElementById("bookList");
const bookStatus=document.getElementById("bookStatus");
const bookPreview=document.getElementById("bookPreview");
const voiceSelect=document.getElementById("voiceSelect");
const playBtn=document.getElementById("readerPlayBtn");
const pauseBtn=document.getElementById("readerPauseBtn");
const stopBtn=document.getElementById("readerStopBtn");

const synth=window.speechSynthesis;
let books=[],current=null,utterance=null;

bookInput.addEventListener("change",async e=>{
  const files=[...e.target.files];books=[];
  bookList.innerHTML="";bookPreview.textContent="Loading…";
  for(const f of files){
    const ext=f.name.split(".").pop().toLowerCase();
    if(ext==="txt"){const t=await f.text();books.push({name:f.name,type:"txt",text:t});}
    else if(ext==="pdf"){const ab=await f.arrayBuffer();books.push({name:f.name,type:"pdf",data:ab});}
    else if(ext==="epub"){books.push({name:f.name,type:"epub",file:f});}
  }
  renderList();
});

function renderList(){
  bookList.innerHTML="";
  books.forEach((b,i)=>{
    const li=document.createElement("li");li.textContent=b.name;
    li.onclick=()=>selectBook(i);bookList.appendChild(li);
  });
  if(books.length)selectBook(0);
}

async function selectBook(i){
  current=books[i];
  [...bookList.children].forEach((c,j)=>c.classList.toggle("active",j===i));
  bookStatus.textContent=`Loaded ${current.name}`;
  if(current.type==="txt"){
    bookPreview.textContent=current.text.slice(0,1000);
  }else if(current.type==="pdf"){
    const pdf=await pdfjsLib.getDocument({data:current.data}).promise;
    const page=await pdf.getPage(1);
    const text=(await page.getTextContent()).items.map(t=>t.str).join(" ");
    bookPreview.textContent=text.slice(0,800);
  }else if(current.type==="epub"){
    const book=await ePub(current.file);
    const text=await book.loaded.metadata;
    bookPreview.textContent="EPUB loaded – use voice to read.";
  }
}

/* === TTS === */
function loadVoices(){
  const v=synth.getVoices();voiceSelect.innerHTML="";
  v.forEach(x=>{const o=document.createElement("option");o.value=x.name;o.textContent=`${x.name} (${x.lang})`;voiceSelect.appendChild(o);});
}
if(synth.onvoiceschanged!==undefined)synth.onvoiceschanged=loadVoices;loadVoices();

playBtn.onclick=()=>{
  if(!current||current.type!=="txt"){bookStatus.textContent="Voice only for TXT.";return;}
  if(synth.speaking)synth.cancel();
  utterance=new SpeechSynthesisUtterance(current.text);
  const v=synth.getVoices().find(x=>x.name===voiceSelect.value);
  if(v)utterance.voice=v;synth.speak(utterance);
  bookStatus.textContent="Reading…";
};
pauseBtn.onclick=()=>{if(!synth.speaking)return;if(synth.paused){synth.resume();bookStatus.textContent="Resumed";}else{synth.pause();bookStatus.textContent="Paused";}};
stopBtn.onclick=()=>{if(synth.speaking)synth.cancel();bookStatus.textContent="Stopped.";};
