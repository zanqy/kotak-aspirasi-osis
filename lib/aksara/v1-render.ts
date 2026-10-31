/* eslint-disable */
// @ts-nocheck
// Ported verbatim dari aksara/index.html (prototype v1) supaya tampilan identik.
// Hanya fungsi visual — tanpa localStorage. Data masuk lewat argumen.

type AnyRec = Record<string, any>;

  var NOTE_COLORS = ["#F7E39B","#F6D8DD","#DCE7CB","#D7E4EF","#F1E0C4"];
  var SHAPES = {
    note:     [["sq","Persegi"],["wide","Lebar"],["tall","Tinggi"],["round","Bulat"],["torn","Sobek"]],
    polaroid: [["pola","Polaroid"],["flat","Persegi"],["round","Bulat"],["arch","Lengkung"]],
    clip:     [["rect","Koran"],["strip","Kolom"],["torn","Sobek"]],
    tiket:    [["lurus","Lurus"],["sobek","Sobek"]],
    pita:     [["lurus","Lurus"],["sayap","Sayap"]],
    perangko: [["rect","Lurus"],["gerigi","Gerigi"]],
    amplop:   [["lurus","Tertutup"],["buka","Terbuka"]],
    tag:      [["rect","Kotak"],["lonjong","Lonjong"]],
    struk:    [["lurus","Struk"]],
    umbul:    [["rumbai","Rumbai"],["bulat","Bulat"],["bintang","Bintang"]],
    lampu:    [["lurus","Lampu"]],
    lampion:  [["lurus","Lampion"]],
    layang:   [["lurus","Layang"]],
    kipas:    [["lurus","Kipas"]],
    rantai:   [["lurus","Rantai"]],
    balon:    [["bulat","Bulat"]],
    badge:    [["bintang","Bintang"]],
    tulis:    [["papan","Papan"]]
  };
  var STAMP_TEXT = {penting:"PENTING",rahasia:"RAHASIA",osis:"DARI OSIS",eksklusif:"EKSKLUSIF",senyum:"SENYUM DULU",love:"LOVE",wow:"WOW",baru:"BARU",rahasia2:"JANGAN DIBUKA",semangat:"SEMANGAT",cakep:"CAKEP",asli:"ASLI",dibaca:"DIBACA",arsip:"ARSIP"};
  var RATIOS = [["11","1:1"],["43","4:3"],["34","3:4"],["169","16:9"]];
  var FILTERS = [["biasa","Biasa"],["sepia","Sepia"],["senja","Senja"],["koran","Koran"],["bw","Hitam putih"],["pudar","Pudar"]];
  var PAPERS = {note:[["polos","Polos"],["garis","Garis"],["kotak","Kotak"],["buku","Buku tulis"],["polka","Polka"],["strip","Garis miring"],["kado","Kado"],["daur","Daur ulang"],["koran","Koran"],["kraft","Kraft"]],clip:[["koran","Koran"],["hvs","Putih"],["daur","Daur ulang"],["kraft","Kraft"]],tiket:[["krem","Krem"],["pink","Pink"],["hijau","Hijau"]]};
  var TAPES = [["bening","Bening"],["merah","Merah"],["biru","Biru"],["hitam","Hitam"],["polka","Polka"],["strip","Strip"]];
  var FONTS = [["tangan","Tangan"],["tegak","Tegak"],["ketik","Mesin ketik"],["stencil","Stencil"],["spidol","Spidol"]];
  var INKS = [["hitam","Hitam"],["merah","Merah"],["biru","Biru"],["ungu","Ungu"],["hijau","Hijau"]];
  var STAMPS = [["tanpa","Tanpa"],["penting","Penting"],["rahasia","Rahasia"],["osis","Dari OSIS"],["eksklusif","Eksklusif"],["senyum","Senyum dulu"],["love","LOVE"],["wow","WOW"],["baru","BARU"],["rahasia2","Jangan dibuka"],["semangat","Semangat"],["cakep","Cakep"],["asli","Asli"],["dibaca","Dibaca"],["arsip","Arsip"]];
  var FRAMES = [["putih","Putih"],["krem","Krem"],["pink","Pink"],["hitam","Hitam"],["kayu","Kayu"]];
  var HIGHLIGHTS = [["tanpa","Tanpa"],["kuning","Kuning"],["pink","Pink"],["biru","Biru"],["hijau","Hijau"]];
  var TAPE_POS = [["atas","Atas"],["kanan","Kanan"],["bawah","Bawah"],["kiri","Kiri"]];
  var STICKERS = [["tanpa","Tanpa"],["bintang","Bintang"],["hati","Hati"],["bunga","Bunga"],["kupu","Kupu-kupu"],["petir","Petir"],["kilau","Kilau"],["mahkota","Mahkota"],["awan","Awan"],["salju","Salju"],["nada","Nada"],["payung","Payung"],["bulan","Bulan"],["segel","Segel lilin"],["daun","Daun"],["panah","Panah"],["jangkar","Jangkar"],["matahari","Matahari"],["cap","Cap merah"]];
  var STICKER_GLYPH = {bintang:"★",hati:"♥",bunga:"✿",kupu:"❋",petir:"⚡",kilau:"✦",mahkota:"♛",awan:"☁",salju:"❄",nada:"♪",payung:"☂",bulan:"☾",segel:"★",daun:"❧",panah:"➳",jangkar:"⚓",matahari:"☀",cap:""};


  function stickerHTML(s){
    if(!s || s === "tanpa") return "";
    if(s === "segel") return '<div class="stk segel"><i>★</i></div>';
    return '<div class="stk ' + s + '">' + (STICKER_GLYPH[s] || "") + "</div>";
  }
  function segelEl(){
    var d = document.createElement("div");
    d.className = "stk segel"; d.innerHTML = "<i>★</i>"; return d;
  }
  function segelAware(s){
    if(s === "segel") return segelEl();
    var d = document.createElement("div");
    d.className = "stk " + s; d.textContent = STICKER_GLYPH[s] || ""; return d;
  }
  function segelAwareSp(s, d){
    var el = segelAware(s);
    if(d.sp === "tl") el.classList.add("sp-tl");
    if(d.sg && d.sg !== "normal") el.classList.add("sg-" + d.sg);
    return el;
  }
  function umbulSVG(shape){
    var cols = ["#F6D8DD","#F9E8EC","#DCE7CB","#D7E4EF","#F7E39B","#F1E0C4","#E4EDDC","#F9E3E7","#FFFDF7"];
    var s = '<svg width="560" height="64" viewBox="0 0 560 64">';
    s += '<path d="M0,10 Q280,42 560,8" stroke="#2b241c" stroke-width="2.5" fill="none"/>';
    for(var i = 0; i < 9; i++){
      var x = 18 + i * 58;
      if(shape === "bulat"){
        s += '<circle cx="' + (x + 16) + '" cy="32" r="14" fill="' + cols[i] + '" stroke="rgba(34,29,21,.35)" stroke-width="1"/>';
      } else if(shape === "bintang"){
        var p = "";
        for(var k = 0; k < 10; k++){
          var rr = k % 2 ? 6.5 : 15, aa = -Math.PI / 2 + k * Math.PI / 5;
          p += ((x + 16) + rr * Math.cos(aa)).toFixed(1) + "," + (32 + rr * Math.sin(aa)).toFixed(1) + " ";
        }
        s += '<polygon points="' + p + '" fill="' + cols[i] + '" stroke="rgba(34,29,21,.35)" stroke-width="1"/>';
      } else {
        s += '<polygon points="' + x + ',13 ' + (x + 32) + ',13 ' + (x + 16) + ',52" fill="' + cols[i] + '" stroke="rgba(34,29,21,.35)" stroke-width="1"/>';
      }
    }
    return s + "</svg>";
  }
  function lampuSVG(){
    var cols = ["#E8632B","#F2B134","#7FC47A","#6EA3E0","#D94A35","#F2B134","#3FA7A0"];
    var ys = [22, 30, 34, 36, 34, 30, 24];
    var s = '<svg width="560" height="92" viewBox="0 0 560 92">';
    s += '<path d="M0,8 Q280,44 560,6" stroke="#2b241c" stroke-width="2.5" fill="none"/>';
    for(var i = 0; i < 7; i++){
      var x = 40 + i * 80, y = ys[i];
      s += '<line x1="' + x + '" y1="' + (y - 8) + '" x2="' + x + '" y2="' + (y - 20) + '" stroke="#2b241c" stroke-width="2"/>';
      s += '<circle cx="' + x + '" cy="' + y + '" r="16" fill="' + cols[i] + '" opacity=".3"/>';
      s += '<circle cx="' + x + '" cy="' + y + '" r="9" fill="' + cols[i] + '" stroke="rgba(34,29,21,.4)" stroke-width="1"/>';
      s += '<rect x="' + (x - 4) + '" y="' + (y - 26) + '" width="8" height="6" fill="#2b241c"/>';
    }
    return s + "</svg>";
  }
  function lampionSVG(){
    var s = '<svg width="120" height="180" viewBox="0 0 120 180">';
    s += '<line x1="60" y1="0" x2="60" y2="22" stroke="#2b241c" stroke-width="2"/>';
    s += '<rect x="45" y="22" width="30" height="10" rx="2" fill="#7D5230"/>';
    s += '<ellipse cx="60" cy="92" rx="48" ry="60" fill="#E2574C"/>';
    s += '<ellipse cx="60" cy="92" rx="48" ry="60" fill="url(#lp)" opacity=".25"/>';
    s += '<ellipse cx="60" cy="92" rx="30" ry="60" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2"/>';
    s += '<ellipse cx="60" cy="92" rx="12" ry="60" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2"/>';
    s += '<rect x="45" y="148" width="30" height="10" rx="2" fill="#7D5230"/>';
    s += '<line x1="52" y1="158" x2="52" y2="176" stroke="#C03B21" stroke-width="2"/>';
    s += '<line x1="60" y1="158" x2="60" y2="178" stroke="#C03B21" stroke-width="2"/>';
    s += '<line x1="68" y1="158" x2="68" y2="176" stroke="#C03B21" stroke-width="2"/>';
    return s + "</svg>";
  }
  function layangSVG(){
    var s = '<svg width="150" height="195" viewBox="0 0 150 195">';
    s += '<line x1="75" y1="0" x2="75" y2="12" stroke="#2b241c" stroke-width="2"/>';
    s += '<polygon points="75,12 140,82 75,152 10,82" fill="#3FA7A0" stroke="rgba(34,29,21,.4)" stroke-width="1.5"/>';
    s += '<line x1="75" y1="12" x2="75" y2="152" stroke="rgba(255,255,255,.6)" stroke-width="2"/>';
    s += '<line x1="10" y1="82" x2="140" y2="82" stroke="rgba(255,255,255,.6)" stroke-width="2"/>';
    s += '<path d="M75,152 Q70,168 76,182" stroke="#2b241c" stroke-width="2" fill="none"/>';
    s += '<polygon points="70,162 82,162 76,172" fill="#F2B134"/>';
    s += '<polygon points="71,174 81,174 76,184" fill="#E8632B"/>';
    return s + "</svg>";
  }
  function kipasSVG(){
    var cols = ["#F9E8EC","#FFFDF7"];
    var s = '<svg width="150" height="150" viewBox="0 0 150 150">';
    for(var i = 0; i < 24; i++){
      var a0 = i * Math.PI / 12, a1 = (i + 1) * Math.PI / 12;
      s += '<polygon points="75,75 ' + (75 + 68 * Math.cos(a0)).toFixed(1) + ',' + (75 + 68 * Math.sin(a0)).toFixed(1) + ' ' + (75 + 68 * Math.cos(a1)).toFixed(1) + ',' + (75 + 68 * Math.sin(a1)).toFixed(1) + '" fill="' + cols[i % 2] + '" stroke="rgba(34,29,21,.25)" stroke-width=".7"/>';
    }
    s += '<circle cx="75" cy="75" r="15" fill="#C03B21" stroke="rgba(34,29,21,.4)" stroke-width="1.5"/>';
    s += '<circle cx="75" cy="75" r="5" fill="#F5F2E8"/>';
    return s + "</svg>";
  }
  function rantaiSVG(){
    var cols = ["#F6D8DD","#DCE7CB","#D7E4EF","#F9E8EC","#F7E39B","#F1E0C4","#E4EDDC","#F9E3E7"];
    var s = '<svg width="400" height="64" viewBox="0 0 400 64">';
    for(var i = 0; i < 8; i++){
      var x = 25 + i * 50;
      s += '<ellipse cx="' + x + '" cy="32" rx="23" ry="17" fill="none" stroke="' + cols[i] + '" stroke-width="8"/>';
      s += '<ellipse cx="' + x + '" cy="32" rx="23" ry="17" fill="none" stroke="rgba(34,29,21,.3)" stroke-width="1"/>';
    }
    return s + "</svg>";
  }

  var IMG_KEY = "aksara_img_v1";
  var IMGS = {};
  try{ IMGS = JSON.parse(localStorage.getItem(IMG_KEY)) || {}; }catch(e){ IMGS = {}; }
  function stkClsD(d: any){ return (d.sp === "tl" ? " sp-tl" : "") + (d.sg && d.sg !== "normal" ? " sg-" + d.sg : ""); }

function makeItem(data: AnyRec){
    var el = document.createElement("div");
    var base = data.kind === "polaroid" ? "pola" : data.kind === "clip" ? "clip" :
      data.kind === "tiket" ? "tiket" : data.kind === "pita" ? "pita" :
      data.kind === "perangko" ? "perangko" : data.kind === "amplop" ? "amplop" :
      data.kind === "tag" ? "tag" : data.kind === "struk" ? "struk" :
      data.kind === "umbul" ? "umbul" : data.kind === "balon" ? "balon" :
      data.kind === "badge" ? "badge" : data.kind === "tulis" ? "tulis" :
      data.kind === "lampu" ? "lampu" : data.kind === "lampion" ? "lampion" :
      data.kind === "layang" ? "layang" : data.kind === "kipas" ? "kipas" :
      data.kind === "rantai" ? "rantai" : "note";
    el.className = "item " + base + (data.shape && data.shape !== base ? " " + data.shape : "") + (data.ratio ? " r" + data.ratio : "")
      + (data.paper && ((base === "note" && data.paper !== "polos") || (base === "clip" && data.paper !== "koran")) ? " paper-" + data.paper : "")
      + (data.paper && base === "tiket" && data.paper !== "krem" ? " tik-" + data.paper : "")
      + (data.font && data.font !== "tangan" && (base === "note" || base === "clip" || base === "tiket" || base === "pola") ? " fnt-" + data.font : "")
      + (data.ink && data.ink !== "hitam" ? " ink-" + data.ink : "")
      + (data.shape === "gerigi" && base === "perangko" ? " p-gerigi" : "")
      + (data.align && data.align !== "kiri" && (base === "note" || base === "clip" || base === "tiket" || base === "perangko" || base === "struk" || base === "tulis") ? " al-" + data.align : "")
      + (data.shadow && data.shadow !== "lembut" ? " sh-" + data.shadow : "")
      + (data.sp === "tl" ? " sp-tl" : "")
      + (data.frame && data.frame !== "putih" && base === "pola" ? " frame-" + data.frame : "")
      + (data.highlight && data.highlight !== "tanpa" && (base === "note" || base === "clip" || base === "tiket") ? " hl-" + data.highlight : "")
      + (data.flip && base === "pola" ? " flipx" : "");
    el.dataset.id = data.id;
    if(data.tapePos) el.dataset.tp = data.tapePos;
    if(data.pinPos) el.dataset.pinpos = data.pinPos;
    el.style.left = data.x + "px";
    el.style.top = data.y + "px";
    el.style.transform = "rotate(" + (data.rot || 0) + "deg)" + (data.scale && data.scale !== 1 ? " scale(" + data.scale + ")" : "");
    if(data.kind === "note" || data.kind === "pita" || data.kind === "perangko" || data.kind === "amplop" || data.kind === "tag") el.style.setProperty("--c", data.color || (data.kind === "pita" ? "#F6D8DD" : NOTE_COLORS[0]));

    var body = document.createElement("div");
    body.className = "body";

    if(data.kind === "tiket"){
      var stub = document.createElement("div");
      stub.className = "tstub";
      stub.innerHTML = "<span>ADMIT ONE</span>";
      el.appendChild(stub);
      body.className = "tbody";
      body.innerHTML = '<div class="txt"></div><div class="tno">SERI 231 · KURSI BEBAS</div>';
      body.querySelector(".txt").textContent = data.text || "";
      el.appendChild(body);
      if(data.sticker && data.sticker !== "tanpa"){
        var stk1 = document.createElement("div");
        stk1.className = "stk " + data.sticker;
        stk1.textContent = STICKER_GLYPH[data.sticker] || "";
        el.appendChild(stk1);
      }
      if(data.stamp && data.stamp !== "tanpa"){
        var stm1 = document.createElement("div");
        stm1.className = "stamp";
        stm1.textContent = STAMP_TEXT[data.stamp] || "";
        el.appendChild(stm1);
      }
      return el;
    }
    if(data.kind === "pita"){
      body.innerHTML = '<div class="txt"></div>';
      body.querySelector(".txt").textContent = data.text || "";
      el.appendChild(body);
      if(data.sticker && data.sticker !== "tanpa"){
        var stk2 = document.createElement("div");
        stk2.className = "stk " + data.sticker;
        stk2.textContent = STICKER_GLYPH[data.sticker] || "";
        el.appendChild(stk2);
      }
      if(data.stamp && data.stamp !== "tanpa"){
        var stm2 = document.createElement("div");
        stm2.className = "stamp";
        stm2.textContent = STAMP_TEXT[data.stamp] || "";
        el.appendChild(stm2);
      }
      return el;
    }
    if(data.kind === "perangko"){
      body.className = "pbody";
      body.innerHTML = '<div class="txt"></div><div class="pnom"><span>POS AKSARA</span><span>231</span></div>';
      body.querySelector(".txt").textContent = data.text || "";
      el.appendChild(body);
      if(data.sticker && data.sticker !== "tanpa"){ el.appendChild(segelAware(data.sticker)); }
      if(data.stamp && data.stamp !== "tanpa"){
        var stm3 = document.createElement("div");
        stm3.className = "stamp";
        stm3.textContent = STAMP_TEXT[data.stamp] || "";
        el.appendChild(stm3);
      }
      return el;
    }
    if(data.kind === "amplop"){
      el.insertAdjacentHTML("afterbegin", '<div class="aflap"></div>');
      if(data.shape === "buka") el.insertAdjacentHTML("afterbegin", '<div class="aletter"></div>');
      el.insertAdjacentHTML("afterbegin", '<div class="apost"></div>');
      body.innerHTML = '<div class="txt"></div>';
      body.querySelector(".txt").textContent = data.text || "";
      el.appendChild(body);
      if(data.sticker && data.sticker !== "tanpa") el.appendChild(segelAwareSp(data.sticker, data));
      if(data.stamp && data.stamp !== "tanpa"){
        var stm4 = document.createElement("div");
        stm4.className = "stamp";
        stm4.textContent = STAMP_TEXT[data.stamp] || "";
        el.appendChild(stm4);
      }
      return el;
    }
    if(data.kind === "tag"){
      el.insertAdjacentHTML("afterbegin", '<div class="tstring"></div><div class="thole"></div>');
      body.innerHTML = '<div class="txt"></div>';
      body.querySelector(".txt").textContent = data.text || "";
      el.appendChild(body);
      if(data.sticker && data.sticker !== "tanpa") el.appendChild(segelAwareSp(data.sticker, data));
      if(data.stamp && data.stamp !== "tanpa"){
        var stm5 = document.createElement("div");
        stm5.className = "stamp";
        stm5.textContent = STAMP_TEXT[data.stamp] || "";
        el.appendChild(stm5);
      }
      return el;
    }
    if(data.kind === "lampu" || data.kind === "lampion" || data.kind === "layang" || data.kind === "kipas" || data.kind === "rantai"){
      el.innerHTML = { lampu: lampuSVG(), lampion: lampionSVG(), layang: layangSVG(), kipas: kipasSVG(), rantai: rantaiSVG() }[data.kind];
      if(data.sticker && data.sticker !== "tanpa") el.appendChild(segelAwareSp(data.sticker, data));
      if(data.stamp && data.stamp !== "tanpa"){
        var stmD = document.createElement("div");
        stmD.className = "stamp";
        stmD.textContent = STAMP_TEXT[data.stamp] || "";
        el.appendChild(stmD);
      }
      return el;
    }
    if(data.kind === "umbul"){
      el.innerHTML = umbulSVG(data.shape);
      if(data.sticker && data.sticker !== "tanpa") el.appendChild(segelAwareSp(data.sticker, data));
      if(data.stamp && data.stamp !== "tanpa"){
        var stm7 = document.createElement("div");
        stm7.className = "stamp";
        stm7.textContent = STAMP_TEXT[data.stamp] || "";
        el.appendChild(stm7);
      }
      return el;
    }
    if(data.kind === "balon"){
      body.innerHTML = '<div class="txt"></div>';
      body.className = "bbody";
      body.querySelector(".txt").textContent = data.text || "";
      el.appendChild(body);
      el.insertAdjacentHTML("beforeend", '<div class="bknot"></div><div class="bstring"></div>');
      if(data.sticker && data.sticker !== "tanpa") el.appendChild(segelAwareSp(data.sticker, data));
      if(data.stamp && data.stamp !== "tanpa"){
        var stm8 = document.createElement("div");
        stm8.className = "stamp";
        stm8.textContent = STAMP_TEXT[data.stamp] || "";
        el.appendChild(stm8);
      }
      return el;
    }
    if(data.kind === "badge"){
      body.innerHTML = '<div class="txt"></div>';
      body.className = "bburst";
      body.querySelector(".txt").textContent = data.text || "";
      el.appendChild(body);
      if(data.sticker && data.sticker !== "tanpa") el.appendChild(segelAwareSp(data.sticker, data));
      if(data.stamp && data.stamp !== "tanpa"){
        var stm9 = document.createElement("div");
        stm9.className = "stamp";
        stm9.textContent = STAMP_TEXT[data.stamp] || "";
        el.appendChild(stm9);
      }
      return el;
    }
    if(data.kind === "tulis"){
      body.innerHTML = '<div class="txt"></div><div class="tkapur"></div>';
      body.querySelector(".txt").textContent = data.text || "";
      el.appendChild(body);
      if(data.sticker && data.sticker !== "tanpa") el.appendChild(segelAwareSp(data.sticker, data));
      if(data.stamp && data.stamp !== "tanpa"){
        var stm10 = document.createElement("div");
        stm10.className = "stamp";
        stm10.textContent = STAMP_TEXT[data.stamp] || "";
        el.appendChild(stm10);
      }
      return el;
    }
    if(data.kind === "struk"){
      body.innerHTML = '<div class="shead">AKSARA MART</div><div class="txt"></div><div class="sfoot">★ TERIMA KASIH ★</div>';
      body.querySelector(".txt").textContent = data.text || "";
      el.appendChild(body);
      if(data.sticker && data.sticker !== "tanpa") el.appendChild(segelAwareSp(data.sticker, data));
      if(data.stamp && data.stamp !== "tanpa"){
        var stm6 = document.createElement("div");
        stm6.className = "stamp";
        stm6.textContent = STAMP_TEXT[data.stamp] || "";
        el.appendChild(stm6);
      }
      return el;
    }
    if(data.kind === "polaroid"){
      body.innerHTML = '<div class="ph"></div><div class="cap"></div>';
      var ph = body.querySelector(".ph");
      if(data.filter && data.filter !== "biasa") ph.classList.add("f-" + data.filter);
      var _iu = imgUrl(data.image);
      if(_iu){ ph.style.backgroundImage = 'url("' + _iu + '")'; ph.textContent = ""; }
      else { ph.textContent = "belum ada foto"; }
      body.querySelector(".cap").textContent = data.text || "";
      el.appendChild(body);
      if(data.sticker && data.sticker !== "tanpa"){
        var st = document.createElement("div");
        st.className = "stk " + data.sticker + stkClsD(data);
        if(data.sticker === "segel"){ st.innerHTML = "<i>★</i>"; }
        else { st.textContent = STICKER_GLYPH[data.sticker] || ""; }
        el.appendChild(st);
      }
      if(data.stamp && data.stamp !== "tanpa"){
        var smp = document.createElement("div");
        smp.className = "stamp";
        smp.textContent = STAMP_TEXT[data.stamp] || "";
        el.appendChild(smp);
      }
      el.insertAdjacentHTML("afterbegin", '<div class="tape' + (data.tape && data.tape !== "bening" ? " t-" + data.tape : "") + (data.tapePos && data.tapePos !== "atas" ? " tp-" + data.tapePos : "") + '"></div>');
    } else if(data.kind === "clip"){
      body.innerHTML = '<div class="txt"></div><div class="who"></div>';
      body.querySelector(".txt").textContent = data.text || "";
      body.querySelector(".who").textContent = data.name || "tanpa nama";
      el.appendChild(body);
      if(data.sticker && data.sticker !== "tanpa"){
        var st = document.createElement("div");
        st.className = "stk " + data.sticker + stkClsD(data);
        if(data.sticker === "segel"){ st.innerHTML = "<i>★</i>"; }
        else { st.textContent = STICKER_GLYPH[data.sticker] || ""; }
        el.appendChild(st);
      }
      if(data.stamp && data.stamp !== "tanpa"){
        var smp = document.createElement("div");
        smp.className = "stamp";
        smp.textContent = STAMP_TEXT[data.stamp] || "";
        el.appendChild(smp);
      }
      el.insertAdjacentHTML("afterbegin", '<div class="tape' + (data.tape && data.tape !== "bening" ? " t-" + data.tape : "") + (data.tapePos && data.tapePos !== "atas" ? " tp-" + data.tapePos : "") + '"></div>');
    } else {
      body.innerHTML = '<div class="txt"></div>';
      body.querySelector(".txt").textContent = data.text || "";
      el.appendChild(body);
      if(data.sticker && data.sticker !== "tanpa"){
        var st = document.createElement("div");
        st.className = "stk " + data.sticker + stkClsD(data);
        if(data.sticker === "segel"){ st.innerHTML = "<i>★</i>"; }
        else { st.textContent = STICKER_GLYPH[data.sticker] || ""; }
        el.appendChild(st);
      }
      if(data.stamp && data.stamp !== "tanpa"){
        var smp = document.createElement("div");
        smp.className = "stamp";
        smp.textContent = STAMP_TEXT[data.stamp] || "";
        el.appendChild(smp);
      }
      el.insertAdjacentHTML("afterbegin", '<div class="pin' + (data.pin && data.pin !== "merah" ? " pin-" + data.pin : "") + (data.pinPos === "kiri" ? " pp-kiri" : "") + '"></div>');
    }

    attachDrag(el, data);
    return el;
  }


function imgId(url: string) { return url; }
function imgUrl(ref: string | null) {
  if (!ref) return null;
  if (ref.indexOf("img:") === 0) return IMGS[ref.slice(4)] || null;
  return ref;
}

function attachDrag(_el: HTMLElement, _data: any){}

export const V1 = {
  NOTE_COLORS, SHAPES, STAMP_TEXT, STAMPS, STICKERS, STICKER_GLYPH,
  RATIOS, FILTERS, PAPERS, TAPES, FONTS, INKS, FRAMES, HIGHLIGHTS, TAPE_POS,
};

export function buildItem(data: AnyRec): HTMLElement {
  return makeItem(data);
}
