export const AVATAR_HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Avatar Visualizer</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: radial-gradient(circle at center, #131130 0%, #080712 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #container {
      position: relative;
      width: 100vw;
      height: 100vh;
    }
    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    #canvas2d {
      z-index: 10;
      pointer-events: none;
    }
    #canvas3d {
      z-index: 1;
    }
    #status {
      position: absolute;
      top: 25px;
      left: 0;
      right: 0;
      text-align: center;
      color: rgba(168, 85, 247, 0.85);
      font-size: 13px;
      font-weight: 600;
      z-index: 20;
      pointer-events: none;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    #mic-btn {
      position: absolute;
      bottom: 220px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 30;
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.4);
      color: #fff;
      padding: 10px 20px;
      border-radius: 25px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      backdrop-filter: blur(5px);
      transition: all 0.3s ease;
      display: none;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
    }
    #mic-btn:hover {
      background: rgba(168, 85, 247, 0.35);
      border-color: rgba(168, 85, 247, 0.6);
      transform: translateX(-50%) scale(1.05);
    }
    #mic-btn.active {
      background: rgba(239, 68, 68, 0.25);
      border-color: rgba(239, 68, 68, 0.5);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
</head>
<body>
  <div id="container">
    <div id="status">Avatar Yükleniyor...</div>
    <button id="mic-btn">🎙️ Mikrofonu Dinle</button>
    <canvas id="canvas3d"></canvas>
    <canvas id="canvas2d"></canvas>
  </div>

  <script>
    let scene, camera, renderer;
    let headMesh, teethMesh, tongueMesh;
    let headMouthOpenIdx, teethMouthOpenIdx, teethJawOpenIdx, tongueMouthOpenIdx, tongueJawOpenIdx;
    let modelLoaded = false;
    let targetVolume = 0;
    let currentVolume = 0;
    
    let targetRotationX = 0;
    let targetRotationY = 0;
    let modelGroup = null;

    const canvas2d = document.getElementById('canvas2d');
    const ctx = canvas2d.getContext('2d');

    function resizeCanvas() {
      if (renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      }
      canvas2d.width = window.innerWidth;
      canvas2d.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);

    function init3D() {
      const canvas3d = document.getElementById('canvas3d');
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 1.5, 0.55);

      renderer = new THREE.WebGLRenderer({ canvas: canvas3d, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffe3b3, 1.35);
      keyLight.position.set(1.5, 2.5, 1.5);
      scene.add(keyLight);

      const rimLight = new THREE.PointLight(0x06b6d4, 1.8, 5);
      rimLight.position.set(-1.5, 1.8, -1);
      scene.add(rimLight);

      const fillLight = new THREE.DirectionalLight(0xa855f7, 0.85);
      fillLight.position.set(-1.5, 1.0, 1.0);
      scene.add(fillLight);

      modelGroup = new THREE.Group();
      scene.add(modelGroup);

      resizeCanvas();
    }

    function loadModel(url) {
      const loader = new THREE.GLTFLoader();
      document.getElementById('status').innerText = 'Model Yükleniyor...';
      
      loader.load(
        url,
        (gltf) => {
          document.getElementById('status').innerText = 'Model Hazırlanıyor...';
          const model = gltf.scene;
          modelGroup.add(model);

          model.traverse((child) => {
            if (child.isMesh) {
              if (child.name === 'Head_Mesh') headMesh = child;
              if (child.name === 'Teeth_Mesh') teethMesh = child;
              if (child.name === 'Tongue_Mesh') tongueMesh = child;
            }
          });

          if (headMesh) {
            const box = new THREE.Box3().setFromObject(headMesh);
            const center = box.getCenter(new THREE.Vector3());
            camera.position.set(0, center.y + 0.04, 0.38);
            camera.lookAt(new THREE.Vector3(0, center.y - 0.04, 0));
            
            if (headMesh.morphTargetDictionary) {
              headMouthOpenIdx = headMesh.morphTargetDictionary['mouthOpen'];
            }
            if (teethMesh && teethMesh.morphTargetDictionary) {
              teethMouthOpenIdx = teethMesh.morphTargetDictionary['mouthOpen'];
              teethJawOpenIdx = teethMesh.morphTargetDictionary['jawOpen'];
            }
            if (tongueMesh && tongueMesh.morphTargetDictionary) {
              tongueMouthOpenIdx = tongueMesh.morphTargetDictionary['mouthOpen'];
              tongueJawOpenIdx = tongueMesh.morphTargetDictionary['jawOpen'];
            }
          } else {
            camera.position.set(0, 1.45, 0.38);
            camera.lookAt(0, 1.4, 0);
          }

          document.getElementById('status').style.display = 'none';
          modelLoaded = true;
          animate();
          initMicFallback();
        },
        (xhr) => {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          document.getElementById('status').innerText = 'Yükleniyor: %' + percent;
        },
        (error) => {
          console.error('Model loading error:', error);
          document.getElementById('status').innerText = 'Hata: Model yüklenemedi.';
        }
      );
    }

    function setMouthOpen(val) {
      if (!modelLoaded) return;
      val = Math.max(0, Math.min(1, val));

      if (headMesh && headMouthOpenIdx !== undefined) {
        headMesh.morphTargetInfluences[headMouthOpenIdx] = val;
      }
      
      if (teethMesh) {
        if (teethMouthOpenIdx !== undefined) teethMesh.morphTargetInfluences[teethMouthOpenIdx] = val;
        if (teethJawOpenIdx !== undefined) teethMesh.morphTargetInfluences[teethJawOpenIdx] = val * 0.75;
      }

      if (tongueMesh) {
        if (tongueMouthOpenIdx !== undefined) tongueMesh.morphTargetInfluences[tongueMouthOpenIdx] = val;
        if (tongueJawOpenIdx !== undefined) tongueMesh.morphTargetInfluences[tongueJawOpenIdx] = val * 0.5;
      }
    }

    document.addEventListener('mousemove', (e) => {
      targetRotationY = ((e.clientX / window.innerWidth) - 0.5) * 0.35;
      targetRotationX = ((e.clientY / window.innerHeight) - 0.5) * 0.25;
    });

    document.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        targetRotationY = ((e.touches[0].clientX / window.innerWidth) - 0.5) * 0.35;
        targetRotationX = ((e.touches[0].clientY / window.innerHeight) - 0.5) * 0.25;
      }
    });

    let wavePhase = 0;
    function drawVoiceVisualizer(volume) {
      ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
      
      const centerX = canvas2d.width / 2;
      const centerY = canvas2d.height - 110;
      const baseRadius = 55 + volume * 25;
      wavePhase += 0.04 + volume * 0.08;

      for (let l = 0; l < 3; l++) {
        ctx.beginPath();
        const numPoints = 80;
        const scaleFactor = volume * (25 + l * 12);
        
        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const wave = Math.sin(angle * (4 + l) + wavePhase) * Math.cos(angle * 2.5 - wavePhase) * scaleFactor;
          const r = baseRadius + wave;
          
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.shadowBlur = 18;
        if (l === 0) {
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.85)';
          ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
          ctx.lineWidth = 3.5;
        } else if (l === 1) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
          ctx.shadowColor = 'rgba(6, 182, 212, 0.45)';
          ctx.lineWidth = 2.5;
        } else {
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)';
          ctx.shadowColor = 'rgba(236, 72, 153, 0.35)';
          ctx.lineWidth = 1.5;
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    function animate() {
      requestAnimationFrame(animate);
      currentVolume += (targetVolume - currentVolume) * 0.22;
      setMouthOpen(currentVolume);
      drawVoiceVisualizer(currentVolume);

      if (modelGroup) {
        const time = Date.now() * 0.001;
        const breatheSwayX = Math.sin(time * 1.3) * 0.015;
        const breatheSwayY = Math.cos(time * 0.8) * 0.015;
        modelGroup.rotation.y += (targetRotationY + breatheSwayY - modelGroup.rotation.y) * 0.08;
        modelGroup.rotation.x += (targetRotationX + breatheSwayX - modelGroup.rotation.x) * 0.08;
      }

      renderer.render(scene, camera);
    }

    function initMicFallback() {
      const micBtn = document.getElementById('mic-btn');
      const isReactNative = window.ReactNativeWebView !== undefined;
      
      if (!isReactNative) {
        micBtn.style.display = 'block';
        let audioCtx, analyser, bufferLength, dataArray;
        
        micBtn.addEventListener('click', async () => {
          if (audioCtx) {
            if (audioCtx.state === 'suspended') {
              await audioCtx.resume();
              micBtn.innerText = '🎙️ Mikrofonu Durdur';
              micBtn.classList.add('active');
            } else {
              await audioCtx.suspend();
              micBtn.innerText = '🎙️ Mikrofonu Dinle';
              micBtn.classList.remove('active');
              targetVolume = 0;
            }
            return;
          }
          
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioCtx.createMediaStreamSource(stream);
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            
            micBtn.innerText = '🎙️ Mikrofonu Durdur';
            micBtn.classList.add('active');
            
            function updateVolume() {
              if (audioCtx && audioCtx.state === 'running') {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                  sum += dataArray[i] * dataArray[i];
                }
                const rms = Math.sqrt(sum / bufferLength);
                let vol = rms / 90.0;
                if (vol < 0.12) vol = 0;
                targetVolume = Math.min(1.0, vol);
              }
              requestAnimationFrame(updateVolume);
            }
            updateVolume();
            
          } catch (err) {
            console.error('Microphone API error:', err);
            alert('Mikrofon erişimi engellendi veya desteklenmiyor.');
          }
        });
      }
    }

    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'volume') {
          targetVolume = data.value;
        } else if (data.type === 'loadModel') {
          loadModel(data.url);
        }
      } catch (e) {
        console.error('Error parsing RN message:', e);
      }
    });

    init3D();
    // Injected JavaScript will trigger loadModel, but fallback can try relative if loaded directly
    setTimeout(() => {
      if (!modelLoaded) {
        const urlParams = new URLSearchParams(window.location.search);
        const modelUrl = urlParams.get('modelUrl') || './avatar.glb';
        loadModel(modelUrl);
      }
    }, 1000);
  </script>
</body>
</html>
`;
