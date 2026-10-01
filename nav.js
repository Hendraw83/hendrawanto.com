'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
function closeMenu(){ menuButton.setAttribute('aria-expanded','false'); navigation.classList.remove('is-open'); }
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));navigation.classList.toggle('is-open',open);});
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
window.matchMedia('(min-width:1025px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
const y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();
document.querySelectorAll('.nav-drop-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const o=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(o));b.parentElement.classList.toggle('open',o);}));
document.addEventListener('click',e=>{if(!e.target.closest('.nav-dropdown'))document.querySelectorAll('.nav-dropdown.open').forEach(d=>{d.classList.remove('open');d.querySelector('button').setAttribute('aria-expanded','false');});});
