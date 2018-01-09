var canvas = document.getElementById('myImgCanvas');
var context = canvas.getContext("2d", {preserveDrawingBuffer: true});  
var img = new Image();
// variabile resize
var imgH = document.getElementById('hInput');
var imgW = document.getElementById('wInput');
imgW.value = imgH.value = "";

// variabile culori
var r = document.getElementById('rInput');
var g = document.getElementById('gInput');
var b = document.getElementById('bInput');
r.value = g.value = b.value = 0;

// variabile selectie
var selection = document.createElement('canvas');
var selectionContext = selection.getContext('2d');
var mouseOnSelection = false;
var selectionX,selectionY;
var ok = 0; 

// la incarcare imagine desenam in canvas si redimensionam canvas 
img.addEventListener('load', function(){
    // redimensionare canvas
    canvas.width = img.width;
    canvas.height = img.height;
    // rescriere detalii width si height
    imgW.value = canvas.width;
    imgH.value = canvas.height;
    context.clearRect(0, 0, canvas.width,canvas.height);            
    context.drawImage(img,0,0,canvas.width,canvas.height);
    new Audio('media/beep.mp3').play();    
    // daca avem facuta o selectie, avem grija sa o desenam in stanga sus
    if(ok === 1){
        ok=0;
        context.clearRect(selectionX,selectionY,selection.width,selection.height);  
        context.drawImage(selection, 0,0);
    }
});

// Incarcare imagine - uploadBtn
function readImage(){
    var fileReader = new FileReader();
    fileReader.onload = function(e){
        img.src = e.target.result;        
    }
    fileReader.readAsDataURL(this.files[0]);
}

// Activare drag and drop
canvas.addEventListener('dragover', function (e) {e.preventDefault();}, false);

// Tratare eveniment "drop"
canvas.addEventListener('drop', function (e) {
    var file = e.dataTransfer.files[0];
    var fileReader = new FileReader();
    fileReader.onload = function (e) {
    img.src = e.target.result;
    };
    fileReader.readAsDataURL(file);
    e.preventDefault();
}, false);

// Modificare dimensiuni imagine si canvas
function resizeImage(){
    new Audio('media/beep.mp3').play();
    canvas.width = parseInt(imgW.value);
    canvas.height = parseInt(imgH.value);
    context.clearRect(0, 0, canvas.width,canvas.height);            
    context.drawImage(img,0,0,canvas.width,canvas.height);
}

// Salvare imagine
function saveImage(){
    new Audio('media/whistle.mp3').play();
    // butonul saveBtn se comporta ca un hyperlink si poate initia descarcarea imaginii
    var imageURL = canvas.toDataURL("image/png"); // creare url pentru imagine de tip png
    var a = document.getElementById("a"); 
    a.href = imageURL; // link-ul tinta
    a.download = "untitled.png"; // specifica faptul ca obiectivul va fi descarcat cand un utilizator face click pe hyperlink
}

// Desenare figuri geometrice 
var figuriDesenate = [];
var mouseUp = true;
var instrument, xStart, yStart, xLast, yLast;

function draw(){
    // modificare culoare desenare
    context.strokeStyle = "rgb("+r.value+","+g.value+","+b.value+")";    
    if(instrument == "line"){
        context.beginPath();
        context.moveTo(xStart,yStart);
        context.lineTo(xLast,yLast);
        context.stroke();
    }
    if(instrument == "circle"){
        context.beginPath();
        context.arc(xStart+ (xLast-xStart)/2,yStart+(yLast-yStart)/2, yLast-yStart, 0, Math.PI*2);
        context.stroke();
    }
    if(instrument == "rectangle"){
        context.beginPath();
        context.rect(xStart,yStart,xLast-xStart,yLast-yStart); 
        context.stroke();
    }
}

function undo(){
    // redesenare elemente fara ultimul obiect desenat
    if(figuriDesenate.length > 0){
        context.clearRect(0, 0, canvas.width,canvas.height);            
        context.drawImage(img,0,0,canvas.width,canvas.height);
        figuriDesenate.pop(figuriDesenate[figuriDesenate.length-1]);
        for(var j=0; j< figuriDesenate.lengt;j++){
            var i = figuriDesenate[j];
            instrument = i.instrument;
            draw(i.xStart,i.yStart,i.xLast,i.yLast);
        }
    }
    
}
function crop(){
    // salvare canvas intr-un canvas auxiliar
    var aux = document.createElement('canvas');
    var auxContext = aux.getContext('2d');
    aux.width = img.width;
    aux.height = img.height;
    auxContext.clearRect(0,0,aux.width,aux.height);
    auxContext.drawImage(canvas, 0, 0);
    // redimensionare canvas
    canvas.width = xLast - xStart;
    canvas.height = yLast - yStart;
    // rescriere detalii width si height
    imgW.value = canvas.width;
    imgH.value = canvas.height;
    // preluare imagine decupata cu ajutorul canvasului auxiliar
    context.clearRect(0, 0, canvas.width,canvas.height);            
    // restabilire sursa imagine canvas
    context.drawImage(aux, xStart,yStart,xLast - xStart,yLast - yStart,0,0,xLast - xStart,yLast - yStart);
    return canvas.toDataURL();
}

// Tratare click pe selectie 
function getSelection(e){
    if(e.pageX-canvas.offsetLeft >=0 && e.pageX-canvas.offsetLeft <= selection.width && 
        e.pageY-canvas.offsetTop >=0 && e.pageY-canvas.offsetTop <=selection.height)
        {
            mouseOnSelection = true;
        }
}

// Tratare drag pe selectie
function moveSelection(e){
    if(mouseOnSelection == true){
        context.clearRect(0, 0, canvas.width,canvas.height);            
        context.drawImage(img,0,0);
        context.clearRect(selectionX,selectionY,selection.width,selection.height);  
        context.drawImage(selection, e.pageX-canvas.offsetLeft,e.pageY-canvas.offsetTop);
    }
}
// Salvare modificari selectie
function fixSelection(e){
    mouseOnSelection = false;
    context.clearRect(0, 0, canvas.width,canvas.height);            
    context.drawImage(img,0,0);
    context.clearRect(selectionX,selectionY,selection.width,selection.height);  
    context.drawImage(selection,e.pageX-canvas.offsetLeft,e.pageY-canvas.offsetTop);
    img.src = canvas.toDataURL();
}

// Tratare eveniment pe butonul Select
function select(){
    mouseOnSelection = false;
    ok=1;
    selection.width = parseInt(xLast - xStart);
    selection.height = parseInt(yLast - yStart)
    selectionContext.clearRect(0,0,selection.width,selection.height);
    selectionContext.drawImage(canvas, xStart,yStart,xLast - xStart,yLast - yStart,0,0,xLast - xStart,yLast - yStart);
    selectionX = xStart;
    selectionY = yStart;
    img.src = canvas.toDataURL();
    
    // Adaugare evenimente mouse specifice selectie     
    canvas.addEventListener('mousemove',moveSelection,false);
    canvas.addEventListener('mouseup',fixSelection,false);
    canvas.addEventListener('mousedown',getSelection,false);

    canvas.addEventListener('keypress',function(e){
        // codul tastei delete este 46
        if(e.keyCode == 46){
            context.drawImage(img,0,0);
            context.clearRect(selectionX,selectionY,selection.width,selection.height); 
            img.src = canvas.toDataURL();            
            mouseOnSelection = false;
            selectionContext.clearRect(0,0,selection.width,selection.height);
        }
    });
}

canvas.addEventListener('mousedown', function(e){
    mouseUp = false;
    xStart = e.pageX - canvas.offsetLeft;
    yStart = e.pageY - canvas.offsetTop;

},false);

canvas.addEventListener('mouseup',function(e){
    mouseUp = true;
    xLast = e.pageX- canvas.offsetLeft;
    yLast = e.pageY - canvas.offsetTop;
    if(instrument == "crop"){
        // Stergere evenimente mouse specifice selectie             
        canvas.removeEventListener('mousemove',moveSelection,false);
        canvas.removeEventListener('mouseup',fixSelection,false);
        canvas.removeEventListener('mousedown',getSelection,false);
        img.src = crop();
    }else if(instrument == "select"){
        select();
        
    }else {
        // Stergere evenimente mouse specifice selectie     
        canvas.removeEventListener('mousemove',moveSelection,false);
        canvas.removeEventListener('mouseup',fixSelection,false);
        canvas.removeEventListener('mousedown',getSelection,false);
        draw();
        figuriDesenate.push({instrument:instrument,xStart:xStart,yStart:yStart,xLast:xLast,yLast:yLast});
    }
    instrument = "";
},false);

document.getElementById('uploadBtn').addEventListener('change',readImage,false);
document.getElementById('resizeBtn').addEventListener('click',resizeImage,false);
document.getElementById('saveBtn').addEventListener('click',saveImage,false);
document.getElementById('lineBtn').addEventListener('click',function(e){
    instrument = "line";
},false);
document.getElementById('circleBtn').addEventListener('click',function(e){
    instrument = "circle";
},false);
document.getElementById('rectangleBtn').addEventListener('click',function(e){
    instrument = "rectangle";
},false);
document.getElementById('undoBtn').addEventListener('click',undo,false);
document.getElementById('selectBtn').addEventListener('click',function(e){
    instrument = "select";    
},false);
document.getElementById('cropBtn').addEventListener('click',function(e){
    instrument = "crop";
},false);
document.getElementById('colorBtn').addEventListener('click',function(e){
   
    console.log(r,g,b);    
},false);

