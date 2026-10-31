(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const book = $('#haunted-book'), scene = $('#scene');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const atlasA = 'assets/halloween/scenes-a.png', atlasB = 'assets/halloween/scenes-b.png';
  const scenes = [
    { name:'The Witch', title:'She knows what you came for.', text:'The cellar door locks behind you. Something is boiling in the dark. She lifts her head. She has been waiting a very long time.', image:[atlasA,1,0], object:'Touch the cauldron', instruction:'Don’t breathe what rises from the pot.', secret:'That isn’t steam. Those are the ones who came before you.', effect:'witch', sound:'whisper', hotspot:[49,72] },
    { name:'The Restless Dead', title:'Those bones were still a moment ago.', text:'A chain drags across the stone. The lantern swings without a hand to hold it. Then, slowly, the empty sockets turn toward you.', image:[atlasA,0,1], object:'Disturb the lantern', instruction:'Some guests never leave.', secret:'Something moved behind the bones. You are not alone in the crypt.', effect:'skeleton', sound:'rattle', hotspot:[21,62] },
    { name:'The Hungry Patch', title:'They don’t want your candy.', text:'A hundred carved faces stare from the soil. The vines tighten around the gate. From inside the largest pumpkin, you hear breathing.', image:[atlasA,1,1], object:'Wake the pumpkin', instruction:'You should have stayed on the path.', secret:'The mouth opens wider. The breathing stops. It has seen you.', effect:'pumpkin', sound:'growl', hotspot:[53,67] },
    { name:'The Other Side', title:'That reflection isn’t yours.', text:'The hallway has no windows. Still, you feel a draft against your neck. In the mirror, someone is standing directly behind you.', image:[atlasB,0,0], object:'Look in the mirror', instruction:'Whatever you do, don’t turn around.', secret:'It is closer than it was a moment ago.', effect:'ghost', sound:'whisper', hotspot:[60,49] },
    { name:'The Werewolf', title:'The moon is full. The gate is open.', text:'You hear the branches break before you hear the growl. Too heavy to be a dog. Too close to be the wind. Then the eyes open.', image:[atlasB,1,0], object:'Follow the growl', instruction:'It already has your scent.', secret:'Run. It knows the way out, too.', effect:'werewolf', sound:'howl', hotspot:[47,66] },
    { name:'Midnight', title:'You made it out. Didn’t you?', text:'The door closes. The clock strikes twelve. Somewhere behind you, the black cat stops—and stares at something over your shoulder.', image:[atlasB,0,1], object:'One last look', instruction:'The night is far from over.', secret:'You left the house. Something left with you.', effect:'finale', sound:'bell', hotspot:[48,72] }
  ];
  let current=-1, turning=false, toastTimer, turnTimer, turnCount=0, soundOn=false, soundPreference=null;
  const found=new Set();
  // Each scene is a viewport into one tile of the photographic image atlas.
  function photo([href,x,y], label) {
    return `<svg class="scene-image" viewBox="0 0 768 512" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><image href="${href}" x="${-x*768}" y="${-y*512}" width="1536" height="1024"/></svg>`;
  }
  function hideToast(){clearTimeout(toastTimer);$('#discovery-toast').classList.remove('visible');}
  function toast(text){hideToast();$('#discovery-toast').textContent=text;$('#discovery-toast').classList.add('visible');toastTimer=setTimeout(hideToast,5000);}
  function setScene(){
    const cover=current<0, chapter=scenes[current];
    scene.innerHTML=photo(cover?[atlasA,0,0]:chapter.image,cover?'A realistic decaying Victorian haunted house in moonlight':chapter.name+' — photographic horror scene');
    book.dataset.page=cover?'cover':String(current);
    book.classList.toggle('mode-cover',cover);
    book.classList.toggle('is-discovered',!cover&&found.has(current));
    $('.cover-copy').hidden=!cover;$('#door-control').hidden=!cover;
    $('#enter-button').hidden=!cover;$('.book-navigation').hidden=cover;$('.restart').hidden=cover;
    $('.final-greeting').hidden=current!==5;
    const hotspot=$('#object-hotspot');hotspot.hidden=cover;
    hotspot.setAttribute('aria-pressed',String(!cover&&found.has(current)));
    $('#secret-reveal').innerHTML='';
    if(!cover){
      hotspot.style.left=chapter.hotspot[0]+'%';hotspot.style.top=chapter.hotspot[1]+'%';
      hotspot.setAttribute('aria-label',chapter.object);$('.object-label').textContent=chapter.object;
      if(chapter.effect==='witch'||chapter.effect==='ghost'||chapter.effect==='skeleton'){
        $('#secret-reveal').innerHTML=`<div class="apparition">${photo([atlasB,0,0],'An apparition emerges from the shadows')}</div>`;
      }else if(chapter.effect==='werewolf')$('#secret-reveal').innerHTML='<div class="claw-marks"></div>';
      else if(chapter.effect==='pumpkin')$('#secret-reveal').innerHTML='<div class="reveal-eyes"></div>';
      else $('#secret-reveal').innerHTML=`<div class="apparition">${photo([atlasB,0,0],'A figure follows you out of the house')}</div>`;
    }
    $('#chapter-label').textContent=cover?'BEFORE YOU CROSS THE THRESHOLD':`${String(current+1).padStart(2,'0')} / 06 — ${chapter.name.toUpperCase()}`;
    $('#chapter-title').textContent=cover?'You heard that too.':chapter.title;
    $('#chapter-copy').textContent=cover?'A scrape behind the door. A shape in the upstairs window. The house is empty. That’s what they told you.':chapter.text;
    $('.room-number').textContent=cover?'THE THRESHOLD':chapter.name.toUpperCase();
    $('.scene-instruction').textContent=cover?'The cat won’t go any closer.':chapter.instruction;
    $('#previous').disabled=current<=0;$('#next').disabled=current===scenes.length-1;
    [...$('.page-dots').children].forEach((dot,i)=>{if(i===current)dot.setAttribute('aria-current','step');else dot.removeAttribute('aria-current');});
    $('#page-announcement').textContent=cover?'The haunted house is closed.':`Page ${current+1} of 6. ${chapter.name}. ${chapter.title} ${chapter.object}.`;
    $('.discovery-hint').textContent=cover?'Sound begins when you enter. You can mute it at any time.':'Touch the marked objects. Some things are better left alone.';
  }
  function go(index){
    if(turning||index< -1||index>=scenes.length||index===current)return;
    hideToast();
    const focused=document.activeElement;
    const refocus=focused?.id==='enter-button'||focused?.id==='door-control'||focused?.classList.contains('restart');
    current=index;turning=true;book.classList.remove('turning');setScene();void book.offsetWidth;book.classList.add('turning');
    clearTimeout(turnTimer);turnTimer=setTimeout(()=>{turning=false;book.classList.remove('turning');},reducedMotion.matches?50:900);
    if(index===0&&soundPreference===null){soundOn=true;soundPreference=true;startAudio().then(()=>play('door'));updateSound();}
    else if(index>=0){turnCount++;if(turnCount%3===1)play('creak');}
    if(index===-1)play('door');
    if(refocus)(index<0?$('#enter-button'):$('.page-dots').children[index]).focus({preventScroll:true});
  }
  scenes.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.className='page-dot';b.setAttribute('aria-label',`Page ${i+1}: ${s.name}`);b.addEventListener('click',()=>go(i));$('.page-dots').append(b);});
  $('#enter-button').addEventListener('click',()=>go(0));$('#door-control').addEventListener('click',()=>go(0));
  $('#previous').addEventListener('click',()=>go(current-1));$('#next').addEventListener('click',()=>go(current+1));$('.restart').addEventListener('click',()=>go(-1));
  $('#object-hotspot').addEventListener('click',()=>{
    if(turning||current<0)return;
    found.add(current);book.classList.remove('is-discovered');void book.offsetWidth;book.classList.add('is-discovered');
    $('#object-hotspot').setAttribute('aria-pressed','true');toast(scenes[current].secret);play(scenes[current].sound);
  });
  $('.cat-control').addEventListener('click',()=>{
    $('.cat-control').classList.add('awake');toast(['The cat is staring at the space behind you.','Its fur stands on end. You still can’t see why.','The cat heard it before you did.'][Math.floor(Math.random()*3)]);play('hiss');
    setTimeout(()=>$('.cat-control').classList.remove('awake'),1800);
  });
  document.addEventListener('keydown',e=>{
    if($('#halloween-view').hidden||e.altKey||e.ctrlKey||e.metaKey)return;
    if(e.key==='Escape'){go(-1);return;}
    if(e.target.closest('button,a,iframe,input'))return;
    if(e.key==='ArrowRight'){e.preventDefault();go(current+1);}
    if(e.key==='ArrowLeft'&&current>0){e.preventDefault();go(current-1);}
  });

  // Locally synthesized horror foley, with a quiet wind bed and a limited master level.
  let context,master,ambientGain,wind,drone;
  const activeAudio=new Set();
  function noiseBuffer(seconds){
    const b=context.createBuffer(1,Math.ceil(context.sampleRate*seconds),context.sampleRate),d=b.getChannelData(0);
    let last=0;for(let i=0;i<d.length;i++){last=(last+Math.random()*.14-.07)/1.02;d[i]=last*3;}return b;
  }
  async function startAudio(){
    try{
      if(!context){
        context=new(window.AudioContext||window.webkitAudioContext)();
        master=context.createGain();master.gain.value=.32;
        const limiter=context.createDynamicsCompressor();limiter.threshold.value=-18;limiter.ratio.value=12;master.connect(limiter);limiter.connect(context.destination);
        ambientGain=context.createGain();ambientGain.gain.value=0;ambientGain.connect(master);
        wind=context.createBufferSource();wind.buffer=noiseBuffer(6);wind.loop=true;
        const windFilter=context.createBiquadFilter();windFilter.type='lowpass';windFilter.frequency.value=440;wind.connect(windFilter);windFilter.connect(ambientGain);wind.start();
        drone=context.createOscillator();drone.frequency.value=43;drone.type='sine';const droneGain=context.createGain();droneGain.gain.value=.15;drone.connect(droneGain);droneGain.connect(ambientGain);drone.start();
      }
      await context.resume();ambientGain.gain.setTargetAtTime(soundOn ? .16 : 0,context.currentTime,.5);
    }catch{soundOn=false;soundPreference=false;updateSound();}
  }
  function envelope(duration,level=.35){
    const gain=context.createGain(),t=context.currentTime;
    gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(level,t+.1);gain.gain.exponentialRampToValueAtTime(.001,t+duration);gain.connect(master);return gain;
  }
  function tone(hz,end,duration,type='sine',level=.18,delay=0){
    const t=context.currentTime+delay,o=context.createOscillator(),gain=context.createGain();o.type=type;o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,end),t+duration);
    gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(level,t+.09);gain.gain.exponentialRampToValueAtTime(.001,t+duration);
    o.connect(gain);gain.connect(master);o.start(t);o.stop(t+duration+.1);activeAudio.add(o);o.onended=()=>{o.disconnect();gain.disconnect();activeAudio.delete(o);};
  }
  function scrape(duration,frequency,level=.3,q=2){
    const n=context.createBufferSource();n.buffer=noiseBuffer(duration);const filter=context.createBiquadFilter();filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=q;
    const gain=envelope(duration,level);n.connect(filter);filter.connect(gain);n.start();n.stop(context.currentTime+duration);activeAudio.add(n);n.onended=()=>{n.disconnect();filter.disconnect();gain.disconnect();activeAudio.delete(n);};return filter;
  }
  function play(kind){
    if(!soundOn||!context||context.state!=='running'||$('#halloween-view').hidden||document.hidden)return;
    const t=context.currentTime;
    if(kind==='creak'||kind==='door'){
      const f=scrape(1.7,490,.5,12);f.frequency.exponentialRampToValueAtTime(130,t+1.6);
      tone(171,78,1.5,'sawtooth',.08);tone(352,123,1.65,'triangle',.06);
      if(kind==='door'){tone(73,32,.6,'sine',.6,1.15);scrape(.32,140,.5,.8);}
    }else if(kind==='howl'){
      tone(160,380,1.2,'triangle',.3);tone(380,165,2.3,'triangle',.3,1.1);tone(320,670,1.2,'sine',.13);tone(670,300,2.3,'sine',.13,1.1);scrape(3.6,350,.2,3);
    }else if(kind==='growl'){
      tone(84,37,2,'sawtooth',.15);tone(67,31,1.8,'triangle',.2);scrape(2.2,180,.6,4);
    }else if(kind==='whisper'){
      const f=scrape(2.8,1600,.48,5);f.frequency.linearRampToValueAtTime(450,t+2.7);tone(121,90,2.3,'sine',.13);
    }else if(kind==='rattle'){
      [0,.14,.31,.51,.77].forEach((delay,i)=>{tone(870+i*173,150,.2,'triangle',.2,delay);tone(1730+i*230,670,.24,'sine',.08,delay);});
    }else if(kind==='hiss')scrape(.85,2600,.32,1);
    else if(kind==='bell'){[93,187,281,397,574].forEach((hz,i)=>tone(hz,hz*.98,3.5,'sine',.21/(i+1)));}
  }
  function updateSound(){$('.sound-button').setAttribute('aria-pressed',String(soundOn));$('.sound-button').setAttribute('aria-label',soundOn?'Turn off horror sounds':'Turn on horror sounds');$('.sound-label').textContent=soundOn?'Sound on':'Sound off';}
  function stopSounds(){if(ambientGain&&context)ambientGain.gain.setTargetAtTime(0,context.currentTime,.1);for(const source of activeAudio){try{source.stop();}catch{}}activeAudio.clear();}
  $('.sound-button').addEventListener('click',async()=>{soundOn=!soundOn;soundPreference=soundOn;updateSound();if(soundOn){await startAudio();play('creak');}else stopSounds();});

  // Visible, textured fog: layered moving noise fields, drawn independently of the card mask.
  const canvas=$('#fog-canvas'),ctx=canvas.getContext('2d');
  let fogWidth=0,fogHeight=0,raf=0,lastFrame=0,phase=0;
  function hash(x,y){let n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);}
  function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return(1-u)*(1-v)*hash(ix,iy)+u*(1-v)*hash(ix+1,iy)+(1-u)*v*hash(ix,iy+1)+u*v*hash(ix+1,iy+1);}
  const mist=document.createElement('canvas');mist.width=512;mist.height=192;
  const m=mist.getContext('2d'),pixels=m.createImageData(512,192);
  for(let y=0;y<192;y++)for(let x=0;x<512;x++){
    const n=noise(x/84,y/35)*.5+noise(x/37+9,y/17)*.3+noise(x/14,y/8)*.2;
    const edge=Math.sin(Math.PI*x/511)**.65,vertical=Math.exp(-Math.pow((y/192-.54)/.3,2));
    const i=(y*512+x)*4;pixels.data[i]=179;pixels.data[i+1]=192;pixels.data[i+2]=204;pixels.data[i+3]=Math.min(255,Math.pow(n,1.6)*430*edge*vertical);
  }
  m.putImageData(pixels,0,0);
  function resizeFog(){if(!ctx)return;const r=canvas.getBoundingClientRect(),scale=Math.min(devicePixelRatio||1,1.5);fogWidth=r.width;fogHeight=r.height;canvas.width=Math.round(r.width*scale);canvas.height=Math.round(r.height*scale);ctx.setTransform(scale,0,0,scale,0,0);drawFog();}
  function drawFog(){
    if(!ctx||!fogWidth)return;ctx.clearRect(0,0,fogWidth,fogHeight);
    for(let layer=0;layer<4;layer++){
      const w=fogWidth*(1.05+layer*.16),h=fogHeight*(.36-layer*.035),dir=layer%2?-1:1;
      const offset=((phase*(7+layer*4)*dir)%(w*.78)+w*.78)%(w*.78);
      ctx.globalAlpha=.64-layer*.065;
      for(let tile=-2;tile<3;tile++)ctx.drawImage(mist,tile*w*.78+offset-w*.45,fogHeight*(.53+layer*.075)+Math.sin(phase*.1+layer)*9,w,h);
    }ctx.globalAlpha=1;
  }
  function animateFog(time){raf=0;if(document.hidden||$('#halloween-view').hidden)return;if(time-lastFrame>42){phase+=.043;drawFog();lastFrame=time;}if(!reducedMotion.matches)raf=requestAnimationFrame(animateFog);}
  function resumeFog(){if(!raf&&!document.hidden&&!$('#halloween-view').hidden){resizeFog();if(!reducedMotion.matches)raf=requestAnimationFrame(animateFog);}}
  if(ctx)new ResizeObserver(resizeFog).observe(canvas);
  reducedMotion.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;resumeFog();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopSounds();cancelAnimationFrame(raf);raf=0;}else{resumeFog();if(soundOn&&!$('#halloween-view').hidden)startAudio();}});
  function route(){
    hideToast();const archive=location.hash==='#fathers-day';$('#halloween-view').hidden=archive;$('#fathers-day-view').hidden=!archive;$('.sound-button').hidden=archive;
    const frame=$('#fathers-day-frame');if(archive){if(!frame.getAttribute('src'))frame.src=frame.dataset.src;stopSounds();cancelAnimationFrame(raf);raf=0;}else{frame.removeAttribute('src');resumeFog();if(soundOn)startAudio();}
    document.querySelectorAll('.occasion').forEach(link=>{const active=link.hash===(archive?'#fathers-day':'#halloween');link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
    document.title=archive?'Family Archive · Father’s Day':'The House After Midnight · Halloween';
  }
  // Warm the next image sheet without blocking the first view.
  const preload=new Image();preload.src=atlasB;
  setScene();route();window.addEventListener('hashchange',route);
})();
