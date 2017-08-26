var mut = new MutationObserver(cb);

mut.observer(el, options);
mut.disconnect();
mut.takeRecords();

options = {
  childList,
  attributes,
  characterData,
  subtree,
  attributeOldValue,
  characterDataOldValue,
  attributeFilter
}

MutationRecord = {
  type,
  addedNodes,
  removedNodes,
  nextSibling,
  previousSibling,
  oldValue,
  attributeName,
  attributeNameSpace,
  target
}

var sw = navigator.serviceWorker.register('sw.js', { scope: '/'})
          .then(function(registration) {
            registration.unregister();
            registration.update();
            registration.scope;
            registration.showNotification();
            registration.getNotifications()
            registration.installing.state;
            registration.waiting
            registration.active;
          });
navigator.serviceWorker.controller;
navigator.serviceWorker.ready;
navigator.serviceWorker.getRegistration()
navigator.serviceWorker.getRegistrations();

self.oninstall = function(e) {
  e.waitUntil(caches.open('v1').then(function(cache) {
    cache.addAll();
    cache.match();
    cache.add()
    cache.put();
  }))
}

self.onfetch = function() {
  e.respondWith(caches.match(e.request))
}

clients.get()
clients.matchAll()
clients.openWindow()

client.type, client.frameType, client,id;
client.claim()

function bindActionCreators(actionCreators, dispatch) {
  var obj = {}
  for(var i = 0; i< actionCreators.length; i++) {
    obj[actionCreators[i]] = function(action) {

    }
  }
}

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

ctx.fillRect(x,y,w,h);
ctx.storkeRect(x,y,w,h);
ctx.clearRect(x,y,w,h);

ctx.beginPath()
ctx.closePath()
ctx.fill();
ctx.stroke();
ctx.clear();
ctx.moveTo()
ctx.lineTo();
ctx.arc(x,y,r,s,e,a);
ctx.arcTo(x1,y1,x2,y2,r);
ctx.quadraticCurveTo(x1,y1,x,y);
ctx.bezierCurveTo();
var path = new Path2D();
path.addPath();
ctx.shadowOffsetX;
ctx.shadowOffsetY;
ctx.shadowColor;
ctx.shadowBlur;
ctx.globalAlpha;
ctx.rect();
ctx.fillStyle
ctx.strokeStyle
ctx.lineWidth
ctx.lineJoin
ctx.lineCap;
ctx.miterLimit;
ctx.getLineDash
ctx.setLineDash;
ctx.lineDashOffset;
ctx.fillText(text,x,y,maxW);
ctx.strokeText()
ctx.resotre;
ctx.save();
ctx.font
ctx.textBaseline
ctx.textAlign
ctx.direction
ctx.measureText();
ctx.createLinearGradient();
ctx.createRadialGradient();
gradient.addColorStop();
createPattern();
ctx.drawImage(i, x,y);
toBlob(function(blob) {}, type, quality);
toDataURL(type, quality);

drag, drop, dragstart, dragend, dragenter, dragleave, dragover;
dataTransder.setData(), getData(), clearData();
types, files, items, effectAllowed, dropEffect;
type, kind, getAsString, getAsFile, add(data, type);
add(file), remove(index), clear();





