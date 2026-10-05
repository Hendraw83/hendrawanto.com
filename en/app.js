'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
function closeMenu(){ menuButton.setAttribute('aria-expanded','false'); navigation.classList.remove('is-open'); }
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));navigation.classList.toggle('is-open',open);});
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
window.matchMedia('(min-width:1025px)').addEventListener('change',e=>{if(e.matches)closeMenu();});

const services=document.querySelectorAll('.service');
services.forEach(service=>service.addEventListener('toggle',()=>{if(service.open)services.forEach(other=>{if(other!==service)other.open=false;});}));
document.querySelectorAll('.service-discuss').forEach(link=>link.addEventListener('click',()=>{document.getElementById('contact-service').value=link.dataset.service;}));

const articles={
  'akuntansi':{category:'INTRODUCTORY NOTE / ACCOUNTING',title:'Start With The Purpose, Before Fixing The Reports',body:'<p>A discussion about financial statements is more focused when the needs of its users are clear. Before discussing formats, software, or work schedules, start with the decisions the information is meant to support.</p><h3>What will this information be used for?</h3><p>Does management want to understand performance, organise its reporting, prepare for discussions with a bank, or improve the bookkeeping process? Explain the objective and who will read the results.</p><h3>What is the current state of the records?</h3><p>Describe the system in use, the document flow, the division of roles, and the issues that arise most often. A candid explanation helps determine the starting point of the engagement.</p><h3>What should you bring to the first discussion?</h3><ul><li>A brief overview of the business and the structure of the finance team.</li><li>The reporting period to be discussed and the condition of the available data.</li><li>A list of the issues that most hinder the work.</li><li>Objectives, deadlines, and who will use the results.</li></ul><p>This initial information is used to agree on a reasonable scope. Detailed document requirements are discussed once the business context and confidentiality arrangements are understood.</p><p class="reading-note">This note is an introduction to the discussion. Reporting requirements and the accounting framework are determined according to the entity\'s circumstances and applicable regulations.</p>'},
  'audit':{category:'INTRODUCTORY NOTE / AUDIT',title:'Preparing The Discussion Before An Audit Begins',body:'<p>Early preparation helps the company and the auditor understand the needs of the engagement. The conversation starts with the purpose, the reporting period, and the condition of the available information.</p><h3>Explain the need and the reporting period</h3><p>Share why the company needs an audit, which statements will be audited, and who will use the auditor\'s report. Also mention any deadlines that need to be considered.</p><h3>Describe the reporting process</h3><p>Explain the bookkeeping system, the team responsible, and the status of the financial statements. Mention any changes in the business or data issues that may affect the engagement.</p><h3>What can be prepared?</h3><ul><li>An overview of the business, entity structure, and contact person.</li><li>The reporting period and the availability of financial records.</li><li>Information on any previous auditor engagement.</li><li>The intended use of the report and the expected timeline.</li></ul><p>The detailed document list and work schedule are discussed after the acceptance evaluation and engagement agreement. Document readiness does not determine or guarantee the type of opinion that will be issued.</p><p class="reading-note">This note is an introduction to communication. The audit is performed in accordance with professional standards and the results of the engagement evaluation.</p>'},
  'tax':{category:'INTRODUCTORY NOTE / TAX',title:'Bringing Context Into A Tax Discussion',body:'<p>A tax discussion requires an understanding of the business and the transactions in question. Explaining the context early helps determine what information needs to be reviewed.</p><h3>Start with the transaction or the issue</h3><p>Describe what happened, when the transaction took place, and the parties involved. Separate facts supported by documents from assumptions or explanations that have not yet been verified.</p><h3>Explain the stage you are at</h3><p>Share whether your need relates to transaction planning, administrative organisation, a compliance review, or clarification of a particular document. Include any known deadlines.</p><h3>Preparing for the first conversation</h3><ul><li>An overview of the business and the type of transactions to be discussed.</li><li>The period of concern.</li><li>A list of available documents, without sending confidential data through a public form.</li><li>Your questions and the outcome you expect from the discussion.</li></ul><p>Documents, relevant regulations, and alternative steps are reviewed in context. A conclusion for one transaction cannot automatically be applied to another.</p><p class="reading-note">This note is a guide to preparing a discussion, not a determination of tax obligations. Analysis of a specific case requires the relevant documents and regulations.</p>'},
  'privasi':{category:'WEBSITE INFORMATION',title:'Privacy & Communication',body:'<p>This website introduces the professional profile of Hendrawanto and provides a way to start a conversation.</p><h3>Contact form</h3><p>The name, topic, and message you enter are used on your device to compose a WhatsApp message link. This website does not send your entries to its own database. The message is only sent to the recipient after you choose to send it in WhatsApp.</p><h3>Links to other services</h3><p>Links to WhatsApp, email, YouTube, Instagram, and the KAP website open separate services. Use of those services is subject to their providers\' settings and policies.</p><h3>Confidentiality of information</h3><p>Please use the form only for a general overview. Financial documents, other people\'s personal data, or confidential information should be shared through channels agreed after the initial contact.</p><h3>YouTube videos</h3><p>Videos are shown through YouTube\'s embedded player on the youtube-nocookie.com domain. When the player is loaded or used, YouTube may receive technical information and process data according to its policies. You can also open the videos directly through the links provided.</p><h3>Website usage</h3><p>With visitor permission, public pages use Google Analytics for visit statistics and approximate locations. The tag is not loaded before you allow statistics. You can change your choice through Statistics preferences in the footer. The website analytics code does not send form contents. See the <a href="/en/privasi/">full privacy and statistics information</a>. Video players and hosting are third-party services with their own policies.</p><p>For questions about communication, contact <a href="mailto:info@hendrawanto.com">info@hendrawanto.com</a>.</p>'}
};
const dialog=document.getElementById('reading-dialog');
document.querySelectorAll('[data-article]').forEach(button=>button.addEventListener('click',()=>{const article=articles[button.dataset.article];document.getElementById('reading-category').textContent=article.category;document.getElementById('reading-title').textContent=article.title;document.getElementById('reading-body').innerHTML=article.body;dialog.showModal();dialog.scrollTop=0;}));
document.getElementById('close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();}});

document.getElementById('contact-form').addEventListener('submit',event=>{
  event.preventDefault();
  const nameInput=document.getElementById('contact-name');
  const messageInput=document.getElementById('contact-message');
  const service=document.getElementById('contact-service').value;
  const name=nameInput.value.trim();const message=messageInput.value.trim();
  if(!name){nameInput.setCustomValidity('Please enter your name.');nameInput.reportValidity();return;}
  if(!message){messageInput.setCustomValidity('Please give a brief description of your needs.');messageInput.reportValidity();return;}
  const text='Hello Mr. Hendrawanto, my name is '+name+'.\n\nI would like to discuss '+service+'.\n\n'+message+'\n\nI am contacting you through your personal website.';
  const url='https://wa.me/6287790487353?text='+encodeURIComponent(text);
  const fallback=document.getElementById('whatsapp-fallback');fallback.href=url;fallback.hidden=false;
  document.getElementById('form-status').textContent='Your message is ready. If WhatsApp did not open, use the link below.';
  window.open(url,'_blank','noopener,noreferrer');
});
['contact-name','contact-message'].forEach(id=>document.getElementById(id).addEventListener('input',event=>event.target.setCustomValidity('')));
document.getElementById('year').textContent=new Date().getFullYear();
document.querySelectorAll('.nav-drop-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const o=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(o));b.parentElement.classList.toggle('open',o);}));
document.addEventListener('click',e=>{if(!e.target.closest('.nav-dropdown'))document.querySelectorAll('.nav-dropdown.open').forEach(d=>{d.classList.remove('open');d.querySelector('button').setAttribute('aria-expanded','false');});});

/* Count-up animation for track record stats */
(function(){
  var els=document.querySelectorAll('.track-stats strong');
  if(!els.length||!('IntersectionObserver' in window)) return;
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  els.forEach(function(el){
    var m=el.textContent.trim().match(/^(\d+)(.*)$/); if(!m) return;
    el.dataset.target=m[1]; el.dataset.suffix=m[2]; el.textContent='1'+m[2];
  });
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return; io.unobserve(en.target);
      var el=en.target, target=+el.dataset.target, suf=el.dataset.suffix||'', dur=1600, t0=null;
      if(!target){return;}
      function step(ts){ if(t0===null)t0=ts; var p=Math.min((ts-t0)/dur,1), e=1-Math.pow(1-p,3);
        el.textContent=Math.max(1,Math.round(1+(target-1)*e))+suf; if(p<1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  },{threshold:.4});
  els.forEach(function(el){ if(el.dataset.target) io.observe(el); });
})();
