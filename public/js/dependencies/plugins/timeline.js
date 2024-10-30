!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):((t="undefined"!=typeof globalThis?globalThis:t||self).WaveSurfer=t.WaveSurfer||{},t.WaveSurfer.Timeline=e())}(this,(function(){"use strict";class t{constructor(){this.listeners={}}on(t,e,i){if(this.listeners[t]||(this.listeners[t]=new Set),this.listeners[t].add(e),null==i?void 0:i.once){const i=()=>{this.un(t,i),this.un(t,e)};return this.on(t,i),i}return()=>this.un(t,e)}un(t,e){var i;null===(i=this.listeners[t])||void 0===i||i.delete(e)}once(t,e){return this.on(t,e,{once:!0})}unAll(){this.listeners={}}emit(t,...e){this.listeners[t]&&this.listeners[t].forEach((t=>t(...e)))}}class e extends t{constructor(t){super(),this.subscriptions=[],this.options=t}onInit(){}_init(t){this.wavesurfer=t,this.onInit()}destroy(){this.emit("destroy"),this.subscriptions.forEach((t=>t()))}}function i(t,e){const n=e.xmlns?document.createElementNS(e.xmlns,t):document.createElement(t);for(const[t,s]of Object.entries(e))if("children"===t)for(const[t,s]of Object.entries(e))"string"==typeof s?n.appendChild(document.createTextNode(s)):n.appendChild(i(t,s));else"style"===t?Object.assign(n.style,s):"textContent"===t?n.textContent=s:n.setAttribute(t,s.toString());return n}function n(t,e,n){return i(t,e||{})}const s={height:20,formatTimeCallback:t=>{if(t/60>1){return`${Math.floor(t/60)}:${`${(t=Math.round(t%60))<10?"0":""}${t}`}`}return`${Math.round(1e3*t)/1e3}`}};class r extends e{constructor(t){super(t||{}),this.options=Object.assign({},s,t),this.timelineWrapper=this.initTimelineWrapper()}static create(t){return new r(t)}onInit(){var t;if(!this.wavesurfer)throw Error("WaveSurfer is not initialized");let e=this.wavesurfer.getWrapper();if(this.options.container instanceof HTMLElement)e=this.options.container;else if("string"==typeof this.options.container){const t=document.querySelector(this.options.container);if(!t)throw Error(`No Timeline container found matching ${this.options.container}`);e=t}this.options.insertPosition?(e.firstElementChild||e).insertAdjacentElement(this.options.insertPosition,this.timelineWrapper):e.appendChild(this.timelineWrapper),this.subscriptions.push(this.wavesurfer.on("redraw",(()=>this.initTimeline()))),((null===(t=this.wavesurfer)||void 0===t?void 0:t.getDuration())||this.options.duration)&&this.initTimeline()}destroy(){this.timelineWrapper.remove(),super.destroy()}initTimelineWrapper(){return n("div",{part:"timeline-wrapper",style:{pointerEvents:"none"}})}defaultTimeInterval(t){return t>=25?1:5*t>=25?5:15*t>=25?15:60*Math.ceil(.5/t)}defaultPrimaryLabelInterval(t){return t>=25?10:5*t>=25?6:4}defaultSecondaryLabelInterval(t){return t>=25?5:2}virtualAppend(t,e,i){let n=!1;const s=(s,r)=>{if(!this.wavesurfer)return;const o=i.clientWidth,l=t>s&&t+o<r;l!==n&&(n=l,l?e.appendChild(i):i.remove())};if(!this.wavesurfer)return;const r=this.wavesurfer.getScroll(),o=r+this.wavesurfer.getWidth();s(r,o),this.subscriptions.push(this.wavesurfer.on("scroll",((t,e,i,n)=>{s(i,n)})))}initTimeline(){var t,e,i,s,r,o,l,a;const h=null!==(i=null!==(e=null===(t=this.wavesurfer)||void 0===t?void 0:t.getDuration())&&void 0!==e?e:this.options.duration)&&void 0!==i?i:0,p=((null===(s=this.wavesurfer)||void 0===s?void 0:s.getWrapper().scrollWidth)||this.timelineWrapper.scrollWidth)/h,u=null!==(r=this.options.timeInterval)&&void 0!==r?r:this.defaultTimeInterval(p),c=null!==(o=this.options.primaryLabelInterval)&&void 0!==o?o:this.defaultPrimaryLabelInterval(p),d=this.options.primaryLabelSpacing,f=null!==(l=this.options.secondaryLabelInterval)&&void 0!==l?l:this.defaultSecondaryLabelInterval(p),v=this.options.secondaryLabelSpacing,m="beforebegin"===this.options.insertPosition,y=n("div",{style:Object.assign({height:`${this.options.height}px`,overflow:"hidden",fontSize:this.options.height/2+"px",whiteSpace:"nowrap"},m?{position:"absolute",top:"0",left:"0",right:"0",zIndex:"2"}:{position:"relative"})});y.setAttribute("part","timeline"),"string"==typeof this.options.style?y.setAttribute("style",y.getAttribute("style")+this.options.style):"object"==typeof this.options.style&&Object.assign(y.style,this.options.style);const b=n("div",{style:{width:"0",height:"50%",display:"flex",flexDirection:"column",justifyContent:m?"flex-start":"flex-end",top:m?"0":"auto",bottom:m?"auto":"0",overflow:"visible",borderLeft:"1px solid currentColor",opacity:`${null!==(a=this.options.secondaryLabelOpacity)&&void 0!==a?a:.25}`,position:"absolute",zIndex:"1"}});for(let t=0,e=0;t<h;t+=u,e++){const i=b.cloneNode(),n=Math.round(100*t)/100%c==0||d&&e%d==0,s=Math.round(100*t)/100%f==0||v&&e%v==0;(n||s)&&(i.style.height="100%",i.style.textIndent="3px",i.textContent=this.options.formatTimeCallback(t),n&&(i.style.opacity="1"));const r=n?"primary":s?"secondary":"tick";i.setAttribute("part",`timeline-notch timeline-notch-${r}`);const o=t*p;i.style.left=`${o}px`,this.virtualAppend(o,y,i)}this.timelineWrapper.innerHTML="",this.timelineWrapper.appendChild(y),this.emit("ready")}}return r}));