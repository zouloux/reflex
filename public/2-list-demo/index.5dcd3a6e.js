var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},t={},n={},o=e.parcelRequirea1a1;null==o&&((o=function(e){if(e in t)return t[e].exports;if(e in n){var o=n[e];delete n[e];var l={id:e,exports:{}};return t[e]=l,o.call(l.exports,l,l.exports),l.exports}var i=new Error("Cannot find module '"+e+"'");throw i.code="MODULE_NOT_FOUND",i}).register=function(e,t){n[e]=t},e.parcelRequirea1a1=o);var l=o("leUMy"),i=o("3AbUl"),r=(l=o("leUMy"),o("hvc62"));let d=[];const u=(e,t)=>{"bottom"===e?d.push(t):d.unshift(t)},a=e=>{d=d.filter((t=>t!=e))},c=(e,t)=>{const n=d.indexOf(e)+t;n<0||n>=d.length||(a(e),d.splice(n,0,e))};const s={border:"1px solid black"};function m(e){return(0,l.h)("tr",{class:"ListItem","data-id":e.item.id,style:s},(0,l.h)("td",null,e.item.name),(0,l.h)("td",null,(0,l.h)("button",{onClick:function(){c(e.item,-1),e.render()}},"⬆")),(0,l.h)("td",null,(0,l.h)("button",{onClick:function(){c(e.item,1),e.render()}},"⬇")),(0,l.h)("td",null,(0,l.h)("button",{onClick:function(){a(e.item),e.render()}},"Remove")))}function f(e){function t(t=0){!function(e=0){e||=(0,r.rand)(5+d.length)+1;for(let t=0;t<e;t++)u("bottom",{id:(0,r.createUID)(),name:(0,r.pickRandom)(r.colorList)+" "+(0,r.pickRandom)(r.foodList)})}(t),e.render()}return(0,l.h)("div",{class:"ListDemoApp"},(0,l.h)("div",{class:"ListDemoApp_controls"},(0,l.h)("table",null,(0,l.h)("button",{onClick:e=>t()},"Add random items to bottom"),(0,l.h)("button",{onClick:e=>t(1e3)},"Add 1000 items to bottom"),(0,l.h)("button",{onClick:function(){!function(){const e=(0,r.rand)(d.length)+1;for(let t=0;t<e;t++){const e=(0,r.pickRandom)(d);a(e)}}(),e.render()}},"Remove random items"),(0,l.h)("button",{onClick:function(){d=[],e.render()}},"Clear list")),(0,l.h)("form",{onSubmit:function(t){t.preventDefault();const n=document.getElementById("ListDemoApp_nameInput");n.value&&(u("top",{name:n.value,id:(0,r.createUID)()}),n.value="",e.render())}},(0,l.h)("table",null,(0,l.h)("input",{id:"ListDemoApp_nameInput",type:"text",name:"name",placeholder:"Name ..."}),(0,l.h)("button",{type:"submit"},"Add to top")))),(0,l.h)("h3",null,d.length," element",d.length>1?"s":""),(0,l.h)("table",null,d.map((t=>(0,l.h)(m,{item:t,key:t.id,render:e.render})))))}(0,i.setReflexDebug)(!0);let h=0;!function e(){const t=(0,i.trackPerformances)("Root rendering");(0,l.render)((0,l.h)(f,{render:e,renderIndex:h++}),document.body),t()}();
//# sourceMappingURL=index.5dcd3a6e.js.map
