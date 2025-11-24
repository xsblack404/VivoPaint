/* State Management */
const state = {
    tool: 'brush', // brush, eraser
    brushSize: 30,
    isDrawing: false,
    imageLoaded: false,
    hasResult: false
};

/* DOM Elements */
const els = {
    imageLoader: document.getElementById('imageLoader'),
    wrapper: document.getElementById('canvasWrapper'),
    imgCanvas: document.getElementById('imageCanvas'),
    maskCanvas: document.getElementById('maskCanvas'),
    resultCanvas: document.getElementById('resultCanvas'),
    ctxImg: document.getElementById('imageCanvas').getContext('2d'),
    ctxMask: document.getElementById('maskCanvas').getContext('2d'),
    ctxResult: document.getElementById('resultCanvas').getContext('2d'),
    cursor: document.getElementById('cursorOverlay'),
    emptyState: document.getElementById('emptyState'),
    loader: document.getElementById('loader'),
    prompt: document.getElementById('promptInput'),
    brushSizeInput: document.getElementById('brushSize')
};

/* Initialization */
function init() {
    // Tool listeners
    document.getElementById('tool-brush').addEventListener('click', () => setTool('brush'));
    document.getElementById('tool-eraser').addEventListener('click', () => setTool('eraser'));
    
    // Input listeners
    els.brushSizeInput.addEventListener('input', (e) => {
        state.brushSize = parseInt(e.target.value);
        updateCursorSize();
    });

    els.imageLoader.addEventListener('change', handleImageUpload);
    document.getElementById('generateBtn').addEventListener('click', runGeneration);
    document.getElementById('clearMaskBtn').addEventListener('click', clearMask);
    document.getElementById('exportBtn').addEventListener('click', exportImage);

    // Canvas interactions
    els.maskCanvas.addEventListener('mousedown', startDraw);
    window.addEventListener('mousemove', draw); // Window to catch drag-out
    window.addEventListener('mouseup', stopDraw);
    
    els.wrapper.addEventListener('mousemove', updateCursorPos);
    els.wrapper.addEventListener('mouseenter', () => els.cursor.style.display = 'block');
    els.wrapper.addEventListener('mouseleave', () => els.cursor.style.display = 'none');
}

function setTool(toolName) {
    state.tool = toolName;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tool-${toolName}`).classList.add('active');
}

/* Image Handling */
function handleImageUpload(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Resize canvas to match image
            const w = img.width;
            const h = img.height;
            
            // Scale down if massive for performance (Enterprise limit: 4k)
            const maxWidth = 2048;
            let finalW = w, finalH = h;
            
            if(w > maxWidth) {
                const ratio = maxWidth / w;
                finalW = maxWidth;
                finalH = h * ratio;
            }

            resizeCanvases(finalW, finalH);
            els.ctxImg.drawImage(img, 0, 0, finalW, finalH);
            
            els.emptyState.style.display = 'none';
            state.imageLoaded = true;
            state.hasResult = false;
            els.resultCanvas.style.display = 'none';
            
            // Reset mask
            clearMask();
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

function resizeCanvases(w, h) {
    els.wrapper.style.width = w + 'px';
    els.wrapper.style.height = h + 'px';
    
    [els.imgCanvas, els.maskCanvas, els.resultCanvas].forEach(c => {
        c.width = w;
        c.height = h;
    });
}

/* Drawing Logic (The Brush) */
function startDraw(e) {
    if (!state.imageLoaded) return;
    state.isDrawing = true;
    paint(e);
}

function stopDraw() {
    state.isDrawing = false;
    els.ctxMask.beginPath(); // Reset path
}

function draw(e) {
    if (!state.isDrawing) return;
    paint(e);
}

function paint(e) {
    const rect = els.maskCanvas.getBoundingClientRect();
    const scaleX = els.maskCanvas.width / rect.width;
    const scaleY = els.maskCanvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    els.ctxMask.lineWidth = state.brushSize;
    els.ctxMask.lineCap = 'round';
    els.ctxMask.lineJoin = 'round';

    if (state.tool === 'brush') {
        els.ctxMask.globalCompositeOperation = 'source-over';
        els.ctxMask.strokeStyle = 'rgba(255, 50, 50, 1)'; // Draw red
    } else {
        els.ctxMask.globalCompositeOperation = 'destination-out';
        els.ctxMask.strokeStyle = 'rgba(0,0,0,1)';
    }

    els.ctxMask.lineTo(x, y);
    els.ctxMask.stroke();
    els.ctxMask.beginPath();
    els.ctxMask.moveTo(x, y);
}

/* Cursor Logic */
function updateCursorPos(e) {
    const rect = els.wrapper.getBoundingClientRect();
    els.cursor.style.left = (e.clientX - rect.left - state.brushSize/2) + 'px';
    els.cursor.style.top = (e.clientY - rect.top - state.brushSize/2) + 'px';
}

function updateCursorSize() {
    els.cursor.style.width = state.brushSize + 'px';
    els.cursor.style.height = state.brushSize + 'px';
}

function clearMask() {
    els.ctxMask.clearRect(0, 0, els.maskCanvas.width, els.maskCanvas.height);
}

/* 
   AI GENERATION LOGIC 
   -------------------
   This is where the magic happens. In a real production environment,
   you would fetch an endpoint like OpenAI DALL-E Edit or Stable Diffusion Inpainting.
*/

async function runGeneration() {
    if (!state.imageLoaded) return alert("Please upload an image first.");
    const prompt = els.prompt.value;
    if (!prompt) return alert("Please enter a prompt describing the change.");

    els.loader.style.display = 'flex';

    // 1. Prepare Data (Base64)
    // In a real app, you send these strings to your backend
    const originalImage = els.imgCanvas.toDataURL('image/png');
    const maskImage = els.maskCanvas.toDataURL('image/png');

    /* 
       ================================================
       API PLACEHOLDER START
       ================================================
       To make this real, uncomment the fetch below and add your API Key.
       Currently, it runs a SIMULATION.
    */

    try {
        // SIMULATION DELAY
        await new Promise(r => setTimeout(r, 2000));

        // SIMULATION RESULT: 
        // Since we don't have a real GPU here, we will just create a visual effect
        // suggesting something happened. We'll draw a random color overlay
        // or text on the result canvas to prove the concept.
        
        els.ctxResult.clearRect(0,0, els.resultCanvas.width, els.resultCanvas.height);
        
        // Clone original
        els.ctxResult.drawImage(els.imgCanvas, 0, 0);
        
        // Apply "fake" inpainting by composing the mask over it with a change
        // This logic isolates the pixels where the mask is red
        const imgData = els.ctxMask.getImageData(0, 0, els.maskCanvas.width, els.maskCanvas.height);
        const resultData = els.ctxResult.getImageData(0, 0, els.resultCanvas.width, els.resultCanvas.height);
        
        for (let i = 0; i < imgData.data.length; i += 4) {
            // If mask alpha > 0 (area was painted)
            if (imgData.data[i+3] > 0) {
                // Replace pixel with a noise pattern to simulate "AI Change"
                // In a real app, this comes from the API response
                resultData.data[i] = (resultData.data[i] + 50) % 255;     // Shift R
                resultData.data[i+1] = (resultData.data[i+1] + 20) % 255; // Shift G
                resultData.data[i+2] = 200; // Make it bluish
            }
        }
        
        els.ctxResult.putImageData(resultData, 0, 0);
        
        // Show result layer
        els.resultCanvas.style.display = 'block';
        state.hasResult = true;
        
        // Hide mask temporarily so we can see result
        els.maskCanvas.style.opacity = '0'; 
        
        /* 
           REAL API EXAMPLE (OpenAI DALL-E 2 Edit):
           
           const formData = new FormData();
           formData.append('image', dataURItoBlob(originalImage));
           formData.append('mask', dataURItoBlob(maskImage));
           formData.append('prompt', prompt);
           formData.append('n', 1);
           formData.append('size', '1024x1024');

           const response = await fetch('https://api.openai.com/v1/images/edits', {
               method: 'POST',
               headers: {
                   'Authorization': 'Bearer YOUR_API_KEY_HERE'
               },
               body: formData
           });
           const data = await response.json();
           // Load data.data[0].url into resultCanvas
        */

    } catch (err) {
        console.error(err);
        alert("AI Generation failed. Check console.");
    } finally {
        els.loader.style.display = 'none';
        // Reveal result
        setTimeout(() => {
             // Optional: Fade mask back in or keep hidden? 
             // Usually we keep it hidden after generation.
        }, 100);
    }
}

function exportImage() {
    if (!state.imageLoaded) return;
    
    const link = document.createElement('a');
    link.download = 'vivopaint-export.png';
    
    // If we have a result, download that, otherwise the original
    if (state.hasResult) {
        link.href = els.resultCanvas.toDataURL();
    } else {
        link.href = els.imgCanvas.toDataURL();
    }
    link.click();
}

// Helper for real API usage
function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
}

// Boot
init();
