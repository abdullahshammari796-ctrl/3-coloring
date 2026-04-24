"use strict";
/* ===== MODE ===== */
let userMode='experienced';
function chooseMode(m){
  userMode=m;document.getElementById('mode-overlay').classList.add('hidden');
  document.getElementById('app').style.display='block';
  const badge=document.getElementById('mode-badge');badge.classList.remove('hidden');
  if(m==='beginner'){document.body.classList.add('beginner');badge.className='mode-badge beg';document.getElementById('badge-text').textContent='🌱 Beginner Mode'}
  else{document.body.classList.remove('beginner');badge.className='mode-badge exp';document.getElementById('badge-text').textContent='🔧 Expert Mode'}
  init();
}
/* ===== GRAPH ===== */
const PRESETS={triangle:{n:3,edges:[[0,1],[1,2],[2,0]],pos:[[400,80],[250,350],[550,350]]},petersen:{n:10,edges:[[0,1],[1,2],[2,3],[3,4],[4,0],[5,7],[7,9],[9,6],[6,8],[8,5],[0,5],[1,6],[2,7],[3,8],[4,9]],pos:null},bipartite:{n:6,edges:[[0,3],[0,4],[0,5],[1,3],[1,4],[1,5],[2,3],[2,4],[2,5]],pos:[[200,100],[400,100],[600,100],[200,350],[400,350],[600,350]]},wheel5:{n:6,edges:[[0,1],[1,2],[2,3],[3,4],[4,0],[5,0],[5,1],[5,2],[5,3],[5,4]],pos:null},k4:{n:4,edges:[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]],pos:[[400,60],[200,350],[600,350],[400,220]]},cycle5:{n:5,edges:[[0,1],[1,2],[2,3],[3,4],[4,0]],pos:null}};
let G={n:0,edges:[],adj:[],pos:[]},mode2='greedy',steps=[],cur=0,playing=false,timer=null,vC=[];
const COL=["#6a6a82","#ff6b6b","#51cf66","#339af0","#fcc419","#ff922b","#f06595","#22b8cf"];
const CN=["Uncolored","Red","Green","Blue","Yellow","Orange","Pink","Cyan"];

/* ===== CODE TEMPLATES ===== */
let curLang='pseudo';
const CODE={
greedy:{
pseudo:`<span class="kw">function</span> <span class="fn">GreedyColoring</span>(G, order):
  <span class="kw">for each</span> vertex v <span class="kw">in</span> order:
    usedColors ← colors of colored neighbors(v)
    v.color ← smallest color <span class="kw">not in</span> usedColors
  <span class="kw">return</span> coloring`,
python:`<span class="kw">def</span> <span class="fn">greedy_coloring</span>(adj, order):
    color = [<span class="num">0</span>] * len(adj)  <span class="cm"># 0 = uncolored</span>
    <span class="kw">for</span> v <span class="kw">in</span> order:
        used = {color[u] <span class="kw">for</span> u <span class="kw">in</span> adj[v] <span class="kw">if</span> color[u] != <span class="num">0</span>}
        c = <span class="num">1</span>
        <span class="kw">while</span> c <span class="kw">in</span> used:
            c += <span class="num">1</span>
        color[v] = c
    <span class="kw">return</span> color`,
java:`<span class="kw">public static</span> <span class="type">int</span>[] <span class="fn">greedyColoring</span>(<span class="type">List</span>&lt;<span class="type">List</span>&lt;<span class="type">Integer</span>&gt;&gt; adj, <span class="type">int</span>[] order) {
    <span class="type">int</span>[] color = <span class="kw">new</span> <span class="type">int</span>[adj.size()]; <span class="cm">// 0 = uncolored</span>
    <span class="kw">for</span> (<span class="type">int</span> v : order) {
        <span class="type">Set</span>&lt;<span class="type">Integer</span>&gt; used = <span class="kw">new</span> <span class="type">HashSet</span>&lt;&gt;();
        <span class="kw">for</span> (<span class="type">int</span> u : adj.get(v))
            <span class="kw">if</span> (color[u] != <span class="num">0</span>) used.add(color[u]);
        <span class="type">int</span> c = <span class="num">1</span>;
        <span class="kw">while</span> (used.contains(c)) c++;
        color[v] = c;
    }
    <span class="kw">return</span> color;
}`,
cpp:`<span class="type">vector</span>&lt;<span class="type">int</span>&gt; <span class="fn">greedyColoring</span>(<span class="type">vector</span>&lt;<span class="type">vector</span>&lt;<span class="type">int</span>&gt;&gt;&amp; adj, <span class="type">vector</span>&lt;<span class="type">int</span>&gt;&amp; order) {
    <span class="type">vector</span>&lt;<span class="type">int</span>&gt; color(adj.size(), <span class="num">0</span>);
    <span class="kw">for</span> (<span class="type">int</span> v : order) {
        <span class="type">set</span>&lt;<span class="type">int</span>&gt; used;
        <span class="kw">for</span> (<span class="type">int</span> u : adj[v])
            <span class="kw">if</span> (color[u]) used.insert(color[u]);
        <span class="type">int</span> c = <span class="num">1</span>;
        <span class="kw">while</span> (used.count(c)) c++;
        color[v] = c;
    }
    <span class="kw">return</span> color;
}`,
js:`<span class="kw">function</span> <span class="fn">greedyColoring</span>(adj, order) {
    <span class="kw">const</span> color = <span class="kw">new</span> <span class="type">Array</span>(adj.length).fill(<span class="num">0</span>);
    <span class="kw">for</span> (<span class="kw">const</span> v <span class="kw">of</span> order) {
        <span class="kw">const</span> used = <span class="kw">new</span> <span class="type">Set</span>();
        <span class="kw">for</span> (<span class="kw">const</span> u <span class="kw">of</span> adj[v])
            <span class="kw">if</span> (color[u]) used.add(color[u]);
        <span class="kw">let</span> c = <span class="num">1</span>;
        <span class="kw">while</span> (used.has(c)) c++;
        color[v] = c;
    }
    <span class="kw">return</span> color;
}`},
backtrack:{
pseudo:`<span class="kw">function</span> <span class="fn">Backtrack</span>(G, v):
  <span class="kw">if</span> v == |V|: <span class="kw">return</span> <span class="num">True</span>  <span class="cm">// all colored</span>
  <span class="kw">for</span> c <span class="kw">in</span> {<span class="num">1, 2, 3</span>}:
    <span class="kw">if</span> <span class="fn">isSafe</span>(v, c):
      v.color ← c
      <span class="kw">if</span> <span class="fn">Backtrack</span>(G, v+1): <span class="kw">return</span> <span class="num">True</span>
      v.color ← <span class="num">0</span>  <span class="cm">// undo</span>
  <span class="kw">return</span> <span class="num">False</span>`,
python:`<span class="kw">def</span> <span class="fn">backtrack</span>(adj, colors, v):
    <span class="kw">if</span> v == len(adj):
        <span class="kw">return</span> <span class="num">True</span>  <span class="cm"># all colored</span>
    <span class="kw">for</span> c <span class="kw">in</span> range(<span class="num">1</span>, <span class="num">4</span>):
        <span class="kw">if</span> <span class="fn">is_safe</span>(adj, colors, v, c):
            colors[v] = c
            <span class="kw">if</span> <span class="fn">backtrack</span>(adj, colors, v + <span class="num">1</span>):
                <span class="kw">return</span> <span class="num">True</span>
            colors[v] = <span class="num">0</span>  <span class="cm"># undo</span>
    <span class="kw">return</span> <span class="num">False</span>

<span class="kw">def</span> <span class="fn">is_safe</span>(adj, colors, v, c):
    <span class="kw">return</span> all(colors[u] != c <span class="kw">for</span> u <span class="kw">in</span> adj[v])`,
java:`<span class="kw">static boolean</span> <span class="fn">backtrack</span>(<span class="type">List</span>&lt;<span class="type">List</span>&lt;<span class="type">Integer</span>&gt;&gt; adj, <span class="type">int</span>[] colors, <span class="type">int</span> v) {
    <span class="kw">if</span> (v == adj.size()) <span class="kw">return true</span>;
    <span class="kw">for</span> (<span class="type">int</span> c = <span class="num">1</span>; c &lt;= <span class="num">3</span>; c++) {
        <span class="kw">if</span> (<span class="fn">isSafe</span>(adj, colors, v, c)) {
            colors[v] = c;
            <span class="kw">if</span> (<span class="fn">backtrack</span>(adj, colors, v + <span class="num">1</span>)) <span class="kw">return true</span>;
            colors[v] = <span class="num">0</span>; <span class="cm">// undo</span>
        }
    }
    <span class="kw">return false</span>;
}
<span class="kw">static boolean</span> <span class="fn">isSafe</span>(<span class="type">List</span>&lt;<span class="type">List</span>&lt;<span class="type">Integer</span>&gt;&gt; adj, <span class="type">int</span>[] c, <span class="type">int</span> v, <span class="type">int</span> col) {
    <span class="kw">for</span> (<span class="type">int</span> u : adj.get(v)) <span class="kw">if</span> (c[u] == col) <span class="kw">return false</span>;
    <span class="kw">return true</span>;
}`,
cpp:`<span class="type">bool</span> <span class="fn">isSafe</span>(<span class="type">vector</span>&lt;<span class="type">vector</span>&lt;<span class="type">int</span>&gt;&gt;&amp; adj, <span class="type">vector</span>&lt;<span class="type">int</span>&gt;&amp; col, <span class="type">int</span> v, <span class="type">int</span> c) {
    <span class="kw">for</span> (<span class="type">int</span> u : adj[v]) <span class="kw">if</span> (col[u] == c) <span class="kw">return false</span>;
    <span class="kw">return true</span>;
}
<span class="type">bool</span> <span class="fn">backtrack</span>(<span class="type">vector</span>&lt;<span class="type">vector</span>&lt;<span class="type">int</span>&gt;&gt;&amp; adj, <span class="type">vector</span>&lt;<span class="type">int</span>&gt;&amp; col, <span class="type">int</span> v) {
    <span class="kw">if</span> (v == adj.size()) <span class="kw">return true</span>;
    <span class="kw">for</span> (<span class="type">int</span> c = <span class="num">1</span>; c &lt;= <span class="num">3</span>; c++) {
        <span class="kw">if</span> (<span class="fn">isSafe</span>(adj, col, v, c)) {
            col[v] = c;
            <span class="kw">if</span> (<span class="fn">backtrack</span>(adj, col, v + <span class="num">1</span>)) <span class="kw">return true</span>;
            col[v] = <span class="num">0</span>;
        }
    }
    <span class="kw">return false</span>;
}`,
js:`<span class="kw">function</span> <span class="fn">isSafe</span>(adj, colors, v, c) {
    <span class="kw">return</span> adj[v].every(u => colors[u] !== c);
}
<span class="kw">function</span> <span class="fn">backtrack</span>(adj, colors, v) {
    <span class="kw">if</span> (v === adj.length) <span class="kw">return true</span>;
    <span class="kw">for</span> (<span class="kw">let</span> c = <span class="num">1</span>; c &lt;= <span class="num">3</span>; c++) {
        <span class="kw">if</span> (<span class="fn">isSafe</span>(adj, colors, v, c)) {
            colors[v] = c;
            <span class="kw">if</span> (<span class="fn">backtrack</span>(adj, colors, v + <span class="num">1</span>)) <span class="kw">return true</span>;
            colors[v] = <span class="num">0</span>;
        }
    }
    <span class="kw">return false</span>;
}`},
brute:{
pseudo:`<span class="kw">function</span> <span class="fn">BruteForce</span>(G):
  <span class="kw">for each</span> assignment ∈ {1,2,3}^|V|:
    valid ← <span class="num">True</span>
    <span class="kw">for each</span> (u,v) ∈ E:
      <span class="kw">if</span> u.color == v.color: valid ← <span class="num">False</span>
    <span class="kw">if</span> valid: <span class="kw">return</span> assignment
  <span class="kw">return</span> <span class="num">None</span>`,
python:`<span class="kw">from</span> itertools <span class="kw">import</span> product

<span class="kw">def</span> <span class="fn">brute_force</span>(n, edges):
    <span class="kw">for</span> assignment <span class="kw">in</span> product(range(<span class="num">1</span>,<span class="num">4</span>), repeat=n):
        <span class="kw">if</span> all(assignment[u] != assignment[v]
               <span class="kw">for</span> u, v <span class="kw">in</span> edges):
            <span class="kw">return</span> list(assignment)
    <span class="kw">return</span> <span class="num">None</span>`,
java:`<span class="kw">static</span> <span class="type">int</span>[] <span class="fn">bruteForce</span>(<span class="type">int</span> n, <span class="type">int</span>[][] edges) {
    <span class="type">int</span> total = (<span class="type">int</span>) Math.pow(<span class="num">3</span>, n);
    <span class="kw">for</span> (<span class="type">int</span> t = <span class="num">0</span>; t &lt; total; t++) {
        <span class="type">int</span>[] c = <span class="kw">new</span> <span class="type">int</span>[n];
        <span class="type">int</span> tmp = t;
        <span class="kw">for</span> (<span class="type">int</span> i = <span class="num">0</span>; i &lt; n; i++) {
            c[i] = tmp % <span class="num">3</span> + <span class="num">1</span>; tmp /= <span class="num">3</span>;
        }
        <span class="type">boolean</span> ok = <span class="num">true</span>;
        <span class="kw">for</span> (<span class="type">int</span>[] e : edges)
            <span class="kw">if</span> (c[e[<span class="num">0</span>]] == c[e[<span class="num">1</span>]]) { ok = <span class="num">false</span>; <span class="kw">break</span>; }
        <span class="kw">if</span> (ok) <span class="kw">return</span> c;
    }
    <span class="kw">return null</span>;
}`,
cpp:`<span class="type">vector</span>&lt;<span class="type">int</span>&gt; <span class="fn">bruteForce</span>(<span class="type">int</span> n, <span class="type">vector</span>&lt;pair&lt;<span class="type">int</span>,<span class="type">int</span>&gt;&gt;&amp; edges) {
    <span class="type">int</span> total = pow(<span class="num">3</span>, n);
    <span class="kw">for</span> (<span class="type">int</span> t = <span class="num">0</span>; t &lt; total; t++) {
        <span class="type">vector</span>&lt;<span class="type">int</span>&gt; c(n);
        <span class="type">int</span> tmp = t;
        <span class="kw">for</span> (<span class="type">int</span> i = <span class="num">0</span>; i &lt; n; i++) {
            c[i] = tmp % <span class="num">3</span> + <span class="num">1</span>; tmp /= <span class="num">3</span>;
        }
        <span class="type">bool</span> ok = <span class="num">true</span>;
        <span class="kw">for</span> (<span class="kw">auto</span>&amp; [u,v] : edges)
            <span class="kw">if</span> (c[u] == c[v]) { ok = <span class="num">false</span>; <span class="kw">break</span>; }
        <span class="kw">if</span> (ok) <span class="kw">return</span> c;
    }
    <span class="kw">return</span> {};
}`,
js:`<span class="kw">function</span> <span class="fn">bruteForce</span>(n, edges) {
    <span class="kw">const</span> total = <span class="num">3</span> ** n;
    <span class="kw">for</span> (<span class="kw">let</span> t = <span class="num">0</span>; t &lt; total; t++) {
        <span class="kw">const</span> c = []; <span class="kw">let</span> tmp = t;
        <span class="kw">for</span> (<span class="kw">let</span> i = <span class="num">0</span>; i &lt; n; i++) {
            c.push(tmp % <span class="num">3</span> + <span class="num">1</span>); tmp = Math.floor(tmp / <span class="num">3</span>);
        }
        <span class="kw">if</span> (edges.every(([u,v]) => c[u] !== c[v]))
            <span class="kw">return</span> c;
    }
    <span class="kw">return null</span>;
}`}
};

function setLang(l,el){curLang=l;document.querySelectorAll('.lang-tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');renderCode()}
function renderCode(){document.getElementById('code-box').innerHTML=CODE[mode2==='compare'?'greedy':mode2][curLang]||''}

/* ===== UTILS ===== */
function toggleCollapse(e){e.classList.toggle('collapsed');e.nextElementSibling.classList.toggle('hidden')}
function spd(){return 1100-parseInt(document.getElementById('speed-slider').value)*100}
function dot(s,t){document.getElementById('status-dot').className='status-dot '+s;document.getElementById('status-text').textContent=t}
function stats(c,o,b,r){document.getElementById('stat-vertices').textContent=G.n;document.getElementById('stat-edges').textContent=G.edges.length;document.getElementById('stat-colors').textContent=new Set(c.filter(x=>x>0)).size||'—';document.getElementById('stat-ops').textContent=o;document.getElementById('stat-backtracks').textContent=b;document.getElementById('stat-result').textContent=r}
function circ(n,cx,cy,r){const p=[];for(let i=0;i<n;i++){const a=2*Math.PI*i/n-Math.PI/2;p.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}return p}
function gpos(p,w,h){const cx=w/2,cy=h/2,r=Math.min(w,h)*.38;if(p.pos){const sx=w/800,sy=h/440;return p.pos.map(([x,y])=>[x*sx,y*sy])}if(p===PRESETS.petersen)return[...circ(5,cx,cy,r),...circ(5,cx,cy,r*.47)];return circ(p.n,cx,cy,r)}
function gposForCompare(w,h){const cx=w/2,cy=h/2,r=Math.min(w,h)*.36;const key=document.getElementById('preset-select').value;const p=PRESETS[key];if(p&&p.pos){const sx=w/800,sy=h/440;return p.pos.map(([x,y])=>[x*sx,y*sy])}if(p===PRESETS.petersen)return[...circ(5,cx,cy,r),...circ(5,cx,cy,r*.47)];return circ(G.n,cx,cy,r)}
function buildG(p,w=800,h=440){G.n=p.n;G.edges=p.edges.map(e=>[...e]);G.adj=Array.from({length:p.n},()=>[]);for(const[u,v]of p.edges){G.adj[u].push(v);G.adj[v].push(u)}G.pos=gpos(p,w,h);vC=new Array(G.n).fill(0);stats(vC,0,0,'—')}
function draw(id,col,cv=-1,cf=[]){const s=document.getElementById(id);if(!s)return;let h='';for(const[u,v]of G.edges){const ic=cf.some(([a,b])=>(a===u&&b===v)||(a===v&&b===u));h+=`<line x1="${G.pos[u][0]}" y1="${G.pos[u][1]}" x2="${G.pos[v][0]}" y2="${G.pos[v][1]}" stroke="${ic?'#ff6b6b':'#3a3c52'}" stroke-width="${ic?3:1.5}" stroke-opacity=".7"/>`}for(let i=0;i<G.n;i++){const[x,y]=G.pos[i],c=col[i]||0,f=COL[c],ic=i===cv;h+=`<circle cx="${x}" cy="${y}" r="${ic?22:18}" fill="${f}" stroke="${ic?'#fff':'rgba(255,255,255,.2)'}" stroke-width="${ic?3:1.5}" style="transition:fill .3s,r .3s"/>`;h+=`<text x="${x}" y="${y+5}" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="Segoe UI,sans-serif">${i}</text>`}s.innerHTML=h}

/* ===== ALGOS ===== */
function vord(){const t=document.getElementById('vertex-order').value;let o=Array.from({length:G.n},(_,i)=>i);if(t==='random'){for(let i=o.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[o[i],o[j]]=[o[j],o[i]]}}else if(t==='degree-desc')o.sort((a,b)=>G.adj[b].length-G.adj[a].length);else if(t==='degree-asc')o.sort((a,b)=>G.adj[a].length-G.adj[b].length);return o}
function genGreedy(){const s=[],c=new Array(G.n).fill(0),ord=vord();let o=0;for(const v of ord){const nb=new Set;for(const u of G.adj[v])if(c[u]>0)nb.add(c[u]);o++;let cl=1;while(nb.has(cl))cl++;c[v]=cl;o++;const beg=userMode==='beginner';s.push({c:[...c],v,l:3,o,b:0,x:beg?`Dot ${v}: neighbors have {${[...nb].map(x=>CN[x]).join(',')||'no color'}}. Giving it ${CN[cl]}!`:`V${v}: neighbors{${[...nb].map(x=>CN[x]).join(',')||'ø'}} → ${CN[cl]}`})}const u=new Set(c.filter(x=>x>0)).size;const beg=userMode==='beginner';s.push({c:[...c],v:-1,l:4,o,b:0,x:beg?`All done! Used ${u} color${u!==1?'s':''}. ${u<=3?'✅ Success with 3 colors!':'❌ Needed more than 3 — greedy wasn\'t good enough!'}`:`Done! ${u} colors. ${u<=3?'✓':'✗ >3'}`});return s}
function genBT(){const s=[],c=new Array(G.n).fill(0);let o=0,b=0;const beg=userMode==='beginner';function safe(v,cl){for(const u of G.adj[v])if(c[u]===cl)return false;return true}function solve(v){if(v===G.n){s.push({c:[...c],v:-1,l:1,o,b,x:beg?'🎉 Every dot is colored! We found a valid 3-coloring!':'All colored! ✓'});return true}for(let cl=1;cl<=3;cl++){o++;if(safe(v,cl)){c[v]=cl;o++;s.push({c:[...c],v,l:4,o,b,x:beg?`Dot ${v}: Let's try ${CN[cl]}... it works with all neighbors! ✅`:`V${v}: ${CN[cl]} safe → assign`});if(solve(v+1))return true;c[v]=0;b++;s.push({c:[...c],v,l:6,o,b,x:beg?`Dot ${v}: ${CN[cl]} caused problems later. Undo it and try another color! ↩️`:`V${v}: undo ${CN[cl]} (bt#${b})`})}else s.push({c:[...c],v,l:3,o,b,x:beg?`Dot ${v}: Can't use ${CN[cl]} — a neighbor already has it! ❌`:`V${v}: ${CN[cl]} conflict`})}return false}if(!solve(0))s.push({c:[...c],v:-1,l:7,o,b,x:beg?'😢 Tried everything — this graph cannot be colored with just 3 colors!':'No 3-coloring. ✗'});return s}
function genBF(){const s=[],n=G.n,tot=Math.pow(3,n),cap=Math.min(tot,400);let o=0;const beg=userMode==='beginner';for(let t=0;t<tot&&s.length<cap;t++){const c=new Array(n);let tmp=t;for(let i=0;i<n;i++){c[i]=(tmp%3)+1;tmp=Math.floor(tmp/3)}o++;let ok=true;const cf=[];for(const[u,v]of G.edges){o++;if(c[u]===c[v]){ok=false;cf.push([u,v])}}if(t%(Math.max(1,Math.floor(tot/40)))===0||ok)s.push({c:[...c],v:-1,l:ok?5:4,o,b:0,cf,x:ok?(beg?`Combo #${t+1}: This works! 🎉`:`#${t+1}: Valid! ✓`):(beg?`Combo #${t+1} of ${tot}: Nope, ${cf.length} clash${cf.length>1?'es':''}. Next! 🔄`:`#${t+1}/${tot}: ${cf.length} conflicts ✗`)});if(ok){s.push({c:[...c],v:-1,l:5,o,b:0,cf:[],x:beg?`Found it after trying ${t+1} out of ${tot} combos! ✅`:`Found after ${t+1}/${tot}. ✓`});return s}}s.push({c:new Array(n).fill(0),v:-1,l:6,o,b:0,cf:[],x:beg?'Tried everything. No 3-coloring possible! 😞':'No 3-coloring. ✗'});return s}

/* ===== CONTROLS ===== */
function setMode(m){mode2=m;document.querySelectorAll('#mode-tabs .tab').forEach(t=>t.classList.toggle('active',t.dataset.mode===m));document.getElementById('compare-panel').style.display=m==='compare'?'block':'none';document.getElementById('main-viz-panel').style.display=m==='compare'?'none':'block';document.getElementById('order-group').style.display=(m==='greedy'||m==='compare')?'block':'none';resetAlgo();renderCode()}
function loadPreset(k){document.getElementById('custom-input').style.display=k==='custom'?'block':'none';if(k==='custom')return;buildG(PRESETS[k]);draw('graph-svg',vC);const sp=G.pos;G.pos=gposForCompare(400,300);draw('graph-svg-greedy',vC);draw('graph-svg-bt',vC);G.pos=sp;resetAlgo()}
function buildCustomGraph(){const inp=document.getElementById('custom-edges').value.trim();if(!inp)return;const ep=inp.split(',').map(s=>s.trim().split('-').map(Number));const ns=new Set;ep.forEach(([u,v])=>{ns.add(u);ns.add(v)});buildG({n:Math.max(...ns)+1,edges:ep,pos:null});draw('graph-svg',vC);resetAlgo()}
function resetAlgo(){pause();cur=0;vC=new Array(G.n).fill(0);if(mode2==='compare'){steps=[];const sp=G.pos;G.pos=gposForCompare(400,300);draw('graph-svg-greedy',vC);draw('graph-svg-bt',vC);G.pos=sp;['cmp-greedy-colors','cmp-greedy-ops','cmp-bt-colors','cmp-bt-ops'].forEach(id=>document.getElementById(id).textContent='—')}else{steps=(mode2==='greedy'?genGreedy:mode2==='backtrack'?genBT:genBF)();draw('graph-svg',vC)}document.getElementById('step-counter').textContent='0';document.getElementById('step-total').textContent=steps.length;dot('idle','Ready');stats(vC,0,0,'—');document.getElementById('explain-box').textContent='Press Play or Step to begin.';renderCode()}
function step(){if(mode2==='compare'){runCmp();return}if(!steps.length)return;if(cur>=steps.length){dot('done','Complete');return}const s=steps[cur];draw('graph-svg',s.c,s.v,s.cf||[]);vC=[...s.c];document.getElementById('explain-box').textContent=s.x;stats(s.c,s.o,s.b,cur===steps.length-1?(s.x.includes('✓')||s.x.includes('✅')||s.x.includes('🎉')?'✓ Found':'✗ None'):'Running…');cur++;document.getElementById('step-counter').textContent=cur;document.getElementById('step-total').textContent=steps.length;dot(cur>=steps.length?'done':'running',cur>=steps.length?'Complete':`${cur}/${steps.length}`)}
function play(){if(mode2==='compare'){runCmp();return}if(cur>=steps.length&&steps.length>0)resetAlgo();playing=true;dot('running','Playing…');(function t(){if(!playing||cur>=steps.length){playing=false;if(cur>=steps.length)dot('done','Complete');return}step();timer=setTimeout(t,spd())})()}
function pause(){playing=false;clearTimeout(timer);if(cur>0&&cur<steps.length)dot('idle','Paused')}
function runCmp(){const gc=new Array(G.n).fill(0),ord=vord();let go=0;for(const v of ord){const nb=new Set;for(const u of G.adj[v])if(gc[u]>0)nb.add(gc[u]);go++;let c=1;while(nb.has(c))c++;gc[v]=c;go++}const bc=new Array(G.n).fill(0);let bo=0,bf=false;function safe(v,c){for(const u of G.adj[v])if(bc[u]===c)return false;return true}function solve(v){if(v===G.n){bf=true;return true}for(let c=1;c<=3;c++){bo++;if(safe(v,c)){bc[v]=c;bo++;if(solve(v+1))return true;bc[v]=0}}return false}solve(0);const sp=G.pos;G.pos=gposForCompare(400,300);draw('graph-svg-greedy',gc);draw('graph-svg-bt',bf?bc:new Array(G.n).fill(0));G.pos=sp;const gu=new Set(gc.filter(x=>x>0)).size,bu=bf?new Set(bc.filter(x=>x>0)).size:0;document.getElementById('cmp-greedy-colors').textContent=gu;document.getElementById('cmp-greedy-ops').textContent=go;document.getElementById('cmp-bt-colors').textContent=bf?bu:'N/A';document.getElementById('cmp-bt-ops').textContent=bo;dot('done','Done');document.getElementById('explain-box').textContent=`Greedy: ${gu} colors, ${go} ops | Backtrack: ${bf?bu+' colors':'none'}, ${bo} ops${gu>3&&bf?' ⚠ Greedy used >3!':''}`}

/* ===== CHART ===== */
let chartM='ops';function setChart(m,el){chartM=m;document.querySelectorAll('.growth-tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');drawChart()}
function drawChart(){const cv=document.getElementById('growth-chart'),ctx=cv.getContext('2d');const W=cv.width=cv.parentElement.clientWidth-32,H=cv.height=300;ctx.clearRect(0,0,W,H);ctx.fillStyle='#1e2030';ctx.fillRect(0,0,W,H);const pL=62,pR=25,pT=35,pB=42,pW=W-pL-pR,pH=H-pT-pB;const ns=[2,3,4,5,6,7,8,9,10,12,15];
if(chartM==='bar'){const tgt=[5,8,10,12];const bW=pW/tgt.length;for(let i=0;i<tgt.length;i++){const n=tgt[i],vals=[2*n,Math.pow(3,Math.floor(n*.6)),Math.pow(3,n)];const logM=Math.log10(Math.max(...vals)+1);const cols=['#51cf66','#339af0','#ff6b6b'];const bw=(bW*.7)/3;for(let j=0;j<3;j++){const bh=Math.max(4,(Math.log10(vals[j]+1)/logM)*pH);const x=pL+i*bW+bW*.15+j*bw,y=pT+pH-bh;ctx.fillStyle=cols[j];ctx.globalAlpha=.85;ctx.fillRect(x,y,bw-3,bh);ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.font='bold 11px Segoe UI';ctx.textAlign='center';const lbl=vals[j]>=1e6?(vals[j]/1e6).toFixed(1)+'M':vals[j]>=1e4?(vals[j]/1e3).toFixed(1)+'K':vals[j].toLocaleString();ctx.fillText(lbl,x+(bw-3)/2,y-6)}ctx.fillStyle='#e0e0ea';ctx.font='bold 12px Segoe UI';ctx.textAlign='center';ctx.fillText('n = '+tgt[i],pL+i*bW+bW/2,H-10)}return}
const gd=ns.map(n=>2*n),bd=ns.map(n=>Math.pow(3,Math.floor(n*.6))),brd=ns.map(n=>Math.pow(3,n)),vd=ns.map(n=>n*2);const mx=Math.max(...brd),logMx=Math.log10(mx);function toX(i){return pL+(i/(ns.length-1))*pW}function toY(v){return v<=0?pT+pH:pT+pH-(Math.log10(v)/logMx)*pH}ctx.strokeStyle='#2a2c3e';ctx.lineWidth=.5;for(let p=0;p<=Math.ceil(logMx);p++){const y=toY(Math.pow(10,p));ctx.beginPath();ctx.moveTo(pL,y);ctx.lineTo(W-pR,y);ctx.stroke();ctx.fillStyle='#a0a0b8';ctx.font='bold 10px Segoe UI';ctx.textAlign='right';ctx.fillText('10^'+p,pL-6,y+4)}
function ln(a,c,d=[]){ctx.strokeStyle=c;ctx.lineWidth=2.5;ctx.setLineDash(d);ctx.beginPath();ns.forEach((_,i)=>{const x=toX(i),y=toY(a[i]);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)});ctx.stroke();ctx.setLineDash([])}
ln(vd,'#fcc419',[5,3]);ln(gd,'#51cf66');ln(bd,'#339af0',[7,4]);ln(brd,'#ff6b6b');
[gd,bd,brd,vd].forEach((a,idx)=>{['#51cf66','#339af0','#ff6b6b','#fcc419'].forEach((c,ci)=>{if(idx===ci)ns.forEach((_,i)=>{ctx.beginPath();ctx.arc(toX(i),toY(a[i]),4,0,Math.PI*2);ctx.fillStyle=c;ctx.fill()})})});
ctx.fillStyle='#a0a0b8';ctx.font='bold 10px Segoe UI';ctx.textAlign='center';ns.forEach((n,i)=>ctx.fillText('n='+n,toX(i),H-10))}

/* ===== QUIZ ===== */
const QB=[
{t:'mcq',q:'What does NP mean for a problem?',o:['Solvable in polynomial time','A solution can be verified quickly','Cannot be solved','Requires exponential space'],a:[1],e:'NP means we can CHECK an answer quickly (polynomial time).'},
{t:'mcq',q:'How many colors does K₄ (4 fully-connected dots) need?',o:['2','3','4','5'],a:[2],e:'4 dots all connected to each other → need 4 different colors.'},
{t:'mcq',q:'Which problem reduces to 3-Coloring to prove it\'s hard?',o:['2-SAT','Hamiltonian Cycle','3-SAT','Vertex Cover'],a:[2],e:'We transform 3-SAT into 3-Coloring to prove hardness.'},
{t:'mcq',q:'How fast is greedy coloring?',o:['O(V²)','O(V + E)','O(3^V)','O(V log V)'],a:[1],e:'Greedy visits each vertex once, checking neighbors → O(V+E).'},
{t:'mcq',q:'Why might greedy use >3 colors on a 3-colorable graph?',o:['Always uses exactly 3','Depends on vertex ordering','Graph too large','Only works on bipartite'],a:[1],e:'The ORDER you process vertices determines greedy\'s result.'},
{t:'mcq',q:'Worst-case time of backtracking?',o:['O(V+E)','O(V²)','O(3^V)','O(2^V)'],a:[2],e:'Tries up to 3 colors per vertex → O(3^V).'},
{t:'mcq',q:'The truth-setting gadget is:',o:['Single vertex','Pair of vertices','Triangle (T, F, B)','Complete graph K₅'],a:[2],e:'A triangle forcing 3 distinct colors.'},
{t:'mcq',q:'How many colors does any tree need?',o:['1','2','3','Depends'],a:[1],e:'Trees are bipartite → always 2-colorable.'},
{t:'mcq',q:'A 2-colorable graph is:',o:['Complete','Bipartite','Has odd cycle','NP-hard'],a:[1],e:'2-colorable = bipartite = no odd cycles.'},
{t:'mcq',q:'Brute force checks how many combos for 8 vertices?',o:['24','256','6,561','16 million'],a:[2],e:'3^8 = 6,561 combinations.'},
{t:'mcq',q:'Best vertex ordering for greedy?',o:['Random','Natural','Smallest degree first','Largest degree first'],a:[3],e:'Coloring high-degree vertices first reduces conflicts.'},
{t:'mcq',q:'Chromatic number of C₅ (5-cycle)?',o:['1','2','3','4'],a:[2],e:'Odd cycles need 3 colors.'},
{t:'mcq',q:'Which graph is NOT 3-colorable?',o:['Petersen','C₅','K₄','K₃,₃'],a:[2],e:'K₄ needs 4 colors.'},
{t:'mcq',q:'What makes backtracking faster than brute force?',o:['Fewer colors','Prunes bad branches early','Polynomial time','Randomization'],a:[1],e:'Backtracking stops early when it detects conflicts.'},
{t:'mcq',q:'Greedy uses at most how many colors?',o:['3','χ(G)','Δ(G)+1','V'],a:[2],e:'At most max-degree + 1 colors.'},
{t:'mcq',q:'Register allocation uses coloring on what graph?',o:['Call graph','Control flow','Interference graph','Dependency graph'],a:[2],e:'The interference graph connects variables alive at the same time.'},
{t:'mcq',q:'A graph with no edges needs how many colors?',o:['0','1','2','3'],a:[1],e:'No connections → one color is enough.'},
{t:'mcq',q:'Polynomial-time reduction means:',o:['O(1)','O(log n)','O(n^k) for some k','O(2^n)'],a:[2],e:'Polynomial = O(n^k) for constant k.'},
{t:'multi',q:'Applications of graph coloring? (Select ALL)',o:['Register allocation','Shortest path','Exam scheduling','Frequency assignment','Sorting'],a:[0,2,3],e:'Register allocation, scheduling, and frequency assignment use coloring.'},
{t:'multi',q:'True about NP-complete? (Select ALL)',o:['In NP','NP-hard','Every NP reduces to them','Always poly-time','Poly solution → P=NP'],a:[0,1,2,4],e:'NP-complete = in NP + NP-hard. Solving one in poly-time proves P=NP.'},
{t:'multi',q:'Reduction components? (Select ALL)',o:['Truth-setting gadget','Variable gadgets','Clause gadgets','Hamiltonian gadgets','Shortest path gadgets'],a:[0,1,2],e:'Uses truth-setting, variable, and clause gadgets.'},
{t:'multi',q:'What affects greedy\'s color count? (Select ALL)',o:['Vertex ordering','Edge count','Chromatic number','Graph direction','Starting vertex'],a:[0,1,2,4],e:'All except direction matter. Coloring ignores edge direction.'},
{t:'multi',q:'True about backtracking? (Select ALL)',o:['Prunes conflicts','Guarantees solution','Polynomial worst-case','Proves impossibility','Depth = V'],a:[0,1,3,4],e:'Prunes, exact, proves, depth=V. NOT polynomial.'},
{t:'multi',q:'Which are bipartite? (Select ALL)',o:['K₃,₃','C₄','C₅','Any tree','K₃'],a:[0,1,3],e:'K₃,₃, even cycles, trees are bipartite. Odd cycles and K₃ are not.'},
{t:'multi',q:'Valid NP-completeness proof needs? (Select ALL)',o:['Forward direction','Backward direction','Poly construction','Problem ∈ NP','≤2 colors'],a:[0,1,2,3],e:'Need: NP membership + both directions + polynomial construction.'},
{t:'multi',q:'Greedy advantages over backtracking? (Select ALL)',o:['Always optimal','Polynomial time','Simple','Scales to large graphs','≤Δ+1 colors'],a:[1,2,3,4],e:'Fast, simple, scalable, bounded. NOT optimal.'},
{t:'multi',q:'True about Petersen graph? (Select ALL)',o:['10 vertices','3-regular','χ = 3','Bipartite','15 edges'],a:[0,1,2,4],e:'10V, 15E, 3-regular, χ=3. NOT bipartite.'},
{t:'multi',q:'Variable gadget properties? (Select ALL)',o:['xᵢ ↔ ¬xᵢ connected','Both to B','Different colors','Both can be Base','One True, one False'],a:[0,1,2,4],e:'Connected, both to B, differ, one True one False.'}
];
let quizQs=[],quizAns={};
function shuf(a){const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]]}return r}
function initQuiz(){const m=shuf(QB.filter(q=>q.t==='multi')),mc=shuf(QB.filter(q=>q.t==='mcq'));quizQs=shuf([...m.slice(0,6),...mc.slice(0,9)]).slice(0,15).map(q=>{const idx=Array.from({length:q.o.length},(_,i)=>i),si=shuf(idx);return{...q,o:si.map(i=>q.o[i]),a:q.a.map(a=>si.indexOf(a))}});quizAns={};renderQuiz()}
function renderQuiz(){const c=document.getElementById('quiz-container');c.innerHTML=quizQs.map((q,qi)=>{const mu=q.t==='multi',inp=mu?'checkbox':'radio';return`<div class="quiz-q" id="qq-${qi}"><div class="quiz-q-num">Question ${qi+1}/15 <span class="quiz-q-type ${mu?'multi':'mcq'}">${mu?'Select Multiple':'Single Answer'}</span></div><div class="quiz-q-text">${q.q}</div>${q.o.map((o,oi)=>`<label class="quiz-option" id="qo-${qi}-${oi}" onclick="selOpt(${qi},${oi},${mu})"><input type="${inp}" name="q${qi}" style="pointer-events:none"> ${o}</label>`).join('')}<div class="quiz-feedback" id="qf-${qi}"></div></div>`}).join('');document.getElementById('quiz-progress-fill').style.width='0%';document.getElementById('quiz-score-display').textContent='Score: 0 / 15';document.getElementById('quiz-final-result').style.display='none'}
function selOpt(qi,oi,mu){if(quizAns[qi])return;if(!mu)quizQs[qi].o.forEach((_,j)=>document.getElementById(`qo-${qi}-${j}`).classList.remove('selected'));document.getElementById(`qo-${qi}-${oi}`).classList.toggle('selected')}
function submitQuiz(){let cor=0,ans=0;const wrongTopics=[];quizQs.forEach((q,qi)=>{const sel=[];q.o.forEach((_,oi)=>{if(document.getElementById(`qo-${qi}-${oi}`).classList.contains('selected'))sel.push(oi)});if(!sel.length)return;ans++;quizAns[qi]=1;const ok=sel.length===q.a.length&&sel.every(s=>q.a.includes(s));if(ok)cor++;else wrongTopics.push(q.q);document.getElementById(`qf-${qi}`).className='quiz-feedback show '+(ok?'correct-fb':'wrong-fb');document.getElementById(`qf-${qi}`).textContent=(ok?'✓ Correct! ':'✗ Incorrect. ')+q.e;document.getElementById(`qq-${qi}`).classList.add(ok?'correct':'wrong');q.o.forEach((_,oi)=>{const el=document.getElementById(`qo-${qi}-${oi}`);el.classList.add('locked');if(q.a.includes(oi))el.classList.add('correct-answer');else if(sel.includes(oi))el.classList.add('wrong-answer');if(q.a.includes(oi)&&!sel.includes(oi))el.classList.add('missed-answer');el.classList.remove('selected')})});document.getElementById('quiz-progress-fill').style.width=(ans/15*100)+'%';document.getElementById('quiz-score-display').textContent=`Score: ${cor} / 15`;
if(ans){const p=Math.round(cor/15*100);const r=document.getElementById('quiz-final-result');r.style.display='block';let html='';
if(p>=90){html=`<div class="highlight-box" style="border-color:var(--green)"><strong>🎉 Excellent! ${cor}/15 (${p}%)</strong><br><span class="expert-only">Outstanding understanding of graph coloring theory, NP-completeness, and algorithm paradigms. You are well-prepared for the Q&amp;A session.</span><span class="beginner-only">Amazing job! You really understand how graph coloring works. You could explain this to a friend now! 🌟</span></div>`}
else if(p>=70){html=`<div class="highlight-box" style="border-color:var(--green)"><strong>👍 Good! ${cor}/15 (${p}%)</strong><br><span class="expert-only">Solid grasp of core concepts. Review the questions you missed — focus on the reduction proof details and complexity analysis.</span><span class="beginner-only">Nice work! You understand most of the ideas. Scroll back up and re-read the sections related to the questions you got wrong, then try the quiz again! 📖</span></div>`}
else if(p>=50){html=`<div class="highlight-box" style="border-color:var(--yellow)"><strong>📚 Keep Studying! ${cor}/15 (${p}%)</strong><br><span class="expert-only"><strong>Areas to review:</strong> You missed ${15-cor} questions. Focus on: (1) Re-read the NP-completeness proof — understand each gadget's role. (2) Run the Greedy and Backtracking algorithms on different graphs using the tool. (3) Study the Algorithm Comparison table to understand time complexities. (4) Review the CLO-3 section on design paradigms.<br><strong>Practice tip:</strong> Use the tool's Step mode to trace through each algorithm one step at a time on small graphs (Triangle, C₅).</span><span class="beginner-only"><strong>You're getting there!</strong> You missed ${15-cor} questions. Here's how to improve:<br>🔹 Go back to the <strong>"Welcome"</strong> section and re-read the explanations<br>🔹 Use the <strong>Play button</strong> above to watch each algorithm work — pay attention to what changes at each step<br>🔹 Try different graphs (Triangle is simplest, then Wheel, then Petersen)<br>🔹 Compare Greedy vs Backtracking using the Compare tab — notice the difference!<br>🔹 Re-read each wrong answer's explanation (the green/red text below each question)<br>Then click <strong>"New Quiz"</strong> to try again! 💪</span></div>`}
else{html=`<div class="highlight-box" style="border-color:var(--red)"><strong>💪 Don't Give Up! ${cor}/15 (${p}%)</strong><br><span class="expert-only"><strong>You need significant review.</strong> You missed ${15-cor} questions. Recommended study plan:<br>1. <strong>Fundamentals:</strong> Re-read what NP, NP-hard, and NP-complete mean. Understand certificates and verifiers.<br>2. <strong>Algorithms:</strong> Step through Greedy, Backtracking, and Brute Force on the Triangle graph (3 vertices) using the Step button. Watch how each one works differently.<br>3. <strong>Reduction:</strong> Study the 3-SAT → 3-Coloring reduction. Understand: truth-setting gadget (triangle), variable gadgets (xᵢ/¬xᵢ), clause gadgets (OR-gadget).<br>4. <strong>Complexity:</strong> Memorize: Greedy = O(V+E), Backtracking = O(3^V), Brute Force = O(3^V·E).<br>5. <strong>Practice:</strong> Run each algorithm on all preset graphs. Compare results. Then retake this quiz.</span><span class="beginner-only"><strong>That's okay — everyone starts somewhere!</strong> You missed ${15-cor} questions. Let's fix that step by step:<br>🔹 <strong>Step 1:</strong> Go ALL the way back to the top and read the <strong>"Welcome"</strong> section carefully. Watch the video linked there!<br>🔹 <strong>Step 2:</strong> Select the <strong>Triangle</strong> graph (simplest one — only 3 dots). Press <strong>Play</strong> and watch how Greedy colors it. Then switch to Backtracking and watch again. See the difference?<br>🔹 <strong>Step 3:</strong> Read the section <strong>"How Each Method Works"</strong> — it explains each algorithm with real-life examples<br>🔹 <strong>Step 4:</strong> Read the section <strong>"Why Is This Problem So Hard?"</strong> — this is the big idea<br>🔹 <strong>Step 5:</strong> Read each wrong answer's feedback (green/red boxes below each question) — they explain why<br>🔹 <strong>Step 6:</strong> Try the <strong>Compare</strong> tab to see fast vs correct side-by-side<br>🔹 <strong>Step 7:</strong> Click <strong>"New Quiz"</strong> and try again — you WILL do better! 🚀<br><br>Remember: the goal isn't to memorize — it's to <em>understand the ideas</em>. Take your time!</span></div>`}
if(wrongTopics.length>0&&wrongTopics.length<=8){html+=`<div class="proof-step" style="margin-top:.75rem;border-color:var(--orange)"><h4 style="color:var(--orange)">Questions You Got Wrong:</h4><ul style="font-size:.82rem">${wrongTopics.map(t=>`<li>${t}</li>`).join('')}</ul></div>`}
r.innerHTML=html}}
function resetQuiz(){initQuiz()}

/* ===== BEGINNER MINI DEMO ===== */
function tryDemo(type){
  const result=document.getElementById('demo-result');
  if(type==='easy'){
    result.style.color='var(--green)';
    result.innerHTML='🎉 <strong>Yes! It works!</strong> Try: 🔴 Red, 🟢 Green, 🔵 Blue — one color for each of the 3 countries. Every border has different colors on each side! ✅';
  } else {
    result.style.color='var(--red)';
    result.innerHTML='😮 <strong>Surprise!</strong> You CAN\'T do it with 3 colors! With 4 countries all touching each other, you need 4 different colors. This is called K₄ — it\'s impossible with just 3 crayons! 🖍️';
  }
}


function init(){loadPreset('triangle');renderCode();drawChart();dot('idle','Ready');window.addEventListener('resize',drawChart);initQuiz()}
