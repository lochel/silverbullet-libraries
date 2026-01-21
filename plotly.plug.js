function u(t){let e=atob(t),n=e.length,o=new Uint8Array(n);for(let r=0;r<n;r++)o[r]=e.charCodeAt(r);return o}function l(t){typeof t=="string"&&(t=new TextEncoder().encode(t));let e="",n=t.byteLength;for(let o=0;o<n;o++)e+=String.fromCharCode(t[o]);return btoa(e)}var A=new Uint8Array(16);var y=class{constructor(e="",n=1e3){this.prefix=e;this.maxCaptureSize=n;this.prefix=e,this.originalConsole={log:console.log.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console),debug:console.debug.bind(console)},this.patchConsole()}originalConsole;logBuffer=[];patchConsole(){let e=n=>(...o)=>{let r=this.prefix?[this.prefix,...o]:o;this.originalConsole[n](...r),this.captureLog(n,o)};console.log=e("log"),console.info=e("info"),console.warn=e("warn"),console.error=e("error"),console.debug=e("debug")}captureLog(e,n){let o={level:e,timestamp:Date.now(),message:n.map(r=>{if(typeof r=="string")return r;try{return JSON.stringify(r)}catch{return String(r)}}).join(" ")};this.logBuffer.push(o),this.logBuffer.length>this.maxCaptureSize&&this.logBuffer.shift()}async postToServer(e,n){if(this.logBuffer.length>0){let r=[...this.logBuffer];this.logBuffer=[];try{if(!(await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r.map(s=>({...s,source:n})))})).ok)throw new Error("Failed to post logs to server")}catch(a){console.warn("Could not post logs to server",a.message),this.logBuffer.unshift(...r)}}}},g;function f(t=""){return g=new y(t),g}var i=t=>{throw new Error("Not initialized yet")},d=typeof window>"u"&&typeof globalThis.WebSocketPair>"u";typeof Deno>"u"&&(self.Deno={args:[],build:{arch:"x86_64"},env:{get(){}}});var p=new Map,c=0;d&&(globalThis.syscall=async(t,...e)=>await new Promise((n,o)=>{c++,p.set(c,{resolve:n,reject:o}),i({type:"sys",id:c,name:t,args:e})}));function m(t,e,n){d&&(i=n,self.addEventListener("message",o=>{(async()=>{let r=o.data;switch(r.type){case"inv":{let a=t[r.name];if(!a)throw new Error(`Function not loaded: ${r.name}`);try{let s=await Promise.resolve(a(...r.args||[]));i({type:"invr",id:r.id,result:s})}catch(s){console.error("An exception was thrown as a result of invoking function",r.name,"error:",s.message),i({type:"invr",id:r.id,error:s.message})}}break;case"sysr":{let a=r.id,s=p.get(a);if(!s)throw Error("Invalid request id");p.delete(a),r.error?s.reject(new Error(r.error)):s.resolve(r.result)}break}})().catch(console.error)}),i({type:"manifest",manifest:e}),f(`[${e.name} plug]`))}async function x(t,e){if(typeof t!="string"){let n=new Uint8Array(await t.arrayBuffer()),o=n.length>0?l(n):void 0;e={method:t.method,headers:Object.fromEntries(t.headers.entries()),base64Body:o},t=t.url}return syscall("sandboxFetch.fetch",t,e)}globalThis.nativeFetch=globalThis.fetch;function C(){globalThis.fetch=async function(t,e){let n=e&&e.body?l(new Uint8Array(await new Response(e.body).arrayBuffer())):void 0,o=await x(t,e&&{method:e.method,headers:e.headers,base64Body:n});return new Response(o.base64Body?u(o.base64Body):null,{status:o.status,headers:o.headers})}}d&&C();async function h(t,e){let n=t?t.trim():"";return{html:`
      <style>
        :host, html, body { display:block; padding:0; margin:0 }
        #myChart { width:100%; height:320px; }
      </style>
      <div id="myChart"></div>
    `,script:`
      (async () => {
        await loadJsByUrl('https://cdn.plot.ly/plotly-latest.min.js');

        const queryText = ${JSON.stringify(n)};

        function showError(msg) {
          const el = document.getElementById('myChart');
          if (!el) return;
          el.innerHTML = '';
          const wrapper = document.createElement('div');
          wrapper.style.display = 'flex';
          wrapper.style.alignItems = 'center';
          wrapper.style.justifyContent = 'center';
          wrapper.style.height = '320px';
          wrapper.style.padding = '12px';
          wrapper.style.boxSizing = 'border-box';
          wrapper.style.color = '#f87171';
          wrapper.style.background = 'transparent';
          wrapper.style.whiteSpace = 'pre-wrap';
          wrapper.textContent = 'Error: ' + msg;
          el.appendChild(wrapper);
        }

        try {
          // Evaluate the widget body as a Lua expression.
          // Expectation: the expression returns either
          //  - an array of {x,y} rows (legacy), or
          //  - a table { title=..., data=... } where data is an array of {x,y}.
          let rows = [];
          let widgetTitle = null;
          let ymin = null;
          let ymax = null;
          if (!queryText || typeof globalThis.syscall !== 'function') {
            throw new Error('No query/body provided or syscalls not available');
          }

          const result = await globalThis.syscall('lua.evalExpression', queryText);
          if (!result) {
            throw new Error('Lua expression returned no result');
          }

          if (Array.isArray(result)) {
            rows = result;
          } else if (typeof result === 'object') {
            if (result.title) widgetTitle = result.title;
            if (result.ymin) ymin = result.ymin;
            if (result.ymax) ymax = result.ymax;
            if (Array.isArray(result.data)) rows = result.data;
            else throw new Error('Lua table must contain a data array');
          } else {
            throw new Error('Unexpected result from lua.evalExpression');
          }

          const xs = Array.isArray(rows) ? rows.map((r) => (r && r.x != null ? r.x : null)) : [];
          const ys = Array.isArray(rows) ? rows.map((r) => (r && typeof r.y === 'number' ? r.y : null)) : [];

          if (ymin == null)
            ymin = Math.min(...ys.filter((y) => typeof y === 'number'));
          if (ymax == null)
            ymax = Math.max(...ys.filter((y) => typeof y === 'number'));

          if (xs.length === 0 || ys.length === 0 || xs.length !== ys.length) {
            throw new Error('Data must be a non-empty array of {x,y} points');
          }

          const trace = {
            x: xs,
            y: ys,
            mode: 'lines+markers',
            fill: 'tozeroy',
            line: { color: '#3b82f6' },
            name: widgetTitle || undefined,
          };

          const topMargin = widgetTitle ? 80 : 20;

          const layout = {
            template: 'plotly_dark',
            margin: { t: topMargin, b: 40, l: 40, r: 20 },
            autosize: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#e6eef3' },
            yaxis: { range: [ymin, ymax] },
            title: widgetTitle
              ? {
                  text: widgetTitle,
                  font: { size: 16 },
                  x: 0.5,
                  xanchor: 'center',
                  pad: { t: 5, b: 0 },
                }
              : undefined,
            showlegend: false,
          };

          Plotly.newPlot(
            document.getElementById('myChart'),
            [trace],
            layout,
            { responsive: true, displayModeBar: false, displaylogo: true }
          );
        } catch (e) {
          console.error('Widget error', e);
          showError(e && e.message ? e.message : String(e));
        }
      })().catch(console.error);
    `}}var w={plotlyCodeWidget:h},b={name:"plotly",functions:{plotlyCodeWidget:{path:"plotly.ts:plotly_widget",codeWidget:"plotly"}},assets:{}},M={manifest:b,functionMapping:w};m(w,b,self.postMessage);export{M as plug};
//# sourceMappingURL=plotly.plug.js.map
