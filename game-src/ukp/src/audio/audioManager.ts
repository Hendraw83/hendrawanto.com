type AudioKind="correct"|"wrong"|"warning"|"win"|"lose";

class AudioManager{
  private context:AudioContext|null=null;
  private muted=false;
  async enable(){
    if(!this.context)this.context=new AudioContext();
    if(this.context.state==="suspended")await this.context.resume();
  }
  setMuted(value:boolean){this.muted=value;}
  isMuted(){return this.muted;}
  async play(kind:AudioKind){
    if(this.muted)return;
    await this.enable();
    const context=this.context;if(!context)return;
    const patterns:Record<AudioKind,Array<[number,number,number]>>={
      correct:[[523,0,.1],[659,.11,.12],[784,.23,.16]],
      wrong:[[220,0,.13],[165,.15,.2]],
      warning:[[880,0,.08]],
      win:[[523,0,.12],[659,.13,.12],[784,.26,.12],[1046,.4,.35]],
      lose:[[294,0,.14],[247,.16,.14],[196,.32,.3]],
    };
    const now=context.currentTime;
    for(const [frequency,offset,duration] of patterns[kind]){
      const oscillator=context.createOscillator();
      const gain=context.createGain();
      oscillator.type=kind==="warning"?"square":"sine";
      oscillator.frequency.value=frequency;
      gain.gain.setValueAtTime(0.0001,now+offset);
      gain.gain.exponentialRampToValueAtTime(kind==="warning"?.08:.14,now+offset+.012);
      gain.gain.exponentialRampToValueAtTime(0.0001,now+offset+duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now+offset);oscillator.stop(now+offset+duration+.02);
    }
  }
}

export const audioManager=new AudioManager();
