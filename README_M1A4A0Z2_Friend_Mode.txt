M1A4A0Z2 — FRIEND MODE + HIGHWAY RACE
=====================================

PROJECT FILES
-------------
M1A4A0Z2_Worldwide_Highway_Race.html  Playable browser game
friend-server.js                     Node.js online room relay + static server
Run_M1A4A0Z2_Friend_Server.bat       Windows launcher
package.json                         Project metadata

WHAT'S NEW IN THIS BUILD
------------------------
- 36 highway traffic vehicles, including sedans, SUVs, vans and articulated box trucks.
- Traffic vehicles use varied cruise speeds and lengths; trucks are slower and take more road space.
- Traffic AI checks nearby lanes, changes lanes to pass slower vehicles, follows safely when a lane is blocked,
  and returns toward its cruise lane when it is clear.
- Seven named AI racing opponents: APEX, NOVA, BLAZE, PHANTOM, VIPER, TITAN and ORBIT.
- AI racers use the selected car's speed class and the current difficulty setting, accelerate into the race,
  avoid slower traffic, and look for safe overtaking lanes.
- Three difficulty levels: EASY, SPORT and LEGENDARY.
- 2 km highway race with a 3-second countdown, live position, distance remaining, finish position and impact count.
- Vehicle-specific collision boxes. Impacts reduce player speed, push the car away and shake the chase camera.
- The friend relay now forwards race distance and paint colour as well as position and speed, allowing the
  remote player's leaderboard distance and vehicle colour to update.
- Original gold-and-black M1A4A0Z2 styling, V12 audio identity, Strada/Sport/Corsa modes, oval circuit,
  northbound highway, 12 garage paint/shape variants and friend mode are retained.

START THE GAME
--------------
Option A — online/local friend server (recommended):
1. Install Node.js 18 or newer.
2. Double-click Run_M1A4A0Z2_Friend_Server.bat.
3. The game opens at http://127.0.0.1:8091/.
4. The server also serves the HTML file, so keep the HTML and friend-server.js in the same folder.

Option B — local single-player:
Open the HTML in a modern browser. The 3D engine loads Three.js from jsDelivr, so internet access is
required. For friend rooms, use the Node.js server instead of opening the HTML as file://.

HOW TO REACH HIGHWAY RACE
-------------------------
1. Click START ENGINE.
2. Drive forward from the oval circuit toward the green HIGHWAY · NORTH sign.
3. Continue along the highway until the car is at least 90 m down the highway.
4. Press T or click START RACE. The game places seven AI racers on a staggered four-lane grid behind you.
5. A 3-second countdown starts the 2 km race. Avoid traffic, pass trucks and race the AI field.
6. Press T or click END RACE to stop early.

CONTROLS
--------
Player 1: W/A/S/D or arrow keys — steer/accelerate/reverse
Space — brake
1 — Strada; 2 — Sport; 3 — Corsa
T — start/end the 2 km highway race
G — cycle EASY / SPORT / LEGENDARY
R — reset to the circuit

Local Player 2: I/J/K/L
Touch controls: on-screen arrow buttons

AI / TRAFFIC DETAILS
--------------------
- 36 traffic vehicles are placed along the highway and recycled ahead as you pass them.
- Cars, SUVs and vans have different body profiles; trucks are longer, wider and slower.
- AI racers use lane-gap checks before overtaking and reduce speed if blocked and unable to pass.
- Collision detection is axis-aligned and intended for the highway's mostly straight four-lane layout.
- The highway is a looping test segment; race progress is measured separately so a 2 km event can run
  across multiple visual highway loops.

ONLINE FRIEND MODE
------------------
1. Run the Friend Server launcher on the host PC.
2. On the host, use http://127.0.0.1:8091/.
3. For another PC on the same network, use the host PC's LAN IPv4 address and port 8091.
4. Both players select Friend Mode > Online room and enter the same 3–12 character room code.
5. For internet play, deploy the Node server to a public host behind HTTPS/WSS. Do not expose an
   unencrypted public WebSocket server to the internet.

TEST RESULTS IN THIS BUILD
--------------------------
- JavaScript module syntax: PASS (Node.js --check).
- Friend server syntax: PASS (Node.js --check).
- HTTP health endpoint: PASS (returns {"ok":true,"game":"M1A4A0Z2 Friend Mode"}).
- Two-client WebSocket room join: PASS.
- Peer presence messages: PASS.
- State relay including distance and paint: PASS.
- Chat relay: PASS.
- Full 3D browser rendering/gameplay: NOT VERIFIED in the build environment. The managed Chromium
  runtime blocks all navigation, and the environment cannot resolve the Three.js CDN hostname.
  On a normal desktop browser with internet access and WebGL, open the game and verify visual play.

KNOWN LIMITATIONS
-----------------
- Three.js is loaded from a CDN; an internet connection is needed unless Three.js is locally bundled.
- The current online relay synchronizes remote position, heading, speed, distance, paint and chat, but does
  not yet make the countdown, AI simulation, traffic state, collisions or race finish authoritative/shared
  between both clients. Each client still runs its own local race simulation.
- Collision bounds are simple axis-aligned approximations rather than full physics or damage simulation.
- Garage entries are paint/scale variants of the M1A4A0Z2 model, not 12 independently modelled/licensed cars.
