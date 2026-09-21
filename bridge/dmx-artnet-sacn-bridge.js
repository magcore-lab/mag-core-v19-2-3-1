class DMXEngine {
  constructor(){ this.universes=new Map(); this.smooth=new Map(); this.quantumAlpha=0.12; }
  getUniverse(u){ if(!this.universes.has(u)){ this.universes.set(u,new Uint8Array(513)); } return this.universes.get(u); }
  setChannel(universe,ch,value){
    const validU=security.validateUniverse(universe);
    const validCh=security.validateChannel(ch);
    if(validU===null||validCh===null) return;
    const v=security.clampDMX(value);
    const key=`${validU}:${validCh}`;
    const prev=this.smooth.get(key)??v;
    const quantum = prev + (v - prev) * this.quantumAlpha;
    this.smooth.set(key, quantum);
    const uni=this.getUniverse(validU);
    uni[validCh]=Math.floor(quantum);
  }
