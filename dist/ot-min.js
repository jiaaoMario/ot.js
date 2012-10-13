/*
 *    /\
 *   /  \ operational-transformation 0.0.7
 *  /    \ http://ot.substance.io
 *  \    /
 *   \  / (c) 2012 Tim Baumann <tim@timbaumann.info> (http://timbaumann.info)
 *    \/ operational-transformation may be freely distributed under the MIT license.
 */
if(typeof ot=="undefined")var ot={};ot.TextOperation=function(){function e(){if(this.constructor!==e)return new e;this.ops=[],this.baseLength=0,this.targetLength=0}e.prototype.equals=function(e){if(this.baseLength!==e.baseLength)return!1;if(this.targetLength!==e.targetLength)return!1;if(this.ops.length!==e.ops.length)return!1;for(var t=0;t<this.ops.length;t++)if(this.ops[t]!==e.ops[t])return!1;return!0};var t=e.isRetain=function(e){return typeof e=="number"&&e>0},n=e.isInsert=function(e){return typeof e=="string"},r=e.isDelete=function(e){return typeof e=="number"&&e<0};return e.prototype.retain=function(e){if(typeof e!="number")throw new Error("retain expects an integer");return e===0?this:(this.baseLength+=e,this.targetLength+=e,t(this.ops[this.ops.length-1])?this.ops[this.ops.length-1]+=e:this.ops.push(e),this)},e.prototype.insert=function(e){if(typeof e!="string")throw new Error("insert expects a string");if(e==="")return this;this.targetLength+=e.length;var t=this.ops;return n(t[t.length-1])?t[t.length-1]+=e:r(t[t.length-1])?n(t[t.length-2])?t[t.length-2]+=e:(t[t.length]=t[t.length-1],t[t.length-2]=e):t.push(e),this},e.prototype["delete"]=function(e){typeof e=="string"&&(e=e.length);if(typeof e!="number")throw new Error("delete expects an integer or a string");return e===0?this:(e>0&&(e=-e),this.baseLength-=e,r(this.ops[this.ops.length-1])?this.ops[this.ops.length-1]+=e:this.ops.push(e),this)},e.prototype.isNoop=function(){return this.ops.length===0||this.ops.length===1&&t(this.ops[0])},e.prototype.toString=function(){var e=Array.prototype.map||function(e){var t=this,n=[];for(var r=0,i=t.length;r<i;r++)n[r]=e(t[r]);return n};return e.call(this.ops,function(e){return t(e)?"retain "+e:n(e)?"insert '"+e+"'":"delete "+ -e}).join(", ")},e.prototype.toJSON=function(){return this},e.fromJSON=function(i){var s=new e,o=i.ops;for(var u=0,a=o.length;u<a;u++){var f=o[u];if(t(f))s.retain(f);else if(n(f))s.insert(f);else{if(!r(f))throw new Error("unknown operation: "+JSON.stringify(f));s["delete"](f)}}if(s.baseLength!==i.baseLength)throw new Error("baseLengths don't match");if(s.targetLength!==i.targetLength)throw new Error("targetLengths don't match");return s},e.prototype.apply=function(e){var r=this;if(e.length!==r.baseLength)throw new Error("The operation's base length must be equal to the string's length.");var i=[],s=0,o=0,u=this.ops;for(var a=0,f=u.length;a<f;a++){var l=u[a];if(t(l)){if(o+l>e.length)throw new Error("Operation can't retain more characters than are left in the string.");i[s++]=e.slice(o,o+l),o+=l}else n(l)?i[s++]=l:o-=l}if(o!==e.length)throw new Error("The operation didn't operate on the whole string.");return i.join("")},e.prototype.invert=function(r){var i=0,s=new e,o=this.ops;for(var u=0,a=o.length;u<a;u++){var f=o[u];t(f)?(s.retain(f),i+=f):n(f)?s["delete"](f.length):(s.insert(r.slice(i,i-f)),i-=f)}return s},e.prototype.compose=function(i){var s=this;if(s.targetLength!==i.baseLength)throw new Error("The base length of the second operation has to be the target length of the first operation");var o=new e,u=s.ops,a=i.ops,f=0,l=0,c=u[f++],h=a[l++];for(;;){if(typeof c=="undefined"&&typeof h=="undefined")break;if(r(c)){o["delete"](c),c=u[f++];continue}if(n(h)){o.insert(h),h=a[l++];continue}if(typeof c=="undefined")throw new Error("Cannot compose operations: first operation is too short.");if(typeof h=="undefined")throw new Error("Cannot compose operations: fist operation is too long.");if(t(c)&&t(h))c>h?(o.retain(h),c-=h,h=a[l++]):c===h?(o.retain(c),c=u[f++],h=a[l++]):(o.retain(c),h-=c,c=u[f++]);else if(n(c)&&r(h))c.length>-h?(c=c.slice(-h),h=a[l++]):c.length===-h?(c=u[f++],h=a[l++]):(h+=c.length,c=u[f++]);else if(n(c)&&t(h))c.length>h?(o.insert(c.slice(0,h)),c=c.slice(h),h=a[l++]):c.length===h?(o.insert(c),c=u[f++],h=a[l++]):(o.insert(c),h-=c.length,c=u[f++]);else{if(!t(c)||!r(h))throw new Error("This shouldn't happen: op1: "+JSON.stringify(c)+", op2: "+JSON.stringify(h));c>-h?(o["delete"](h),c+=h,h=a[l++]):c===-h?(o["delete"](h),c=u[f++],h=a[l++]):(o["delete"](c),h+=c,c=u[f++])}}return o},e.prototype.shouldBeComposedWith=function(i){function s(t,n){var r=t.ops,i=e.isRetain;switch(r.length){case 1:return r[0];case 2:return i(r[0])?r[1]:i(r[1])?r[0]:null;case 3:if(i(r[0])&&i(r[2]))return r[1]}return null}function o(e){return t(e.ops[0])?e.ops[0]:0}if(this.isNoop()||i.isNoop())return!0;var u=o(this),a=o(i),f=s(this),l=s(i);return!f||!l?!1:n(f)&&n(l)?u+f.length===a:r(f)&&r(l)?a-l===u||u===a:!1},e.transform=function(i,s){if(i.baseLength!==s.baseLength)throw new Error("Both operations have to have the same base length");var o=new e,u=new e,a=i.ops,f=s.ops,l=0,c=0,h=a[l++],p=f[c++];for(;;){if(typeof h=="undefined"&&typeof p=="undefined")break;if(n(h)){o.insert(h),u.retain(h.length),h=a[l++];continue}if(n(p)){o.retain(p.length),u.insert(p),p=f[c++];continue}if(typeof h=="undefined")throw new Error("Cannot compose operations: first operation is too short.");if(typeof p=="undefined")throw new Error("Cannot compose operations: first operation is too long.");var d;if(t(h)&&t(p))h>p?(d=p,h-=p,p=f[c++]):h===p?(d=p,h=a[l++],p=f[c++]):(d=h,p-=h,h=a[l++]),o.retain(d),u.retain(d);else if(r(h)&&r(p))-h>-p?(h-=p,p=f[c++]):h===p?(h=a[l++],p=f[c++]):(p-=h,h=a[l++]);else if(r(h)&&t(p))-h>p?(d=p,h+=p,p=f[c++]):-h===p?(d=p,h=a[l++],p=f[c++]):(d=-h,p+=h,h=a[l++]),o["delete"](d);else{if(!t(h)||!r(p))throw new Error("The two operations aren't compatible");h>-p?(d=-p,h+=p,p=f[c++]):h===-p?(d=h,h=a[l++],p=f[c++]):(d=h,p+=h,h=a[l++]),u["delete"](d)}}return[o,u]},e}(),typeof module=="object"&&(module.exports=ot.TextOperation);if(typeof ot=="undefined")var ot={};ot.Cursor=function(e){function n(e,t){this.position=e,this.selectionEnd=t}var t=e.ot?e.ot.TextOperation:require("./text-operation");return n.fromJSON=function(e){return new n(e.position,e.selectionEnd)},n.prototype.equals=function(e){return this.position===e.position&&this.selectionEnd===e.selectionEnd},n.prototype.compose=function(e){return e},n.prototype.transform=function(e){function r(n){var r=n,i=e.ops;for(var s=0,o=e.ops.length;s<o;s++){t.isRetain(i[s])?n-=i[s]:t.isInsert(i[s])?r+=i[s].length:(r-=Math.min(n,-i[s]),n+=i[s]);if(n<0)break}return r}var i=r(this.position);return this.position===this.selectionEnd?new n(i,i):new n(i,r(this.selectionEnd))},n}(this),typeof module=="object"&&(module.exports=ot.Cursor);if(typeof ot=="undefined")var ot={};ot.WrappedOperation=function(e){function t(e,t){this.wrapped=e,this.meta=t||{}}function n(e,t){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])}function r(e,t){if(typeof e=="object"){if(typeof e.compose=="function")return e.compose(t);var r={};return n(e,r),n(t,r),r}return t}function i(e,t){return typeof e=="object"&&typeof e.transform=="function"?e.transform(t):e}return t.prototype.apply=function(){return this.wrapped.apply.apply(this.wrapped,arguments)},t.prototype.invert=function(){var e=this.meta;return new t(this.wrapped.invert.apply(this.wrapped,arguments),typeof e=="object"&&typeof e.invert=="function"?e.invert.apply(e,arguments):e)},t.prototype.compose=function(e){return new t(this.wrapped.compose(e.wrapped),r(this.meta,e.meta))},t.transform=function(e,n){var r=e.wrapped.constructor.transform,s=r(e.wrapped,n.wrapped);return[new t(s[0],i(e.meta,n.wrapped)),new t(s[1],i(n.meta,e.wrapped))]},t}(this),typeof module=="object"&&(module.exports=ot.WrappedOperation);if(typeof ot=="undefined")var ot={};ot.UndoManager=function(){function r(t){this.maxItems=t||50,this.state=e,this.dontCompose=!1,this.undoStack=[],this.redoStack=[]}function i(e,t){var n=[],r=t.constructor;for(var i=e.length-1;i>=0;i--){var s=r.transform(e[i],t);(typeof s[0].isNoop!="function"||!s[0].isNoop())&&n.push(s[0]),t=s[1]}return n.reverse()}var e="normal",t="undoing",n="redoing";return r.prototype.add=function(e,r){if(this.state===t)this.redoStack.push(e),this.dontCompose=!0;else if(this.state===n)this.undoStack.push(e),this.dontCompose=!0;else{var i=this.undoStack;!this.dontCompose&&r&&i.length>0?i.push(e.compose(i.pop())):(i.push(e),i.length>this.maxItems&&i.shift()),this.dontCompose=!1,this.redoStack=[]}},r.prototype.transform=function(e){this.undoStack=i(this.undoStack,e),this.redoStack=i(this.redoStack,e)},r.prototype.performUndo=function(n){this.state=t;if(this.undoStack.length===0)throw new Error("undo not possible");n(this.undoStack.pop()),this.state=e},r.prototype.performRedo=function(t){this.state=n;if(this.redoStack.length===0)throw new Error("redo not possible");t(this.redoStack.pop()),this.state=e},r.prototype.canUndo=function(){return this.undoStack.length!==0},r.prototype.canRedo=function(){return this.redoStack.length!==0},r.prototype.isUndoing=function(){return this.state===t},r.prototype.isRedoing=function(){return this.state===n},r}(),typeof module=="object"&&(module.exports=ot.UndoManager);if(typeof ot=="undefined")var ot={};ot.Client=function(e){function t(e){this.revision=e,this.state=r}function n(){}function i(e){this.outstanding=e}function s(e,t){this.outstanding=e,this.buffer=t}t.prototype.setState=function(e){this.state=e},t.prototype.applyClient=function(e){this.setState(this.state.applyClient(this,e))},t.prototype.applyServer=function(e){this.revision++,this.setState(this.state.applyServer(this,e))},t.prototype.serverAck=function(){this.revision++,this.setState(this.state.serverAck(this))},t.prototype.sendOperation=function(e,t){throw new Error("sendOperation must be defined in child class")},t.prototype.applyOperation=function(e){throw new Error("applyOperation must be defined in child class")},t.Synchronized=n,n.prototype.applyClient=function(e,t){return e.sendOperation(e.revision,t),new i(t)},n.prototype.applyServer=function(e,t){return e.applyOperation(t),this},n.prototype.serverAck=function(e){throw new Error("There is no pending operation.")};var r=new n;return t.AwaitingConfirm=i,i.prototype.applyClient=function(e,t){return new s(this.outstanding,t)},i.prototype.applyServer=function(e,t){var n=t.constructor.transform(this.outstanding,t);return e.applyOperation(n[1]),new i(n[0])},i.prototype.serverAck=function(e){return r},t.AwaitingWithBuffer=s,s.prototype.applyClient=function(e,t){var n=this.buffer.compose(t);return new s(this.outstanding,n)},s.prototype.applyServer=function(e,t){var n=t.constructor.transform,r=n(this.outstanding,t),i=n(this.buffer,r[1]);return e.applyOperation(i[1]),new s(r[0],i[0])},s.prototype.serverAck=function(e){return e.sendOperation(e.revision,this.buffer),new i(this.buffer)},t}(this),typeof module=="object"&&(module.exports=ot.Client),function(){function t(e,t){if(!e)throw new Error(t||"assertion error")}var e=ot.TextOperation;e.fromCodeMirrorChange=function(t,n){function s(e){var t=e.line,n=e.ch,r=0;for(var s=0;s<e.line;s++)r+=i[s].length+1;return r+=n,r}function o(){var e=0;for(var t=0,n=i.length;t<n;t++)e+=i[t].length;return e+i.length-1}function u(e,t){if(e.line===t.line)return i[e.line].slice(e.ch,t.ch);var n=i[e.line].slice(e.ch)+"\n";for(var r=e.line+1;r<t.line;r++)n+=i[r]+"\n";return n+=i[t.line].slice(0,t.ch),n}function a(e,t,n){var r=e.slice(0),s=i[t.line].slice(0,t.ch),o=i[n.line].slice(n.ch);r[0]=s+r[0],r[r.length-1]+=o,r.unshift(n.line-t.line+1),r.unshift(t.line),i.splice.apply(i,r)}function f(e,t){var n=s(t.from),r=s(t.to),i=o();e.retain(n),e["delete"](u(t.from,t.to)),e.insert(t.text.join("\n")),e.retain(i-r),a(t.text,t.from,t.to)}var r=new e,i=n.split("\n");f(r,t);for(;;){t=t.next;if(!t)break;var l=new e(r.revision+1);f(l,t),r=r.compose(l)}return r},e.prototype.applyToCodeMirror=function(n){var r=this;n.operation(function(){var i=r.ops,s=0;for(var o=0,u=i.length;o<u;o++){var a=i[o];if(e.isRetain(a))s+=a;else if(e.isInsert(a))n.replaceRange(a,n.posFromIndex(s)),s+=a.length;else if(e.isDelete(a)){var f=n.posFromIndex(s),l=n.posFromIndex(s-a);n.replaceRange("",f,l)}}t(s===n.getValue().length)})}}(),ot.CodeMirrorClient=function(){function s(e,t){this.cursorBefore=e,this.cursorAfter=t}function o(e,t){this.clientId=e,this.cursor=t}function u(e,t,n,r,i){this.id=e,this.listEl=t,this.cm=n,this.name=r,this.selectionClassName="client-selection-"+f(1e6),this.li=document.createElement("li"),r&&(this.li.textContent=r,this.listEl.appendChild(this.li)),this.cursorEl=document.createElement("pre"),this.cursorEl.className="other-client",this.cursorEl.style.borderLeftWidth="2px",this.cursorEl.style.borderLeftStyle="solid",this.cursorEl.innerHTML="&nbsp;",typeof i=="number"&&typeof selectionEnd=="number"&&this.updateCursor(i),this.setColor(r?h(r):Math.random())}function a(t,r){this.socket=t,this.cm=r,this.fromServer=!1,this.unredo=!1,this.undoManager=new n,this.clients={},this.initializeClientList();var i=this;t.on("doc",function(t){e.call(i,t.revision),i.initializeCodeMirror(t.str),i.initializeSocket(),i.initializeClients(t.clients)})}function f(e){return Math.floor(Math.random()*e)}function l(e,t,n){function r(e){var t=Math.round(255*e).toString(16);return t.length===1?"0"+t:t}return"#"+r(e)+r(t)+r(n)}function c(e,t,n){if(t===0)return l(n,n,n);var r=n<.5?n*(1+t):n+t-t*n,i=2*n-r,s=function(e){return e<0&&(e+=1),e>1&&(e-=1),6*e<1?i+(r-i)*6*e:2*e<1?r:3*e<2?i+(r-i)*6*(2/3-e):i};return l(s(e+1/3),s(e),s(e-1/3))}function h(e){var t=1;for(var n=0;n<e.length;n++)t=17*(t+e.charCodeAt(n))%360;return t/360}function p(e,t){function n(){}n.prototype=t.prototype,e.prototype=new n,e.prototype.constructor=e}function d(e){return e[e.length-1]}function v(e){e.parentNode&&e.parentNode.removeChild(e)}function m(e){try{var t=document.styleSheets.item(0),n=(t.rules?t.rules:t.cssRules).length;t.insertRule(e,n)}catch(r){console.error("Couldn't add style rule.",r)}}var e=ot.Client,t=ot.Cursor,n=ot.UndoManager,r=ot.TextOperation,i=ot.WrappedOperation;return s.prototype.invert=function(){return new s(this.cursorAfter,this.cursorBefore)},s.prototype.compose=function(e){return new s(this.cursorBefore,e.cursorAfter)},s.prototype.transform=function(e){return new s(this.cursorBefore.transform(e),this.cursorAfter.transform(e))},o.fromJSON=function(e){return new o(e.clientId,t.fromJSON(e.cursor))},o.prototype.transform=function(e){return new o(this.clientId,this.cursor.transform(e))},u.prototype.setColor=function(e){this.hue=e;var t=c(e,.75,.5);this.li&&(this.li.style.color=t),this.cursorEl.style.borderLeftColor=t;var n=c(e,.5,.9),r="."+this.selectionClassName,i="background:"+n+";",s=r+"{"+i+"}";m(s)},u.prototype.setName=function(e){this.name=e,this.li.textContent=e,this.li.parentNode||this.listEl.appendChild(this.li),this.setColor(h(e))},u.prototype.updateCursor=function(e){this.cursor=e,v(this.cursorEl),this.mark&&(this.mark.clear(),delete this.mark);var t=this.cm.posFromIndex(e.position);if(e.position===e.selectionEnd){var n=this.cm.cursorCoords(t);this.cursorEl.style.height=(n.bottom-n.top)*.85+"px",this.cm.addWidget(t,this.cursorEl,!1)}else{var r,i;e.selectionEnd>e.position?(r=t,i=this.cm.posFromIndex(e.selectionEnd)):(r=this.cm.posFromIndex(e.selectionEnd),i=t),this.mark=this.cm.markText(r,i,this.selectionClassName)}},u.prototype.remove=function(){this.li&&v(this.li),this.cursorEl&&v(this.cursorEl),this.mark&&this.mark.clear()},p(a,e),a.prototype.initializeSocket=function(){var e=this;this.socket.on("client_left",function(t){e.onClientLeft(t.clientId)}).on("set_name",function(t){var n=e.getClientObject(t.clientId);n.setName(t.name)}).on("ack",function(){e.serverAck()}).on("operation",function(t){var n=new i(r.fromJSON(t.operation),o.fromJSON(t.meta));console.log("Operation from server by client "+t.meta.clientId+":",n),e.applyServer(n)}).on("cursor",function(n){var r=e.getClientObject(n.clientId);r.updateCursor(t.fromJSON(n.cursor))})},a.prototype.initializeCodeMirror=function(e){var t=this.cm,n=this;t.setValue(e),this.oldValue=e,t.on("change",function(e,t){n.onCodeMirrorChange(t)}),t.on("cursorActivity",function(){n.onCodeMirrorCursorActivity()}),t.undo=function(){n.undo()},t.redo=function(){n.redo()}},a.prototype.initializeClients=function(e){for(var n in e)if(e.hasOwnProperty(n)){var r=e[n];r.clientId=n,this.clients[n]=new u(r.clientId,this.clientListEl,this.cm,r.name,t.fromJSON(r.cursor))}},a.prototype.getClientObject=function(e){var t=this.clients[e];return t?t:this.clients[e]=new u(e,this.clientListEl,this.cm)},a.prototype.onClientLeft=function(e){console.log("User disconnected: "+e);var t=this.clients[e];if(!t)return;t.remove(),delete this.clients[e]},a.prototype.initializeClientList=function(){this.clientListEl=document.createElement("ul")},a.prototype.applyUnredo=function(e){this.unredo=!0,this.undoManager.add(e.invert(this.oldValue)),e.wrapped.applyToCodeMirror(this.cm),this.cursor=e.meta.cursorAfter,this.cm.setSelection(this.cm.posFromIndex(this.cursor.position),this.cm.posFromIndex(this.cursor.selectionEnd)),this.applyClient(e)},a.prototype.undo=function(){var e=this;this.undoManager.performUndo(function(t){e.applyUnredo(t)})},a.prototype.redo=function(){var e=this;this.undoManager.performRedo(function(t){e.applyUnredo(t)})},a.prototype.onCodeMirrorChange=function(e){var t=this.cm,n=this.oldValue;this.oldValue=t.getValue();var o=this.cursor;this.updateCursor();try{if(!this.fromServer&&!this.unredo){var u=r.fromCodeMirrorChange(e,n),a=new s(o,this.cursor),f=new i(u,a),l=this.undoManager.undoStack.length>0&&!this.undoManager.dontCompose&&d(this.undoManager.undoStack).wrapped.invert(n).shouldBeComposedWith(u);this.undoManager.add(f.invert(n),l),this.applyClient(f)}}finally{this.fromServer=!1,this.unredo=!1}},a.prototype.updateCursor=function(){function e(e,t){return e.line===t.line&&e.ch===t.ch}var n=this.cm,r=n.getCursor(),i=n.indexFromPos(r),s;if(n.somethingSelected()){var o=n.getCursor(!0),u=e(r,o)?n.getCursor(!1):o;s=n.indexFromPos(u)}else s=i;this.cursor=new t(i,s)},a.prototype.onCodeMirrorCursorActivity=function(){var t=this.cursor;this.updateCursor();if(t&&this.cursor.equals(t))return;if(this.state instanceof e.AwaitingWithBuffer)this.state.buffer.meta.cursorAfter=this.cursor;else{var n=this;this.socket.emit("cursor",this.cursor)}},a.prototype.sendOperation=function(e,t){this.socket.emit("operation",{revision:e,meta:{cursor:t.meta.cursorAfter},operation:t.wrapped.toJSON()})},a.prototype.applyOperation=function(e){this.fromServer=!0,e.wrapped.applyToCodeMirror(this.cm);var t=this.getClientObject(e.meta.clientId);t.updateCursor(e.meta.cursor),this.undoManager.transform(e)},a}();