(this["webpackJsonpbroadcast-app"]=this["webpackJsonpbroadcast-app"]||[]).push([[0],[,,,,function(e,n,o){e.exports=o(11)},,,,,function(e,n,o){},function(e,n,o){},function(e,n,o){"use strict";o.r(n);var t,i,s=o(0),a=o.n(s),r=o(2),c=o.n(r),d=(o(9),o(3));o(10);t=window.io.connect("http://localhost:8080/",{transports:["websocket"]});document.getElementById("root");var u=function(){var e=Object(s.useRef)(),n=Object(s.useRef)(),o=Object(s.useRef)(),r=Object(s.useRef)(),c=Object(s.useState)(null),u=Object(d.a)(c,2),l=u[0],f=u[1],m=function(e){if(o.current){var n=e;i.session={video:-1!==o.current.value.indexOf("Video"),screen:-1!==o.current.value.indexOf("Screen"),audio:-1!==o.current.value.indexOf("Audio"),oneway:!0},console.log(i,i.session),t.emit("join-broadcast",{broadcastid:n,userid:i.userid,typeOfStreams:i.session})}};Object(s.useEffect)((function(){g();var e=new URL(window.location.href);e.searchParams.get("channel")&&(n.current.style.display="none",f(parseInt(e.searchParams.get("channel"),10)),m(l))}));var p={},g=function(){(i=h()).socketURL="http://llocalhostt:8080/",i.getExternalIceServers=!1,i.onstream=function(e){console.log("STREAM STARTED!"),i.body.appendChild(e.mediaElement),!1!==i.isInitiator||i.broadcastingConnection||(i.broadcastingConnection=h(i.userid),i.broadcastingConnection.onstream=function(){},i.broadcastingConnection.session=i.session,i.broadcastingConnection.attachStreams.push(e.stream),i.broadcastingConnection.dontCaptureUserMedia=!0,i.broadcastingConnection.sdpConstraints.mandatory={OfferToReceiveVideo:!1,OfferToReceiveAudio:!1},i.broadcastingConnection.open({dontTransmit:!0}))},t.on("message",(function(e){e.sender!==i.userid&&p[e.channel]&&p[e.channel](e.message)})),t.on("join-broadcaster",(function(e,n){i.session=n,i.channel=i.sessionid=e.userid,i.sdpConstraints.mandatory={OfferToReceiveVideo:!!i.session.video,OfferToReceiveAudio:!!i.session.audio},i.join({sessionid:e.userid,userid:e.userid,extra:{},session:i.session})})),t.on("start-broadcasting",(function(e){console.log("BRODCAST STARTED"),i.sdpConstraints.mandatory={OfferToReceiveVideo:!1,OfferToReceiveAudio:!1},i.session=e,i.open({dontTransmit:!0}),i.broadcastingConnection&&(i.broadcastingConnection.close(),i.broadcastingConnection=null)}))},h=function(e){var n=new window.RTCMultiConnection;return console.log("CONNECTION",n),n.body=r.current,n.channel=n.sessionid=n.userid=e||n.userid,n.sdpConstraints.mandatory={OfferToReceiveAudio:!1,OfferToReceiveVideo:!0},n.openSignalingChannel=function(e){var o=e.channel||this.channel;return p[o]=e.onmessage,e.onopen&&setTimeout(e.onopen,1e3),{send:function(e){t.emit("message",{sender:n.userid,channel:o,message:e})},channel:o}},n.onMediaError=function(e){alert(JSON.stringify(e))},n};return a.a.createElement("div",{className:"App",ref:e},a.a.createElement("div",{ref:r,id:"videos-container"}),a.a.createElement("button",{ref:n,onClick:function(e){return m(123344)}},"Go live"),a.a.createElement("select",{ref:o,id:"broadcast-options"},a.a.createElement("option",null,"Audio+Video"),a.a.createElement("option",{title:"Works only in Firefox."},"Audio+Screen"),a.a.createElement("option",null,"Audio"),a.a.createElement("option",null,"Video"),a.a.createElement("option",{title:"Screen capturing requries HTTPs. Please run this demo on HTTPs to make sure it can capture your screens."},"Screen")))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));c.a.render(a.a.createElement(u,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))}],[[4,1,2]]]);
//# sourceMappingURL=main.d7e9ef74.chunk.js.map