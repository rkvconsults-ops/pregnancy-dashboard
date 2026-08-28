(function(global){
  'use strict';

  const DB_NAME = 'pregnancy-dashboard';
  const DB_VERSION = 1;
  const STORE = 'app';
  const DATA_KEY = 'data';
  const SYNC_KEY = 'sync-config';
  const CONFIG_KEY = 'personal-config';
  const META_KEY = 'meta';

  function openDb(){
    return new Promise((resolve, reject)=>{
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = ()=>{
        const db = req.result;
        if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = ()=>resolve(req.result);
      req.onerror = ()=>reject(req.error || new Error('Could not open local database'));
    });
  }

  async function idbGet(key){
    const db = await openDb();
    return new Promise((resolve, reject)=>{
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = ()=>resolve(req.result == null ? null : req.result);
      req.onerror = ()=>reject(req.error || new Error('Could not read local data'));
      tx.oncomplete = ()=>db.close();
    });
  }

  async function idbSet(key, value){
    const db = await openDb();
    return new Promise((resolve, reject)=>{
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = ()=>{ db.close(); resolve(); };
      tx.onerror = ()=>{ const err=tx.error; db.close(); reject(err || new Error('Could not save local data')); };
    });
  }

  async function idbDelete(key){
    const db = await openDb();
    return new Promise((resolve, reject)=>{
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = ()=>{ db.close(); resolve(); };
      tx.onerror = ()=>{ const err=tx.error; db.close(); reject(err || new Error('Could not delete local data')); };
    });
  }

  async function clearAll(){
    const db = await openDb();
    return new Promise((resolve, reject)=>{
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete = ()=>{ db.close(); resolve(); };
      tx.onerror = ()=>{ const err=tx.error; db.close(); reject(err || new Error('Could not clear local data')); };
    });
  }

  async function migrateLegacy(){
    const existing = await idbGet(DATA_KEY);
    if(existing) return existing;
    try{
      const legacy = localStorage.getItem('pd_data');
      if(!legacy) return null;
      const parsed = JSON.parse(legacy);
      await idbSet(DATA_KEY, parsed);
      localStorage.removeItem('pd_data');
      return parsed;
    }catch(e){ return null; }
  }

  function bytesToB64Url(bytes){
    let binary='';
    bytes.forEach(b=>{ binary += String.fromCharCode(b); });
    return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }

  function b64UrlToBytes(text){
    const normalized = text.replace(/-/g,'+').replace(/_/g,'/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    const binary = atob(padded);
    return Uint8Array.from(binary, c=>c.charCodeAt(0));
  }

  function randomToken(byteLength){
    return bytesToB64Url(crypto.getRandomValues(new Uint8Array(byteLength || 24)));
  }

  async function deriveKey(secret, saltBytes){
    const enc = new TextEncoder();
    const base = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      {name:'PBKDF2', salt:saltBytes, iterations:310000, hash:'SHA-256'},
      base,
      {name:'AES-GCM', length:256},
      false,
      ['encrypt','decrypt']
    );
  }

  async function encryptJson(value, secret){
    const salt=crypto.getRandomValues(new Uint8Array(16));
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const key=await deriveKey(secret, salt);
    const plain=new TextEncoder().encode(JSON.stringify(value));
    const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plain);
    return {v:1,alg:'AES-GCM',kdf:'PBKDF2-SHA256',iterations:310000,salt:bytesToB64Url(salt),iv:bytesToB64Url(iv),ciphertext:bytesToB64Url(new Uint8Array(cipher))};
  }

  async function decryptJson(envelope, secret){
    if(!envelope || envelope.v!==1 || !envelope.salt || !envelope.iv || !envelope.ciphertext) throw new Error('Unsupported encrypted data');
    const salt=b64UrlToBytes(envelope.salt);
    const iv=b64UrlToBytes(envelope.iv);
    const key=await deriveKey(secret,salt);
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,b64UrlToBytes(envelope.ciphertext));
    return JSON.parse(new TextDecoder().decode(plain));
  }

  function encodeRecovery(config){
    return 'PD1.' + bytesToB64Url(new TextEncoder().encode(JSON.stringify(config)));
  }

  function decodeRecovery(code){
    const clean=String(code||'').trim();
    if(!clean.startsWith('PD1.')) throw new Error('Invalid recovery code');
    const cfg=JSON.parse(new TextDecoder().decode(b64UrlToBytes(clean.slice(4))));
    if(!cfg.endpoint || !cfg.recordId || !cfg.secret) throw new Error('Incomplete recovery code');
    return cfg;
  }

  function validateBackup(value){
    if(!value || value.format!=='pregnancy-dashboard-backup' || value.version!==1) throw new Error('This is not a supported journey backup');
    if(!value.data || typeof value.data!=='object') throw new Error('Backup data is missing');
    return value;
  }

  async function requestPersistentStorage(){
    if(!navigator.storage || !navigator.storage.persist) return false;
    try{ return await navigator.storage.persist(); }catch(e){ return false; }
  }

  global.PregnancyAppCore={
    keys:{DATA_KEY,SYNC_KEY,CONFIG_KEY,META_KEY},
    get:idbGet,set:idbSet,remove:idbDelete,clearAll,migrateLegacy,
    randomToken,encryptJson,decryptJson,encodeRecovery,decodeRecovery,
    validateBackup,requestPersistentStorage
  };
})(window);
