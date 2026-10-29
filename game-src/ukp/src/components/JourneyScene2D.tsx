import type {CSSProperties} from "react";
import {GAME_CONFIG} from "../config/gameConfig";
import type {LeaderboardEntry,MotionCue} from "../game/types";
import {displayPlayerName} from "../player/playerName";

function MountainIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 19 8.2 6.5l3.1 6L14 9l7 10H3Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>}
function TrophyIcon(){return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 8h16v10c0 7-3.6 11-8 11s-8-4-8-11V8Zm8 21v7m-8 4h16M11 11H6v6c0 4 3 6 8 6m23-12h5v6c0 4-3 6-8 6" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
function FlagIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4m0 1c5-3 8 3 14 0v9c-6 3-9-3-14 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}

function TopPlayers({entries}:{entries:LeaderboardEntry[]|null}){
  const rows=(entries??[]).slice(0,5);
  return <div className="journey-top5" aria-label="5 pemain terbaik">
    <b className="journey-top5-title">5 Pemain Terbaik</b>
    {entries===null?<p className="journey-top5-empty">Memuat…</p>:rows.length===0?<p className="journey-top5-empty">Belum ada pemain. Jadilah yang pertama!</p>:
    <table><thead><tr><th scope="col">No.</th><th scope="col">Nama</th><th scope="col">Nilai</th></tr></thead>
      <tbody>{rows.map((row,index)=><tr key={row.id}><td>{index+1}</td><td><span>{row.displayName}</span></td><td>{row.score}</td></tr>)}</tbody></table>}
  </div>;
}

export function JourneyScene2D({position,playerName,motion="idle",preview=false,topPlayers}:{position:number;playerName:string;motion?:MotionCue;preview?:boolean;topPlayers?:LeaderboardEntry[]|null}){
  const safe=Math.max(0,Math.min(GAME_CONFIG.stairCount,position));
  const name=displayPlayerName(playerName);
  const sectorStart=safe===0?1:Math.floor((safe-1)/10)*10+1;
  const sectorEnd=Math.min(GAME_CONFIG.stairCount,sectorStart+9);
  const steps=Array.from({length:sectorEnd-sectorStart+1},(_,index)=>({number:sectorStart+index,index}));
  const localIndex=safe===0?-1:Math.max(0,Math.min(9,safe-sectorStart));
  const gateIndex=GAME_CONFIG.winScore-sectorStart;
  const remaining=GAME_CONFIG.stairCount-safe;
  const destination=safe<GAME_CONFIG.winScore?`${GAME_CONFIG.winScore-safe} menuju gerbang`:`${remaining} menuju puncak`;
  const avatarStyle={left:`${safe===0?5.5:5.5+localIndex*7.7}%`,bottom:`${safe===0?14:19+localIndex*4.1}%`} as CSSProperties;
  const isCorrectReaction=motion==="climb"||motion==="celebrate";
  const isSadReaction=motion==="disappointed";
  const avatarLabel=isCorrectReaction?`AvatarMu berada di tangga ${safe} dan memberi jempol karena jawaban benar`:isSadReaction?`AvatarMu berada di tangga ${safe} dan menunjukkan ekspresi sedih karena jawaban salah`:`AvatarMu berada di tangga ${safe}`;
  return <section className={`journey-card ${preview?"journey-preview":""}`} aria-label={`Perjalanan ${name}, posisi ${safe} dari ${GAME_CONFIG.stairCount} tangga`}>
    <div className="journey-kicker"><MountainIcon/><span>PERJALANAN {name.toLocaleUpperCase("id-ID")}</span></div>
    <span className="journey-level">LEVEL A</span>
    <div className="journey-heading"><h2>Puncak menunggumu.</h2><p>Daki Menuju Puncak</p><span>SEKTOR {sectorStart}–{sectorEnd}</span></div>
    <div className="journey-sun" aria-hidden="true"><TrophyIcon/><b>PUNCAK</b><small>100</small></div>
    <span className="journey-cloud cloud-one" aria-hidden="true"/><span className="journey-cloud cloud-two" aria-hidden="true"/>
    <div className="journey-plane" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}airplane-blue-white-gold.webp`} alt=""/></div>
    <div className="journey-birds" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}bird-blue-gold.webp`} alt=""/></div>
    <div className="journey-stairs" aria-hidden="true">{steps.map(step=><div key={step.number} className={`journey-step ${step.number<=safe?"is-done":""} ${step.number===safe?"is-current":""} ${step.number===GAME_CONFIG.winScore?"is-gate-step":""}`} style={{left:`${8+step.index*7.7}%`,bottom:`${17+step.index*4.1}%`} as CSSProperties}><span>{step.number%2===0||step.number===sectorEnd?step.number:""}</span></div>)}</div>
    {gateIndex>=0&&gateIndex<10&&<div className={`journey-gate ${safe>=GAME_CONFIG.winScore?"is-open":""}`} style={{left:`${8+gateIndex*7.7}%`,bottom:`${19+gateIndex*4.1}%`} as CSSProperties} aria-label={safe>=GAME_CONFIG.winScore?"Gerbang Kemenangan Dasar terbuka":"Gerbang Kemenangan Dasar terkunci"}><span className="gate-title">GERBANG 60</span><i className="gate-post gate-post-left"/><i className="gate-post gate-post-right"/><i className="gate-top"/><i className="gate-leaf gate-leaf-left"/><i className="gate-leaf gate-leaf-right"/><em/></div>}
    <div className={`journey-pet motion-${motion}`} style={avatarStyle} role="img" aria-label={avatarLabel}>{isCorrectReaction&&<span className="pet-reaction pet-reaction-correct" aria-hidden="true"><span>👍</span><b>MANTAPPP!</b></span>}{isSadReaction&&<span className="pet-reaction pet-reaction-sad" aria-hidden="true"><span>😢</span></span>}<div className="pet-reference-crop"><img src={`${import.meta.env.BASE_URL}he-visual-reference.png`} alt=""/></div></div>
    <div className="journey-position"><span>Posisi {name}</span><strong>{safe}</strong><small>/ {GAME_CONFIG.stairCount} tangga</small></div>
    {topPlayers!==undefined&&<TopPlayers entries={topPlayers}/>}
    <div className="journey-destination"><FlagIcon/><span>{safe>=GAME_CONFIG.stairCount?"Puncak tercapai":destination}</span></div>
    <div className="journey-progress" aria-hidden="true"><span style={{width:`${safe}%`}}/></div>
  </section>;
}
