/* SHERNI — Complete JavaScript */


// ── LOADER ──
(function(){
  setTimeout(()=>document.getElementById('loader').classList.add('gone'),2400);
  // fire ember spawner
  const fire=document.getElementById('ld-fire');
  if(!fire)return;
  const cols=[['#ffcc00','#ff8800'],['#ff8800','#ff4400'],['#ff6600','#ff2200'],['#ffaa00','#ff6600'],['#fff','#ffaa00']];
  function ember(){
    const e=document.createElement('div');
    e.className='ldf';
    const [fc,fc2]=cols[Math.floor(Math.random()*cols.length)];
    const sz=2+Math.random()*5;
    const drift=(-50+Math.random()*100)+'px';
    const dur=(3+Math.random()*4).toFixed(1)+'s';
    const del=(Math.random()*1.5).toFixed(2)+'s';
    e.style.cssText=`left:${Math.random()*100}%;--fw:${sz}px;--fc:${fc};--fc2:${fc2};--fx:${drift};--ft:${dur};--fd:${del}`;
    fire.appendChild(e);
    setTimeout(()=>{try{e.remove();}catch(x){}},8000);
  }
  setInterval(ember,180);
  for(let i=0;i<20;i++)setTimeout(ember,i*100);
})();

// ── SHERNI INTRO ANIMATION ──
(function(){
  const intro=document.getElementById('sherni-intro');
  if(!intro)return;
  // Show for 4 seconds then fade out
  setTimeout(()=>{
    intro.classList.add('done');
    setTimeout(()=>intro.classList.add('gone'),700);
  },4000);
})();

// ══════════════════════════════════════════════════
// 🎵 SHERNI WEB AUDIO SYNTHESIZER — Unique music per page
// Generates real ambient music using Web Audio API
// No MP3 files needed — runs entirely in browser
// ══════════════════════════════════════════════════

let audioCtx=null,audioOn=false,audioUnlocked=false;
let currentNodes=[];let masterGain=null;let currentPage='home';

// Each page has a unique musical signature
const pageSounds={
  home:{
    name:'🏠 SHERNI Anthem',
    baseFreq:261.63,// C4
    chordFreqs:[261.63,329.63,392,523.25],
    padFreqs:[130.81,196,261.63],
    tempo:90,color:'var(--gold)',
    desc:'Warm · Empowering · Rising'
  },
  videos:{
    name:'🎬 Cinematic Power',
    baseFreq:392,// G4
    chordFreqs:[392,493.88,587.33,783.99],
    padFreqs:[196,293.66,392],
    tempo:100,color:'var(--coral)',
    desc:'Bold · Cinematic · Energy'
  },
  young:{
    name:'💜 Young & Fearless',
    baseFreq:440,// A4
    chordFreqs:[440,523.25,659.26,880],
    padFreqs:[220,329.63,440],
    tempo:80,color:'var(--rose)',
    desc:'Hopeful · Gentle · Inspiring'
  },
  defence:{
    name:'🥋 Battle Ready',
    baseFreq:329.63,// E4
    chordFreqs:[329.63,415.31,493.88,659.26],
    padFreqs:[164.81,246.94,329.63],
    tempo:120,color:'var(--v3)',
    desc:'Fierce · Powerful · Unstoppable'
  },
  cyber:{
    name:'🔐 Digital Shield',
    baseFreq:293.66,// D4
    chordFreqs:[293.66,369.99,440,587.33],
    padFreqs:[146.83,220,293.66],
    tempo:95,color:'var(--sky)',
    desc:'Alert · Digital · Tense'
  },
  laws:{
    name:'⚖️ Justice Theme',
    baseFreq:349.23,// F4
    chordFreqs:[349.23,440,523.25,698.46],
    padFreqs:[174.61,261.63,349.23],
    tempo:72,color:'var(--gold)',
    desc:'Solemn · Authoritative · Strong'
  },
  survival:{
    name:'🌿 Warrior Mode',
    baseFreq:493.88,// B4
    chordFreqs:[493.88,587.33,739.99,987.77],
    padFreqs:[246.94,370,493.88],
    tempo:108,color:'var(--orange)',
    desc:'Urgent · Alert · Primal'
  },
  game:{
    name:'🎮 Quiz Energy',
    baseFreq:440,// A4
    chordFreqs:[440,554.37,659.26,880],
    padFreqs:[220,293.66,440],
    tempo:130,color:'var(--mint)',
    desc:'Fun · Playful · Energetic'
  },
  about:{
    name:'🦁 Founder\'s Heart',
    baseFreq:261.63,// C4
    chordFreqs:[261.63,329.63,392,440],
    padFreqs:[130.81,196,261.63],
    tempo:68,color:'var(--v3)',
    desc:'Emotional · Heartfelt · Story'
  },
  legends:{
    name:'👑 Warriors\' March',
    baseFreq:369.99,// F#4
    chordFreqs:[369.99,493.88,587.33,739.99],
    padFreqs:[185,277.18,369.99],
    tempo:88,color:'var(--gold)',
    desc:'Epic · Ancient · Legendary'
  }
};

function initAudioCtx(){
  if(audioCtx)return;
  audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  masterGain=audioCtx.createGain();
  masterGain.gain.value=0;
  masterGain.connect(audioCtx.destination);
}

function unlockAudio(){
  if(audioUnlocked)return;
  audioUnlocked=true;
  initAudioCtx();
  if(audioCtx.state==='suspended')audioCtx.resume();
}
document.body.addEventListener('click',unlockAudio,{once:true});

function stopAllNodes(){
  currentNodes.forEach(n=>{
    try{
      if(n.gainNode){n.gainNode.gain.setTargetAtTime(0,audioCtx.currentTime,.15);}
      setTimeout(()=>{try{n.source&&n.source.stop();}catch(e){}},400);
    }catch(e){}
  });
  currentNodes=[];
}

// Create a smooth oscillator with envelope
function makeOsc(freq,type,startTime,vol,attack,decay){
  const osc=audioCtx.createOscillator();
  const g=audioCtx.createGain();
  const filter=audioCtx.createBiquadFilter();
  filter.type='lowpass';
  filter.frequency.value=1200;
  osc.type=type;
  osc.frequency.value=freq;
  // slight detune for warmth
  osc.detune.value=(Math.random()-0.5)*8;
  osc.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  g.gain.setValueAtTime(0,startTime);
  g.gain.linearRampToValueAtTime(vol,startTime+attack);
  if(decay)g.gain.setTargetAtTime(0,startTime+attack,decay);
  osc.start(startTime);
  return{source:osc,gainNode:g,filter};
}

// Generate unique ambient music for each page
function startPageMusic(pg){
  if(!audioCtx||!audioUnlocked)return;
  stopAllNodes();

  const s=pageSounds[pg]||pageSounds.home;
  const now=audioCtx.currentTime;
  const beatLen=60/s.tempo;

  // 1. AMBIENT PAD — slow evolving pad from pad frequencies
  s.padFreqs.forEach((freq,i)=>{
    const node=makeOsc(freq,'sine',now+i*0.4,0.045,1.2,8);
    // LFO for pad movement
    const lfo=audioCtx.createOscillator();
    const lfoGain=audioCtx.createGain();
    lfo.frequency.value=0.15+i*0.08;
    lfoGain.gain.value=freq*0.012;
    lfo.connect(lfoGain);
    lfoGain.connect(node.source.frequency);
    lfo.start(now);
    currentNodes.push(node);
    currentNodes.push({source:lfo,gainNode:lfoGain});
  });

  // 2. CHORD TONES — gentle arpeggiated chord
  const scheduleArp=()=>{
    if(!audioOn||currentPage!==pg)return;
    const time=audioCtx.currentTime;
    s.chordFreqs.forEach((freq,i)=>{
      const node=makeOsc(freq/2,'triangle',time+i*beatLen*0.25,0.028,0.08,beatLen*1.5);
      currentNodes.push(node);
    });
    setTimeout(scheduleArp,beatLen*4*1000*(0.9+Math.random()*0.2));
  };
  setTimeout(scheduleArp,1200);

  // 3. BASS PULSE — subtle rhythmic bass
  const scheduleBass=()=>{
    if(!audioOn||currentPage!==pg)return;
    const time=audioCtx.currentTime;
    [0,beatLen*2,beatLen*3].forEach(offset=>{
      const node=makeOsc(s.baseFreq/4,'sine',time+offset,0.055,0.03,beatLen*0.8);
      currentNodes.push(node);
    });
    setTimeout(scheduleBass,beatLen*4*1000);
  };
  setTimeout(scheduleBass,600);

  // 4. SHIMMER — high harmonics for sparkle
  const pg_seed=[...pg].reduce((a,c)=>a+c.charCodeAt(0),0);
  [2,3,4].forEach((mult,i)=>{
    const shimfreq=s.baseFreq*mult*(1+pg_seed%7*0.01);
    const node=makeOsc(shimfreq,'sine',now+i*0.7,0.008,2,12);
    currentNodes.push(node);
  });

  // Fade in master
  masterGain.gain.setTargetAtTime(0.7,now,.8);
}



// ── SHARE SYSTEM ──
function openShare(){document.getElementById('share-modal').classList.add('open');document.getElementById('sm-url').textContent=window.location.href.substring(0,60)+(window.location.href.length>60?'...':'');}
function closeShare(){document.getElementById('share-modal').classList.remove('open');}
document.getElementById('share-modal').addEventListener('click',function(e){if(e.target===this)closeShare();});

function shareApp(app){
  const url=encodeURIComponent(window.location.href);
  const msg=encodeURIComponent('🦁 SHERNI — Free safety guide for every Indian girl. Know your rights, learn self-defence, stay safe! ');
  const urls={
    whatsapp:'https://wa.me/?text='+msg+url,
    instagram:'https://www.instagram.com/',
    snapchat:'https://www.snapchat.com/',
    telegram:'https://t.me/share/url?url='+url+'&text='+msg,
    twitter:'https://twitter.com/intent/tweet?text='+msg+'&url='+url,
    facebook:'https://www.facebook.com/sharer/sharer.php?u='+url,
    sms:'sms:?body='+msg+url,
    native:null
  };
  if(app==='native'&&navigator.share){
    navigator.share({title:'SHERNI 🦁 — Rise. Roar. Be Safe.',text:'Free safety guide for every Indian girl.',url:window.location.href}).catch(()=>{});
    closeShare();return;
  }
  if(urls[app]){window.open(urls[app],'_blank','noopener,noreferrer');closeShare();}
}

function copyShareLink(){
  const btn=document.getElementById('sm-copy');
  navigator.clipboard.writeText(window.location.href).then(()=>{
    btn.textContent='✅ Copied!';btn.classList.add('sm-copied');
    setTimeout(()=>{btn.textContent='Copy Link';btn.classList.remove('sm-copied');},2200);
  }).catch(()=>{alert('Copy: '+window.location.href);});
}

function copyLink(){openShare();}

// ── MASCOT ──
const mascMsgs={home:{t:'You are SHERNI! 🦁',s:'Rise · Roar · Unstoppable'},videos:{t:'Watch all 7! 🎬',s:'Share with every girl you know'},young:{t:'Know your worth! 💜',s:'You deserve to know all of this'},defence:{t:'You\'re powerful! 🥋',s:'3 seconds is enough to escape'},cyber:{t:'Stay safe online! 🔐',s:'Screenshot · Block · Report'},laws:{t:'Know your rights! ⚖️',s:'Police must take your complaint'},survival:{t:'Stay aware! 🌿',s:'Trust your gut — always'},game:{t:'Quiz time! 🎮',s:'Every question makes you safer'},about:{t:'Meet the founder! 🦁',s:'The mission behind SHERNI'},legends:{t:'These are YOUR ancestors! 👑',s:'Their fire lives in you'}};
let mascTimer;
function showMasc(pg){
  const m=document.getElementById('masc'),mt=document.getElementById('mt'),ms=document.getElementById('ms');
  const d=mascMsgs[pg]||mascMsgs.home;
  mt.textContent=d.t;ms.textContent=d.s;
  m.classList.add('on');clearTimeout(mascTimer);
  mascTimer=setTimeout(()=>m.classList.remove('on'),4200);
}

// ── NAVIGATION ──
function go(pg){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const tgt=document.getElementById('page-'+pg);
  if(tgt){tgt.classList.add('active');window.scrollTo(0,0);}
  document.querySelectorAll('.htile,[data-p]').forEach(t=>t.classList.toggle('act',t.dataset.p===pg));
  showMasc(pg);
  setTimeout(()=>initRV(),80);
  const roar=document.getElementById('roar');
  if(roar){roar.currentTime=0;roar.volume=.32;roar.play().catch(()=>{});}

  // ── BACK BUTTON VISIBILITY ──
  const backBtn=document.getElementById('backHomeBtn');
  if(backBtn){
    if(pg==='home'){backBtn.classList.remove('show');}
    else{backBtn.classList.add('show');}
  }

  // ── BROWSER HISTORY (physical back / swipe back on phone) ──
  try{
    if(pg==='home'){history.replaceState({page:'home'},'','#home');}
    else{history.pushState({page:pg},'','#'+pg);}
  }catch(e){}
}
function toggleMob(){document.getElementById('mobnav').classList.toggle('open');}
function closeMob(){document.getElementById('mobnav').classList.remove('open');}

// ── BROWSER / PHONE BACK BUTTON → always goes home ──
window.addEventListener('popstate',function(e){
  // Whatever page the user was on, always land on home
  const pg=(e.state&&e.state.page)?e.state.page:'home';
  // We always send them home when they press back
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const tgt=document.getElementById('page-home');
  if(tgt){tgt.classList.add('active');window.scrollTo(0,0);}
  document.querySelectorAll('.htile,[data-p]').forEach(t=>t.classList.toggle('act',t.dataset.p==='home'));
  showMasc('home');
  setTimeout(()=>initRV(),80);
  const backBtn=document.getElementById('backHomeBtn');
  if(backBtn) backBtn.classList.remove('show');
  // Re-seed history so back works again from home
  try{history.replaceState({page:'home'},'','#home');}catch(e){}
});

// Seed initial history entry so the very first back press is catchable
try{history.replaceState({page:'home'},'','#home');}catch(e){}

// ── VIDEO PLAY ──
function playVC(i){
  const vc=document.getElementById('vc'+i);
  if(!vc)return;
  const v=vc.querySelector('video');
  if(!v||v.style.display==='none'){go(['home','young','defence','cyber','items','laws','survival'][i]||'home');return;}
  document.querySelectorAll('.vc.playing').forEach(c=>{const vv=c.querySelector('video');if(vv)vv.pause();c.classList.remove('playing');});
  vc.classList.add('playing');
  v.play().catch(()=>{vc.classList.remove('playing');go(['home','young','defence','cyber','items','laws','survival'][i]||'home');});
  v.addEventListener('ended',()=>vc.classList.remove('playing'),{once:true});
}

// ── SHARE ──
function copyLink(){
  navigator.clipboard.writeText(window.location.href).then(()=>alert('🔗 Link copied! Share it with every girl you know.')).catch(()=>alert('Copy this link: '+window.location.href));
}

// ── SCROLL REVEAL ──
function initRV(){
  const obs=new IntersectionObserver((es)=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');obs.unobserve(e.target);}}),{threshold:.08});
  document.querySelectorAll('.rv:not(.on)').forEach(el=>obs.observe(el));
  // FLOWCHART sequential animation
  document.querySelectorAll('.fc-wrap').forEach(wrap=>{
    const items=wrap.querySelectorAll('.fc-start,.fc-end,.fc-node,.fc-arr,.fc-dec');
    const wObs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){
        items.forEach((item,i)=>setTimeout(()=>item.classList.add('vis'),i*140));
        wObs.unobserve(e.target);
      }
    },{threshold:.1});
    wObs.observe(wrap);
  });
}
initRV();

// ── QUIZ GAME ──

const CYBER_QS=[
  {q:"A friend forwards: 'Click here to win free Netflix!' What do you do FIRST?",a:["Click it — sounds exciting","Paste link into VirusTotal — do NOT click directly","Share it with more friends","Ignore it but don't report"],c:1,cat:"cyber",ex:"Never click unknown links. Paste into VirusTotal first. Even links from friends can be hacked."},
  {q:"Someone messages: 'Send ₹500 for a gift voucher.' This is almost always a:",a:["Genuine offer — real companies do this","Scam — money requests via DM are almost always fraud","Charity drive — give and feel good","Test from your bank"],c:1,cat:"cyber",ex:"Money requests via DM are almost always scams. Block, report, call 1930 if money was sent."},
  {q:"To check if your email was leaked in a data breach, you use:",a:["Google search your email","haveibeenpwned.com","Check your inbox for unusual emails","Call your email provider"],c:1,cat:"cyber",ex:"haveibeenpwned.com instantly shows if your email appeared in known data breaches. Check now."},
  {q:"A stranger on Instagram requests you with no mutual friends and few posts. You should:",a:["Accept — more followers is good","Check their profile photo using Reverse Image Search first","Accept but don't chat","Block immediately without checking"],c:1,cat:"cyber",ex:"Reverse Image Search (Google/TinEye) reveals if the photo is stolen from elsewhere — common fake tactic."},
  {q:"Someone threatens to share your private photos unless you pay. You should NEVER:",a:["Screenshot the threat immediately","Pay them — it will stop the demands","Block on ALL platforms simultaneously","Report to cybercrime.gov.in or 1930"],c:1,cat:"cyber",ex:"NEVER pay. Paying proves it works and leads to more demands. Screenshot, block everywhere, report."},
  {q:"WHOIS Lookup is used to:",a:["Find someone's social media profile","Check who owns a website and when it was registered","Scan files for viruses","Find your own IP address"],c:1,cat:"cyber",ex:"WHOIS shows domain ownership and registration date. Newly registered suspicious domains = red flag."},
  {q:"IT Act §67A covers:",a:["Online defamation","Transmitting explicit material without consent — non-bailable","Cyberstalking only","Identity theft"],c:1,cat:"cyber",ex:"IT Act §67A: sending explicit material without consent is non-bailable. Up to 5 years + ₹10L fine."},
  {q:"What does scanning a QR code actually do when you 'receive' money?",a:["Receives money into your account","Sends money FROM your account","Verifies your identity","Connects you to the sender"],c:0,cat:"cyber",ex:"You NEVER scan to receive money. Scanning initiates payment FROM your account. Never scan unknown QRs."},
  {q:"CheckShortURL is used to:",a:["Shorten your own links","Expand shortened URLs to see real destination before clicking","Scan files for malware","Check website SSL certificates"],c:1,cat:"cyber",ex:"CheckShortURL reveals the real URL behind bit.ly, tinyurl etc. Always check before clicking."},
  {q:"The cybercrime helpline number in India is:",a:["100","1091","1930","155260"],c:2,cat:"cyber",ex:"1930 is India's 24×7 national cybercrime helpline. Call within 1 hour of financial fraud for best recovery chance."},
  {q:"Two-Factor Authentication (2FA) does what?",a:["Makes your password longer","Requires a second verification step even if password is stolen","Automatically updates passwords","Hides your account from hackers"],c:1,cat:"cyber",ex:"2FA means a stolen password alone isn't enough. Enable it on ALL accounts immediately — it takes 2 minutes."},
  {q:"Bitwarden and LastPass are:",a:["Antivirus software","Email services","Password managers — generate and store strong unique passwords","VPN services"],c:2,cat:"cyber",ex:"Password managers create and store unique strong passwords for every account. Use one — never reuse passwords."},
  {q:"'Your SIM will be cancelled — share your OTP to verify.' This is:",a:["A real TRAI security check","A phishing/vishing scam — TRAI and police NEVER ask for OTP","A telecom update process","A government security alert"],c:1,cat:"cyber",ex:"Real TRAI, banks, and police NEVER ask for OTP. This is a classic vishing attack. Hang up immediately."},
  {q:"Which tool scans files AND links for malware using 70+ antivirus engines at once?",a:["Google Chrome","VirusTotal","Windows Task Manager","HaveIBeenPwned"],c:1,cat:"cyber",ex:"VirusTotal is free, instant, and checks with 70+ engines. Always scan unknown files before opening."},
  {q:"Online grooming typically follows which pattern?",a:["Gift → Secret → Photo → Blackmail","Secret → Photo → Gift → Blackmail","Love bombing → Secret → Photo request → Blackmail","Photo → Secret → Love → Blackmail"],c:2,cat:"cyber",ex:"The grooming pattern: Love bombing (Week 1) → Keep secret (Week 2) → Photo request (Week 3) → Blackmail (Week 4)."},
  {q:"IT Act §66E covers:",a:["Sharing someone's location without consent","Publishing intimate images without consent — up to 3 years","Cyberbullying messages","Online fraud"],c:1,cat:"cyber",ex:"§66E: even the threat to share private images (before sharing) is the crime. Screenshot and report immediately."},
  {q:"A stranger sends you a random video call on Instagram. You should:",a:["Answer to see who it is","Never answer — block and report immediately","Answer but cover the camera","Record the call as evidence"],c:1,cat:"cyber",ex:"Video calls give visual access to you and your surroundings. Never answer unknown video calls."},
  {q:"You download a free PDF from a random website. Before opening it you should:",a:["Open it — free PDFs are always safe","Scan it with VirusTotal or MetaDefender Cloud first","Email it to yourself to check","Check the file size"],c:1,cat:"cyber",ex:"Free files can carry malware. Scan first — one malicious file can steal all your passwords."},
  {q:"To protect your location on social media you should:",a:["Only share location with verified accounts","Turn off location services for camera and social apps, remove tags","Post locations only at night","Use a VPN"],c:1,cat:"cyber",ex:"Location tags in photos reveal your home, school and daily routine — the most dangerous info a stranger can know."},
  {q:"MetaDefender Cloud is used for:",a:["Checking website SSL status","Scanning files and URLs with multiple security engines","Password storage","Email encryption"],c:1,cat:"cyber",ex:"MetaDefender Cloud provides a second opinion alongside VirusTotal. Use both for suspicious files."},
  {q:"A fake scholarship email says 'provide bank details to receive funds.' You should:",a:["Provide details — it could be real","Use WHOIS to verify the domain, Google 'organisation + scam', block if suspicious","Call the bank first","Reply asking for more proof"],c:1,cat:"cyber",ex:"Real scholarships never ask for bank details upfront. WHOIS + Google check reveals scams instantly."},
  {q:"What is sextortion?",a:["A type of computer virus","Threatening to share intimate images unless demands (money/more images) are met","A form of identity theft","Hacking someone's social media"],c:1,cat:"cyber",ex:"Sextortion is criminal under IT Act §66E and §67A. Never pay. Report to 1930 or cybercrime.gov.in."},
  {q:"Cybercrime.gov.in allows you to:",a:["Buy cyber insurance online","Report online crimes from home — no station visit needed","Check your credit score","Renew your Aadhaar card"],c:1,cat:"cyber",ex:"File any cybercrime FIR online at cybercrime.gov.in in 5 minutes from home, 24×7."},
  {q:"The Bsafe app does what?",a:["Blocks cyberbullying messages","SOS button activates live video/audio stream to your trusted contacts","Scans links for malware","Manages passwords"],c:1,cat:"cyber",ex:"bSafe (Never Walk Alone) sends live video and audio to contacts when you press SOS — real-time evidence."},
  {q:"POCSO Online Provisions cover:",a:["Adult online harassment only","Sexual exploitation of minors online — even DMs count","Only physical contact by teachers","Workplace harassment online"],c:1,cat:"cyber",ex:"POCSO covers ALL sexual exploitation of minors online. Even inappropriate DMs from adults is criminal."},
  {q:"The Raksha app is used for:",a:["Password management","One-press SOS sending live location to police and trusted contacts","Scanning QR codes safely","Blocking spam calls"],c:1,cat:"cyber",ex:"Raksha Women Safety app sends your live location to police + 5 contacts simultaneously with one press."},
  {q:"Someone is cyberstalking you — tracking your posts, location and tagging you constantly. You file a case under:",a:["IPC §302","IPC §354D — stalking (physical or online) — up to 3 years","IT Act §66A","POCSO"],c:1,cat:"cyber",ex:"IPC §354D covers both physical AND online stalking. Screenshot all evidence and report to 1930."},
  {q:"Red Panic Button app sends your GPS via:",a:["Internet only","SMS without internet — last resort when data fails","Bluetooth","Wi-Fi only"],c:1,cat:"cyber",ex:"Red Panic Button sends GPS via SMS — works even when you have no internet. Set up before you need it."},
  {q:"Life360 is used for:",a:["Blocking cyberbullies","Real-time family circle tracking with SOS alerts","Scanning emails for phishing","Password generation"],c:1,cat:"cyber",ex:"Life360 keeps your trusted circle tracking your location 24×7 with emergency SOS alerts."},
  {q:"If you receive an unsolicited explicit photo on WhatsApp, it is illegal under:",a:["IPC §302","IT Act §67A — non-bailable, up to 5 years + ₹10L fine","Only workplace harassment laws","Defamation laws"],c:1,cat:"cyber",ex:"IT Act §67A makes sending explicit content without consent non-bailable. Screenshot and report."},
  {q:"To share your live location safely during a journey you can use:",a:["Only special safety apps","Google Maps built-in live sharing, WhatsApp live location, or Life360","Post updates on social media","Only call someone when you arrive"],c:1,cat:"cyber",ex:"Google Maps, WhatsApp and Life360 all have built-in live location sharing — use at least one every journey."},
  {q:"A deepfake is:",a:["A fake website URL","AI-generated fake video/image of a real person used to harass or blackmail","A type of computer virus","A phishing email template"],c:1,cat:"cyber",ex:"Deepfakes are AI-generated fake videos/images. They are weaponised for sextortion. Report to 1930 immediately."},
  {q:"If your password appears on HaveIBeenPwned you should IMMEDIATELY:",a:["Change just that account's password","Change that password on ALL sites using it + enable 2FA on all accounts","Delete the account permanently","Contact the company"],c:1,cat:"cyber",ex:"Data breaches affect all sites using the same password. Change everywhere + enable 2FA immediately."},
  {q:"'Enable always-on location' in safety apps means:",a:["GPS runs only during emergencies","The app tracks location continuously so help can always find you","Your location is shared publicly","The app drains your battery faster"],c:1,cat:"cyber",ex:"Always-on location means SOS works even if you can't unlock your phone. Essential safety setup."},
  {q:"Google Reverse Image Search helps you:",a:["Find similar photos you've taken","Check if a profile photo is stolen or appears elsewhere (fake account detection)","Improve photo quality","Search by text inside photos"],c:1,cat:"cyber",ex:"Reverse Image Search (Google/TinEye) reveals if profile photos are stolen from stock sites or other accounts."},
  {q:"Which best describes the 'best combo' for maximum phone safety?",a:["Just WhatsApp location sharing","Raksha + bSafe + Google Maps + Red Panic Button","Only 112 on speed dial","Any one safety app is enough"],c:1,cat:"cyber",ex:"The best combo: Raksha (SOS to police) + bSafe (live video/audio) + Google Maps (location) + Red Panic Button (SMS fallback)."},
  {q:"What should you place on your phone's HOME SCREEN for fastest emergency access?",a:["Calculator","SOS shortcut / safety app widget","Gallery","Browser"],c:1,cat:"cyber",ex:"SOS shortcut on home screen means 1 tap = emergency alert. Set this up before you need it."},
  {q:"Before joining a new online group or platform you should check:",a:["How many members it has","The privacy settings, who can see your info, and the platform's reputation","Only check if it's free","Whether your friends use it"],c:1,cat:"cyber",ex:"Always audit privacy settings on any new platform. Default settings often expose more than you intend."},
  {q:"If cybercrime happens in one state and you're in another, you can report:",a:["Only at the state where crime happened","At cybercrime.gov.in or 1930 from anywhere — no jurisdiction restriction","Must go to the originating state's police station","Cannot report cross-state cybercrime"],c:1,cat:"cyber",ex:"Cybercrime.gov.in and 1930 accept reports from anywhere in India — no travel required."},
  {q:"Testing your SOS app once with a trusted contact is important because:",a:["It charges the app","Confirms it works correctly BEFORE an emergency when there's no time to troubleshoot","Shows others you're safe","Drains battery faster"],c:1,cat:"cyber",ex:"Apps can have notification settings off, location off, or wrong contacts. Test before you need it."},
];

const PHYSICAL_QS=[
  {q:"Someone grabs your wrist. The CORRECT escape technique is:",a:["Tense your arm and pull hard","Rotate your wrist TOWARD their thumb — it's the weakest grip point","Scream and wait for help","Kick them first"],c:1,cat:"defence",ex:"The thumb is the weakest grip point. Rotating toward it breaks any grip in under 1 second."},
  {q:"You're walking at night and feel followed. Your FIRST action should be:",a:["Run as fast as possible","Cross the road — if they cross too, it's confirmed. Enter the nearest lit building.","Call police immediately","Confront them"],c:1,cat:"safety",ex:"Cross to confirm. If they follow, enter any lit building. Call 112 once safe."},
  {q:"In an emergency, 112 can be dialled from:",a:["Any unlocked phone with balance","A locked phone with zero balance on any network","Only Android phones","Only with data connection"],c:1,cat:"safety",ex:"112 works on any locked phone, zero balance, any network, anywhere in India. Always."},
  {q:"Someone shouts 'HELP!' in public. Bystanders typically:",a:["Move toward the person immediately","Scatter away — 'FIRE!' gets faster response","Call police automatically","Form a protective circle"],c:1,cat:"safety",ex:"Safety experts say shout 'FIRE!' not 'HELP!' — fire causes people to move TOWARD you."},
  {q:"You're cornered in a lift with a threat. The BEST response is:",a:["Stay silent and wait","Press ALL floor buttons + alarm — noise and stops disrupt attackers","Stand in the back corner","Try to negotiate calmly"],c:1,cat:"safety",ex:"Press all buttons — every floor stop creates an escape opportunity. Press alarm simultaneously."},
  {q:"Your bag is grabbed. What should you do FIRST?",a:["Hold tight and fight for the bag","Drop the bag — your life is worth more. Run toward people.","Try to negotiate with the attacker","Photograph them"],c:1,cat:"safety",ex:"Your bag is replaceable. Drop it to run faster. Never risk injury for possessions."},
  {q:"You're in an auto and it stops in an isolated area. You should:",a:["Stay calm and wait — it might be traffic","Stay calm, observe surroundings, exit only at first well-lit populated spot","Call the driver's company","Stay inside regardless"],c:1,cat:"safety",ex:"Don't panic. Wait for a populated lit spot. Call 112 from inside if genuinely dangerous."},
  {q:"Shout 'FIRE!' instead of 'HELP!' in a public emergency because:",a:["Police respond faster to fire","It causes people to move TOWARD you rather than scatter","Fire is more dangerous","Attackers fear fire more"],c:1,cat:"safety",ex:"'FIRE!' triggers approach response. 'HELP!' triggers bystander scatter. Use 'FIRE!' always."},
  {q:"In a road accident, what should you do FIRST after parking safely?",a:["Photograph the accident for evidence","Signal traffic to slow, designate one person to call 112, check victim breathing","Give water to the injured","Move the injured to the roadside"],c:1,cat:"first_aid",ex:"Signal traffic first (prevents second accident), then assign help. Never move injured without checking for spinal injury."},
  {q:"Someone collapses and is unconscious. You should NOT do:",a:["Check if they're breathing","Tap shoulder and call their name","Tilt their head to open airway","Give them water immediately"],c:3,cat:"first_aid",ex:"Never give water or food to an unconscious person — choking risk. Check breathing and call 112."},
  {q:"For heavy bleeding, you should:",a:["Remove cloth repeatedly to check wound progress","Press firmly — do NOT remove cloth — add more on top if soaked","Apply ice","Elevate only — no pressing"],c:1,cat:"first_aid",ex:"Removing cloth breaks clotting. Press continuously — add more cloth if soaked. Elevation helps."},
  {q:"Someone has a seizure. You should NOT:",a:["Clear nearby objects","Hold them down tightly to prevent movement","Turn them on side after seizure ends","Time the seizure"],c:1,cat:"first_aid",ex:"Never restrain — you cause fractures. Never put anything in mouth. Clear space, let it pass, turn on side."},
  {q:"The Wrist Grab escape works because:",a:["The wrist joint is flexible","The thumb is the weakest part of any grip","You are rotating toward strength","Attackers are caught off guard by any movement"],c:1,cat:"defence",ex:"Every grip's weakest point is the thumb. Rotate wrist toward their thumb and the grip breaks in 1 second."},
  {q:"If grabbed from behind in a bear hug, the FIRST move is:",a:["Throw head backward","Drop your entire body weight suddenly — breaks any grip","Shout loudly","Raise both arms"],c:1,cat:"defence",ex:"Dropping bodyweight breaks any bear hug grip. Follow with heel stamp on foot, elbow to ribs, then run."},
  {q:"Your collar is grabbed. Stepping IN toward the attacker works because:",a:["It shows aggression","Stepping toward them off-balances them — pull backward weakens you","It's unexpected","It gives you more room"],c:1,cat:"defence",ex:"Pulling back gives the attacker control. Stepping in destroys their leverage instantly."},
  {q:"You're being followed by a group. Your BEST action is:",a:["Confront them loudly","Shout repeatedly, use bag as shield, run toward nearest crowded shop or building","Run silently","Call police before moving"],c:1,cat:"safety",ex:"Shout to draw attention, shield yourself, run to any populated place. Don't stop to argue."},
  {q:"In a crowd panic/stampede, you should:",a:["Stand firm and resist movement","Move along walls/edges toward main doors — never fight the crowd flow","Drop to the ground","Shout for help"],c:1,cat:"safety",ex:"Move with edges not against the crowd. Fighting the flow causes falls and crushes."},
  {q:"Someone is experiencing chest pain. Do NOT:",a:["Keep them calm and seated upright","Loosen tight clothing","Lay them flat on the ground","Call 112 urgently"],c:2,cat:"first_aid",ex:"Never lay someone with chest pain flat — it increases heart strain. Seated upright is correct position."},
  {q:"A child is lost. You should:",a:["Take them to the nearest police station immediately","Stay at the same location, calm the child, inform nearby security, call 1098","Walk around looking for parents","Leave them with any adult nearby"],c:1,cat:"safety",ex:"Stay in place — moving makes reunion harder. 1098 (CHILDLINE) is free 24×7 for children."},
  {q:"You're near a downed electric wire. You must stay at least:",a:["3 feet away","10 feet away — the ground itself carries current","1 metre away","Just don't touch the wire"],c:1,cat:"first_aid",ex:"Electric current travels through ground — 10 feet minimum. Even puddles can be electrified. Never touch anything nearby."},
  {q:"A stranger offers you a ride. You should say:",a:["Yes if they seem friendly","No, thank you — firmly. Move toward crowded area. Share live location with a contact.","Ask for their name first","Accept but note the plate"],c:1,cat:"safety",ex:"'No, thank you' is a complete sentence. Move toward people, share location, report if they persist."},
  {q:"Police refuse to take your FIR. Your immediate legal option is:",a:["Try again next week","Go to Superintendent of Police or Magistrate's court directly under CrPC §156(3)","Accept it and go home","Post on social media"],c:1,cat:"law",ex:"Refusing FIR is illegal. SP → Magistrate's court → NCW 7827170170. NALSA 15100 provides free lawyers."},
  {q:"In a fire, you should NEVER:",a:["Stay low — smoke rises","Use the lift to evacuate","Shout 'FIRE!'","Cover mouth and nose"],c:1,cat:"first_aid",ex:"Never use lifts in a fire — power cuts trap you. Always use stairs. Stay low where air is cleaner."},
  {q:"Someone is cornered in a room. The best improvised defence weapon from a school bag is:",a:["Water bottle","Heavy textbook, pen in fist, or bag as shield/strike tool","Earphones","Phone charger"],c:1,cat:"defence",ex:"Pen held in fist adds force to strikes. Heavy book blocks. Bag creates barrier. Then shout and run."},
  {q:"Zero FIR means you can file at:",a:["Only your local police station","ANY police station in India — regardless of where the crime happened","Only Women's police stations","Only stations in the same city"],c:1,cat:"law",ex:"Zero FIR allows you to file at ANY station in India. They MUST accept and forward it. Refusal is illegal."},
  {q:"When walking alone at night, which is the safest habit?",a:["Walk fast with headphones on","Walk confidently in center of path, keep whistle/phone accessible, share live location","Stay close to walls and parked cars","Walk in silence to avoid attention"],c:1,cat:"safety",ex:"Center of path = more visible, harder to corner. Headphones and phone = distractions. Confidence = deterrent."},
  {q:"A person has a head/neck injury. You must NOT:",a:["Tell them not to move","Hold their head gently from both sides","Lift and move them to a more comfortable position","Wait for paramedics to move them"],c:2,cat:"first_aid",ex:"Moving a spinal/head injury victim without training can cause permanent paralysis. Hold still, wait for paramedics."},
  {q:"IPC §354 (assault on woman's modesty) is:",a:["Bailable — requires additional evidence","Non-bailable — police can arrest without warrant on your complaint alone","Only applies with witnesses","Requires medical examination first"],c:1,cat:"law",ex:"§354 is non-bailable. Police can arrest immediately on your complaint. Minimum 1 year, up to 5 years."},
  {q:"Flooding blocks your path. You should NEVER:",a:["Hold a rope or chain while crossing","Cross fast-flowing water — even ankle-deep can knock you down","Move toward higher ground","Wait for rescue"],c:1,cat:"safety",ex:"Fast-flowing water exerts enormous force. 15cm of fast water knocks adults over. Never cross."},
  {q:"During an earthquake, you should DROP, COVER, HOLD. After shaking stops:",a:["Run outside immediately","Move carefully to open area away from buildings, glass and structures","Stay inside under furniture indefinitely","Use lift to reach ground floor"],c:1,cat:"safety",ex:"After shaking: exit carefully, avoid structures, glass, power lines. Never run during — drop and cover first."},
  {q:"Multiple victims at an accident. Who do you help FIRST?",a:["The person shouting most loudly","Not breathing first → heavy bleeding second → responsive third","The person nearest to you","The youngest victim"],c:1,cat:"first_aid",ex:"Triage: airway/breathing first (4-6 min oxygen loss = brain death), then bleeding, then others."},
  {q:"Someone aggressively invades your space on a bus. You should:",a:["Ignore and hope they stop","Move toward driver/exit, shout 'STOP! DON'T TOUCH ME!', exit at next safe stop","Stay silent to avoid escalation","Change seats without saying anything"],c:1,cat:"safety",ex:"Verbal assertion + moving toward safety + exiting = the correct sequence. Never stay silent."},
  {q:"For a night accident, warning signs should be placed:",a:["Right next to the accident","20-30m away in both directions — gives oncoming vehicles stopping distance","Only on one side","Only if there's no streetlight"],c:1,cat:"first_aid",ex:"20-30m warning distance gives vehicles enough stopping distance. Use phone torch and arm signals too."},
  {q:"Self-defence under IPC §96 means:",a:["You can attack anyone you feel threatened by","You can use reasonable force to protect from immediate harm — no case can be filed against you","You need to prove you tried to escape first","Police permission is needed"],c:1,cat:"law",ex:"IPC §96 gives every person the right to defend from immediate harm. Priya elbowing an attacker = protected."},
  {q:"Someone is fainting from heat. You should:",a:["Give them cold water to drink immediately","Move to shade, lay flat or sit supported, loosen clothes, sprinkle cool water on face","Keep them standing to prevent sleep","Give them food"],c:1,cat:"first_aid",ex:"Flat position restores blood flow to brain. Shade + cool water + loose clothing = recovery in 1-2 minutes."},
  {q:"Which self-defence target creates the fastest escape window?",a:["Shoulder strike","Eyes, nose, groin, or instep of foot — most sensitive areas","Stomach punch","Hair pull"],c:1,cat:"defence",ex:"Eyes (temporary blindness), nose (tears up vision), groin (men), instep (anyone) = fastest escape window."},
  {q:"You're trapped indoors and cornered. The single best exit tactic is:",a:["Beg and explain calmly","Throw object LEFT → attacker turns → sprint RIGHT to exit","Stand very still","Activate phone alarm only"],c:1,cat:"defence",ex:"Throw left, sprint right. That 1-2 second turn window is your escape. Then shout 'FIRE!' as you run."},
  {q:"When someone is unconscious and breathing, the recovery position means:",a:["Lay on back with head tilted","Lay on one side to prevent choking if they vomit","Sit them upright against wall","Keep them face down"],c:1,cat:"first_aid",ex:"Recovery position (on side) prevents vomit/saliva choking. Most life-saving for unconscious breathing person."},
  {q:"Living alone, the single MOST important daily safety habit is:",a:["Always sleep with lights on","Lock main door even when inside","Never open windows","Tell no one you live alone"],c:1,cat:"safety",ex:"Most residential assaults happen through unlocked doors. Lock your door — whether you're inside or not."},
  {q:"CHILDLINE (1098) is available for anyone:",a:["Under 14 only","Under 18 — free, 24×7, private","Under 21","Any age for any emergency"],c:1,cat:"law",ex:"1098 CHILDLINE is free, 24×7, completely private for anyone under 18. Police and protection activated on call."},
];

let qi=0,score=0,lives=3,combo=0,gameActive=false,currentMode='';
function showModeSelect(){
  document.getElementById('gmode').style.display='block';
  document.getElementById('qwrap').style.display='none';
  document.getElementById('gres').classList.remove('show');
  document.getElementById('gtop').style.display='none';
  qi=0;score=0;lives=3;combo=0;gameActive=false;
}
function startGame(mode){
  currentMode=mode;
  qi=0;score=0;lives=3;combo=0;gameActive=true;
  document.getElementById('gmode').style.display='none';
  document.getElementById('gres').classList.remove('show');
  document.getElementById('qwrap').style.display='block';
  document.getElementById('gtop').style.display='flex';
  showQ();
}
function getQS(){return currentMode==='cyber'?CYBER_QS:PHYSICAL_QS;}
function showQ(){
  const QS=getQS();
  if(qi>=QS.length){endGame();return;}
  const q=QS[qi];
  document.getElementById('qnum').textContent=`Question ${qi+1} of ${QS.length}`;
  document.getElementById('qtxt').textContent=q.q;
  const catEl=document.getElementById('qcat');
  catEl.textContent=q.cat.charAt(0).toUpperCase()+q.cat.slice(1);
  catEl.className='qcatb qcat-'+q.cat;
  document.getElementById('qfb').classList.remove('show','ok','bad');
  document.getElementById('qnxt').classList.remove('show');
  document.getElementById('gpbf').style.width=((qi/QS.length)*100)+'%';
  document.getElementById('gqn').textContent=qi+'/40';
  document.getElementById('gsc').textContent=score;
  const lv=document.getElementById('glv');
  lv.textContent=lives===3?'❤️❤️❤️':lives===2?'❤️❤️🖤':lives===1?'❤️🖤🖤':'🖤🖤🖤';
  const ag=document.getElementById('agrid');ag.innerHTML='';
  const ltrs=['A','B','C','D'];
  q.a.forEach((ans,i)=>{
    const b=document.createElement('button');b.className='abtn';b.innerHTML=`<span class="altr">${ltrs[i]}</span>${ans}`;
    b.onclick=()=>pick(i);ag.appendChild(b);
  });
}
function pick(i){
  if(!gameActive)return;
  const QS=getQS();const q=QS[qi];const btns=document.querySelectorAll('.abtn');
  btns.forEach(b=>b.disabled=true);
  const fb=document.getElementById('qfb');const fbhd=document.getElementById('fbhd');const fbex=document.getElementById('fbex');
  if(i===q.c){
    btns[i].classList.add('correct');combo++;
    const pts=10+(combo>2?10:combo>1?5:0);score+=pts;
    fb.classList.add('show','ok');
    fbhd.textContent='✅ Correct! +'+(combo>2?'20 (COMBO 🔥!)':combo>1?'15 (Combo!)':'10');
    fbex.textContent=q.ex;
    if(combo>=3){const cp=document.getElementById('combop');cp.textContent='🔥 '+(combo===3?'TRIPLE':'COMBO')+'! +20';cp.classList.remove('show');void cp.offsetWidth;cp.classList.add('show');}
  } else {
    btns[i].classList.add('wrong');btns[q.c].classList.add('correct');combo=0;lives--;
    fb.classList.add('show','bad');fbhd.textContent='❌ Wrong — Here\'s What to Know:';fbex.textContent=q.ex;
    if(lives<=0){gameActive=false;setTimeout(endGame,2000);return;}
  }
  document.getElementById('qnxt').classList.add('show');
}
function nextQ(){qi++;showQ();}
function endGame(){
  const QS=getQS();
  document.getElementById('qwrap').style.display='none';document.getElementById('gtop').style.display='none';
  const res=document.getElementById('gres');res.classList.add('show');
  document.getElementById('gsc').textContent=score;document.getElementById('gpbf').style.width='100%';
  const maxScore=QS.length*10+100;
  const sc=document.getElementById('rscore');sc.textContent=score+' pts';
  sc.style.color=score>=320?'var(--lime)':score>=200?'var(--gold)':'var(--coral)';
  const msgs=['Keep learning — watch all videos and try again! 💪','Getting stronger! Read each section and try again.','Great effort! You\'re building real safety knowledge 🌟','Very strong! You\'re a safety champion 🏆','SHERNI LEVEL! Outstanding safety knowledge! 🦁🔥'];
  document.getElementById('rmsg').textContent=msgs[score>=360?4:score>=280?3:score>=200?2:score>=120?1:0];
  document.getElementById('rtit').textContent=score>=320?'SHERNI LEVEL! 🦁':score>=240?'SAFETY CHAMPION!':score>=160?'GREAT EFFORT!':'KEEP GOING! 💪';
  const bdg=document.getElementById('rbadges');bdg.innerHTML='';
  if(score>=200)bdg.innerHTML+='<div class="rbadge">⭐ Safety Aware</div>';
  if(score>=280)bdg.innerHTML+='<div class="rbadge">🛡️ Safety Champion</div>';
  if(score>=360)bdg.innerHTML+='<div class="rbadge">🦁 True Sherni</div>';
  if(lives>0)bdg.innerHTML+='<div class="rbadge">❤️ Survived!</div>';
  if(currentMode==='cyber')bdg.innerHTML+='<div class="rbadge">🔐 Cyber Aware</div>';
  else bdg.innerHTML+='<div class="rbadge">🛡️ Street Smart</div>';
}


// ── ROAR TRIGGER ──
function doRoar(){
  spawnGoosebumps();
  triggerRoarPulse();
  // shake effect
  let s=0;
  const shake=()=>{
    document.body.style.transform=s%2===0?'translateX(-3px) rotate(-0.3deg)':'translateX(3px) rotate(0.3deg)';
    s++;
    if(s<8)setTimeout(shake,55);
    else{document.body.style.transform='';document.body.style.transition='';}
  };
  document.body.style.transition='none';
  shake();
  // feedback
  const fb=document.getElementById('roarfeedback');
  if(fb){fb.style.opacity='1';setTimeout(()=>{fb.style.opacity='0';},2200);}
}

// ── YOUTUBE OPENER ──
function openYT(url){window.open(url,'_blank','noopener,noreferrer');}

// ── LOCAL VIDEO PLAYER ──
function playLocalVid(src){
  const modal=document.getElementById('local-vid-modal');
  const player=document.getElementById('local-vid-player');
  player.src=src;
  modal.style.display='flex';
  player.play().catch(()=>{});
}
function closeLocalVid(){
  const modal=document.getElementById('local-vid-modal');
  const player=document.getElementById('local-vid-player');
  player.pause();
  player.src='';
  modal.style.display='none';
}
// close on backdrop click
document.getElementById('local-vid-modal').addEventListener('click',function(e){
  if(e.target===this)closeLocalVid();
});

// ── INIT ──
window.addEventListener('load',()=>{
  setTimeout(initRV,300);
  // Play audio immediately from the very start
  const m=document.getElementById('bgm');
  if(!m)return;
  m.volume=0.4;
  m.currentTime=0;
  const tryPlay=()=>{
    m.play().catch(()=>{
      // browser blocked autoplay — play on very first interaction
      const go_=()=>{m.currentTime=0;m.play().catch(()=>{});document.removeEventListener('click',go_);document.removeEventListener('touchstart',go_);};
      document.addEventListener('click',go_);
      document.addEventListener('touchstart',go_);
    });
  };
  tryPlay();
});
