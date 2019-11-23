import React, { useRef, useEffect, useState } from "react";
import "./App.css";

let socket;
// connect to backend server..
socket = window.io.connect("http://localhost:8080/", {
  transports: ["websocket"]
});
let connection;

function App() {
  const appRef = useRef();
  const goliveRef = useRef();
  const broadcast_optionsRef = useRef();
  const videos_containerRef = useRef();
  const [channel, setChannel] = useState(null);

  const startBroadcastOrJoin = channel => {
    if (!broadcast_optionsRef.current) return;
    let broadcastid = channel;
    connection.session = {
      video: broadcast_optionsRef.current.value.indexOf("Video") !== -1,
      screen: broadcast_optionsRef.current.value.indexOf("Screen") !== -1,
      audio: broadcast_optionsRef.current.value.indexOf("Audio") !== -1,
      oneway: true
    };
    console.log(connection, connection.session);
    socket.emit("join-broadcast", {
      broadcastid: broadcastid,
      userid: connection.userid,
      typeOfStreams: connection.session
    });
  };

  useEffect(() => {
    initSocketIO();
    // if user follows a link the hide the go live button...
    const currentURL = new URL(window.location.href);
    if (currentURL.searchParams.get("channel")) {
      goliveRef.current.style.display = "none";
      setChannel(parseInt(currentURL.searchParams.get("channel"), 10));
      startBroadcastOrJoin(channel);
    }
  });

  // using single socket for RTCMultiConnection signaling
  const onMessageCallbacks = {};

  const initSocketIO = () => {
    connection = initRTCMultiConnection();
    connection.socketURL = "http://llocalhostt:8080/";

    // this RTCMultiConnection object is used to connect with existing users
    connection.getExternalIceServers = false;
    connection.onstream = function(event) {
      console.log("STREAM STARTED!");
      connection.body.appendChild(event.mediaElement);
      if (
        connection.isInitiator === false &&
        !connection.broadcastingConnection
      ) {
        // "connection.broadcastingConnection" global-level object is used
        // instead of using a closure object, i.e. "privateConnection"
        // because sometimes out of browser-specific bugs, browser
        // can emit "onaddstream" event even if remote user didn't attach any stream.
        // such bugs happen often in chrome.
        // "connection.broadcastingConnection" prevents multiple initializations.
        // if current user is broadcast viewer
        // he should create a separate RTCMultiConnection object as well.
        // because node.js server can allot him other viewers for
        // remote-stream-broadcasting.
        connection.broadcastingConnection = initRTCMultiConnection(
          connection.userid
        );
        // to fix unexpected chrome/firefox bugs out of sendrecv/sendonly/etc. issues.
        connection.broadcastingConnection.onstream = function() {};
        connection.broadcastingConnection.session = connection.session;
        connection.broadcastingConnection.attachStreams.push(event.stream); // broadcast remote stream
        connection.broadcastingConnection.dontCaptureUserMedia = true;
        // forwarder should always use this!
        connection.broadcastingConnection.sdpConstraints.mandatory = {
          OfferToReceiveVideo: false,
          OfferToReceiveAudio: false
        };
        connection.broadcastingConnection.open({
          dontTransmit: true
        });
      }
    };
    socket.on("message", function(data) {
      if (data.sender === connection.userid) return;
      if (onMessageCallbacks[data.channel]) {
        onMessageCallbacks[data.channel](data.message);
      }
    });

    socket.on("join-broadcaster", function(broadcaster, typeOfStreams) {
      connection.session = typeOfStreams;
      connection.channel = connection.sessionid = broadcaster.userid;
      connection.sdpConstraints.mandatory = {
        OfferToReceiveVideo: !!connection.session.video,
        OfferToReceiveAudio: !!connection.session.audio
      };
      connection.join({
        sessionid: broadcaster.userid,
        userid: broadcaster.userid,
        extra: {},
        session: connection.session
      });
    });
    // this event is emitted when a broadcast is absent.
    socket.on("start-broadcasting", function(typeOfStreams) {
      console.log("BRODCAST STARTED");
      // host i.e. sender should always use this!
      connection.sdpConstraints.mandatory = {
        OfferToReceiveVideo: false,
        OfferToReceiveAudio: false
      };
      connection.session = typeOfStreams;
      connection.open({
        dontTransmit: true
      });
      if (connection.broadcastingConnection) {
        // if new person is given the initiation/host/moderation control
        connection.broadcastingConnection.close();
        connection.broadcastingConnection = null;
      }
    });
  };

  // initializing RTCMultiConnection constructor.
  const initRTCMultiConnection = userid => {
    var connection = new window.RTCMultiConnection();
    console.log("CONNECTION", connection);
    connection.body = videos_containerRef.current;
    connection.channel = connection.sessionid = connection.userid =
      userid || connection.userid;
    connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: false,
      OfferToReceiveVideo: true
    };
    // using socket.io for signaling
    connection.openSignalingChannel = function(config) {
      var channel = config.channel || this.channel;
      onMessageCallbacks[channel] = config.onmessage;
      if (config.onopen) setTimeout(config.onopen, 1000);
      return {
        send: function(message) {
          socket.emit("message", {
            sender: connection.userid,
            channel: channel,
            message: message
          });
        },
        channel: channel
      };
    };
    connection.onMediaError = function(error) {
      alert(JSON.stringify(error));
    };
    return connection;
  };

  return (
    <div className='App' ref={appRef}>
      <div ref={videos_containerRef} id='videos-container' />
      <button ref={goliveRef} onClick={event => startBroadcastOrJoin(123344)}>
        Go live
      </button>
      <select ref={broadcast_optionsRef} id='broadcast-options'>
        <option>Audio+Video</option>
        <option title='Works only in Firefox.'>Audio+Screen</option>
        <option>Audio</option>
        <option>Video</option>
        <option title='Screen capturing requries HTTPs. Please run this demo on HTTPs to make sure it can capture your screens.'>
          Screen
        </option>
      </select>
    </div>
  );
}
export default App;

// const rootElement = document.getElementById("root");
// export default App;

// import React, { useRef, useEffect, useState } from "react";
// import "./App.css";

// let socket;
// // connect to backend server..
// socket = window.io.connect("http://llocalhostt:3000/", {
//   transports: ["websocket"]
// });
// let connection;

// function App() {
//   const appRef = useRef();
//   const goliveRef = useRef();
//   const broadcast_optionsRef = useRef();
//   const videos_containerRef = useRef();
//   const [channel, setChannel] = useState(null);

//   const startBroadcastOrJoin = channel => {
//     if (!broadcast_optionsRef.current) return;
//     let broadcastid = channel;
//     connection.session = {
//       video: broadcast_optionsRef.current.value.includes("vid"),
//       screen: broadcast_optionsRef.current.value.includes("scr"),
//       audio: broadcast_optionsRef.current.value.includes("aud"),
//       oneway: true
//     };
//     console.log(connection, connection.session, channel);
//     socket.emit("join-broadcast", {
//       broadcastid: broadcastid,
//       userid: connection.userid,
//       typeOfStreams: connection.session
//     });
//   };

//   useEffect(() => {
//     initSocketIO();
//     // if user follows a link the hide the go live button...
//     const currentURL = new URL(window.location.href);
//     if (currentURL.searchParams.get("channel")) {
//       goliveRef.current.style.display = "none";
//       setChannel(parseInt(currentURL.searchParams.get("channel"), 10));
//       startBroadcastOrJoin(channel);
//     }
//   }, []);

//   // using single socket for RTCMultiConnection signaling
//   const onMessageCallbacks = {};

//   const initSocketIO = () => {
//     connection = initRTCMultiConnection();
//     //connection.socketURL = "http://llocalhostt:3000/"; https://cryptic-atoll-80533.herokuapp.com/
//     connection.socketURL = "http://llocalhostt:3000/";
//     // this RTCMultiConnection object is used to connect with existing users
//     connection.getExternalIceServers = false;
//     connection.onstream = function(event) {
//       console.log("STREAM STARTED!");
//       connection.body.appendChild(event.mediaElement);
//       if (
//         connection.isInitiator === false &&
//         !connection.broadcastingConnection
//       ) {
//         // "connection.broadcastingConnection" global-level object is used
//         // instead of using a closure object, i.e. "privateConnection"
//         // because sometimes out of browser-specific bugs, browser
//         // can emit "onaddstream" event even if remote user didn't attach any stream.
//         // such bugs happen often in chrome.
//         // "connection.broadcastingConnection" prevents multiple initializations.
//         // if current user is broadcast viewer
//         // he should create a separate RTCMultiConnection object as well.
//         // because node.js server can allot him other viewers for
//         // remote-stream-broadcasting.
//         connection.broadcastingConnection = initRTCMultiConnection(
//           connection.userid
//         );
//         // to fix unexpected chrome/firefox bugs out of sendrecv/sendonly/etc. issues.
//         connection.broadcastingConnection.onstream = function() {};
//         connection.broadcastingConnection.session = connection.session;
//         connection.broadcastingConnection.attachStreams.push(event.stream); // broadcast remote stream
//         connection.broadcastingConnection.dontCaptureUserMedia = true;
//         // forwarder should always use this!
//         connection.broadcastingConnection.sdpConstraints.mandatory = {
//           OfferToReceiveVideo: false,
//           OfferToReceiveAudio: false
//         };
//         connection.broadcastingConnection.open({
//           dontTransmit: true
//         });
//       }
//     };
//     socket.on("message", function(data) {
//       if (data.sender === connection.userid) return;
//       if (onMessageCallbacks[data.channel]) {
//         onMessageCallbacks[data.channel](data.message);
//       }
//     });

//     socket.on("join-broadcaster", function(broadcaster, typeOfStreams) {
//       connection.session = typeOfStreams;
//       connection.channel = connection.sessionid = broadcaster.userid;
//       connection.sdpConstraints.mandatory = {
//         OfferToReceiveVideo: !!connection.session.video,
//         OfferToReceiveAudio: !!connection.session.audio
//       };
//       connection.join({
//         sessionid: broadcaster.userid,
//         userid: broadcaster.userid,
//         extra: {},
//         session: connection.session
//       });
//     });
//     // this event is emitted when a broadcast is absent.
//     socket.on("start-broadcasting", function(typeOfStreams) {
//       console.log("BRODCAST STARTED");
//       // host i.e. sender should always use this!
//       connection.sdpConstraints.mandatory = {
//         OfferToReceiveVideo: false,
//         OfferToReceiveAudio: false
//       };
//       connection.session = typeOfStreams;
//       connection.open({
//         dontTransmit: true
//       });
//       if (connection.broadcastingConnection) {
//         // if new person is given the initiation/host/moderation control
//         connection.broadcastingConnection.close();
//         connection.broadcastingConnection = null;
//       }
//     });
//   };

//   // initializing RTCMultiConnection constructor.
//   const initRTCMultiConnection = userid => {
//     var connection = new window.RTCMultiConnection();
//     console.log("CONNECTION", connection);
//     connection.body = videos_containerRef.current;
//     connection.channel = connection.sessionid = connection.userid =
//       userid || connection.userid;
//     connection.sdpConstraints.mandatory = {
//       OfferToReceiveAudio: false,
//       OfferToReceiveVideo: true
//     };
//     // using socket.io for signaling
//     connection.openSignalingChannel = function(config) {
//       var channel = config.channel || this.channel;
//       onMessageCallbacks[channel] = config.onmessage;
//       if (config.onopen) setTimeout(config.onopen, 1000);
//       return {
//         send: function(message) {
//           socket.emit("message", {
//             sender: connection.userid,
//             channel: channel,
//             message: message
//           });
//         },
//         channel: channel
//       };
//     };
//     connection.onMediaError = function(error) {
//       alert(JSON.stringify(error));
//     };
//     return connection;
//   };

//   return (
//     <div className='App' ref={appRef}>
//       <div ref={videos_containerRef} id='videos-container' />
//       <button ref={goliveRef} onClick={event => startBroadcastOrJoin(123344)}>
//         Go live
//       </button>
//       <select ref={broadcast_optionsRef} id='broadcast-options'>
//         <option value='aud/vid'>Audio+Video</option>
//         <option value='aud/scr' title='Works only in Firefox.'>
//           Audio+Screen
//         </option>
//         <option value='aud'>Audio</option>
//         <option value='vid'>Video</option>
//         <option title='Screen capturing requries HTTPs. Please run this demo on HTTPs to make sure it can capture your screens.'>
//           Screen
//         </option>
//       </select>
//     </div>
//   );
// }

// const rootElement = document.getElementById("root");
// export default App;
