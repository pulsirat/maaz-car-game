// M1A4A0Z2 Friend Mode relay. Uses only Node.js built-ins (Node 18+).
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const base = __dirname;
const rooms = new Map();
const OPEN = 1;
function frame(text) {
  const payload = Buffer.from(text); let header;
  if (payload.length < 126) { header = Buffer.from([0x81, payload.length]); }
  else if (payload.length < 65536) { header = Buffer.alloc(4); header[0]=0x81;header[1]=126;header.writeUInt16BE(payload.length,2); }
  else { header = Buffer.alloc(10);header[0]=0x81;header[1]=127;header.writeBigUInt64BE(BigInt(payload.length),2); }
  return Buffer.concat([header,payload]);
}
function send(peer,obj){if(peer.readyState===OPEN&&!peer.socket.destroyed)peer.socket.write(frame(JSON.stringify(obj)));}
function broadcast(room,from,obj){for(const peer of rooms.get(room)||[])if(peer!==from)send(peer,obj);}
function remove(peer){if(peer.room&&rooms.has(peer.room)){const peers=rooms.get(peer.room);peers.delete(peer);for(const p of peers)send(p,{type:'peer-left'});if(!peers.size)rooms.delete(peer.room);}peer.room=null;peer.readyState=3;}
function receive(peer,msg){
  if(msg.type==='join'){
    const room=String(msg.room||'').toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,12);
    if(room.length<3)return send(peer,{type:'error',message:'Invalid room code'});
    peer.room=room;if(!rooms.has(room))rooms.set(room,new Set());
    const peers=rooms.get(room);if(peers.size>=2){peer.room=null;return send(peer,{type:'error',message:'Room is full (2 players maximum)'});}
    const existing=[...peers][0];peers.add(peer);send(peer,{type:'joined',room,players:peers.size});
    if(existing){send(existing,{type:'peer'});send(peer,{type:'peer'});}return;
  }
  if(!peer.room)return;
  if(msg.type==='state'&&msg.data&&Number.isFinite(msg.data.x)&&Number.isFinite(msg.data.z)){
    const d={x:Math.max(-20,Math.min(20,msg.data.x)),z:Math.max(-10000,Math.min(10000,msg.data.z)),heading:Number(msg.data.heading)||0,speed:Number(msg.data.speed)||0,distance:Math.max(0,Math.min(10000000,Number(msg.data.distance)||0)),paint:Number.isInteger(msg.data.paint)?Math.max(0,Math.min(0xffffff,msg.data.paint)):0x26c6a0};
    broadcast(peer.room,peer,{type:'state',data:d});
  }
  if(msg.type==='chat'&&typeof msg.text==='string')broadcast(peer.room,peer,{type:'chat',text:msg.text.slice(0,120)});
}
function attachWebSocket(req,socket){
  const key=req.headers['sec-websocket-key'];if(!key){socket.destroy();return;}
  const accept=crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+'\r\n\r\n');
  const peer={socket,room:null,readyState:OPEN};let buffer=Buffer.alloc(0);
  socket.on('data',chunk=>{
    buffer=Buffer.concat([buffer,chunk]);
    while(buffer.length>=2){const b0=buffer[0],b1=buffer[1],opcode=b0&15,masked=!!(b1&128);let len=b1&127,offset=2;
      if(len===126){if(buffer.length<4)return;len=buffer.readUInt16BE(2);offset=4;}else if(len===127){if(buffer.length<10)return;const big=buffer.readBigUInt64BE(2);if(big>1048576n){socket.destroy();return;}len=Number(big);offset=10;}
      const maskBytes=masked?4:0;if(buffer.length<offset+maskBytes+len)return;let payload=buffer.subarray(offset+maskBytes,offset+maskBytes+len);if(masked){payload=Buffer.from(payload);const mask=buffer.subarray(offset,offset+4);for(let i=0;i<payload.length;i++)payload[i]^=mask[i%4];}
      buffer=buffer.subarray(offset+maskBytes+len);
      if(opcode===8){socket.end();remove(peer);return;}if(opcode===9){socket.write(Buffer.from([0x8a,0]));continue;}if(opcode===1){try{receive(peer,JSON.parse(payload.toString()));}catch{}}
    }
  });
  socket.on('close',()=>remove(peer));socket.on('error',()=>remove(peer));
}
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent((req.url||'/').split('?')[0]);
  if(pathname==='/health'){res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify({ok:true,game:'M1A4A0Z2 Friend Mode'}));}
  const requested=pathname==='/'?'/M1A4A0Z2_Worldwide_Highway_Race.html':pathname;
  const file=path.resolve(base,'.'+requested);
  if(!file.startsWith(base+path.sep)){res.writeHead(403);return res.end('Forbidden');}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}const ext=path.extname(file);const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json'};res.writeHead(200,{'content-type':types[ext]||'application/octet-stream','cache-control':'no-store'});res.end(data);});
});
server.on('upgrade',(req,socket)=>{if((req.url||'').split('?')[0]!=='/ws'){socket.destroy();return;}attachWebSocket(req,socket);});
const port=Number(process.env.PORT)||8091;
server.listen(port,'0.0.0.0',()=>console.log(`M1A4A0Z2 Friend Mode ready: http://localhost:${port}`));
