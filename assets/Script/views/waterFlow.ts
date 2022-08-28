
const default_wide = 6;//


export class WaterFlow extends cc.Graphics{
    onLoad(){
        this.lineWidth = default_wide;
        this.lineCap = cc.Graphics.LineCap.ROUND;
    }
    private _toPourtop:cc.Vec2 = cc.v2()
    public get toPt(){
        return this._toPourtop
    }
    public set toPt(val){
        this._toPourtop = val;
        this.clear();
        this.moveTo(this.from.x,this.from.y)
        this.lineTo(this._toPourtop.x,this._toPourtop.y);
        this.stroke();
    }

    private from:cc.Vec2 = cc.v2();
    /**
     * 水流
     * @param from 
     * @param to 
     * @param dur 
     * @param isTail 
     */
    public playWaterAni(from:cc.Vec2,to:cc.Vec2,dur:number,isTail:boolean,onComplete:Function){
        
        this.clear();
        let flow:WaterFlow = this
        
        if(isTail){
            this.from = to;
        }else{
            this.from = from;
        }
        this.moveTo(this.from.x,this.from.y)
        let tw = cc.tween(flow)
        .set({toPt:from})
        .to(dur,{toPt:to})
        .call(onComplete)
        .start();
    }

    public setWireZoom(scale:number){
        this.lineWidth = default_wide*scale;
    }
    public clearnAni(){
        this.clear();
    }
}