import { GlobalNodeNames } from "../global_node";


let ANIM_TAG = 10087;

let ScaleSize = 0.5;

export enum WindowStyle {
    POPUP,
    NORMAL,
};
const {ccclass, property} = cc._decorator;
@ccclass
export abstract class BaseDialog extends cc.Component{
    private u_administrator:any = null;
    private u_inAbc:boolean = false;
    private _lab:any = "";
    public get tag(){return this._lab;}
    protected iofRaw:boolean = false;

    @property({
        type:cc.Enum(WindowStyle),
        tooltip:"弹窗样式,POPUP有弹窗动画，NORMAL直接显示"
    })
    public style:WindowStyle = WindowStyle.POPUP;
    @property({
        tooltip:"是否点击背后隐藏"
    })
    public closeByTouchBg = true;
    @property({
        tooltip:"是否点击返回键隐藏"
    })
    public closeByTouchBack = true;
    @property(cc.Vec2)
    private offset = cc.v2(0,0);
    @property({
        tooltip:"黑色半透明遮罩的透明度"
    })
    public maskOpacity = 128;
    @property({
        tooltip:"是否全屏"
    })
    public isCompletely = false;

    public get isPuAbc(){
        return this.u_inAbc;
    }

    static async create<T>(pfb:string|cc.Prefab,param?:T|any,...args):Promise<BaseDialog>{
        return null;
    }

    onLoad(){
        if(this.isCompletely){
            this.node.width = display.width;
            this.node.height = display.height;
        }else{
            this.node.position = new cc.Vec3(this.offset.x,this.offset.y);
        }
    }
    onDestroy(){
        this.exitView();
        
    }

    onPreDestroy(){

    }

    protected getAbcDemonstrate():cc.ActionInterval{
        return null;
    }

    protected getAbcConceal():cc.ActionInterval{
        return null;
    }

    protected getFffConcealAbc(){
        let $drti = 0.3;
        let abc_01 = cc.scaleTo($drti,ScaleSize);
        abc_01 = abc_01.easing(cc.easeBackIn());
        return abc_01;
    }
    protected getDddDemonstrateAbc(){
        let $drti = 0.3;
        this.node.setScale(ScaleSize);
        let abc_01 = cc.sequence(
            cc.scaleTo(0,ScaleSize),
            cc.scaleTo($drti,1.0).easing(cc.easeBackOut()),
        );
        return abc_01;
    }



    initWindow(manager:any,tag,isPfbRaw:boolean,onLoadComplete:Function){
        this.u_administrator = manager;
        this.u_inAbc = false;
        this._lab = tag;
        this.iofRaw = isPfbRaw;


                onLoadComplete();

    }

    abstract initView(bundleData?:any,arg1?:any,arg2?:any,arg3?:any);
    abstract exitView(bundleData?:any);
    refreshView(bundleData?:any,arg1?:any,arg2?:any,arg3?:any){}
    
    showWindow(bundleData:any,arg1?:any,arg2?:any,arg3?:any){ 
        this.initView(bundleData,arg1,arg2,arg3);

        if(this.u_inAbc || !this.node.active)
            return;
        this.node.setScale(1);
        this.node.stopActionByTag(ANIM_TAG);
        let $opera = this.getAbcDemonstrate();
        if($opera==null&&this.style==WindowStyle.POPUP){
            $opera = this.getDddDemonstrateAbc();
        }
        if($opera){
            $opera.setTag(ANIM_TAG);
            this.u_inAbc = true;
            let putAcros = cc.callFunc(function(){
                this.onShowEnd();
            },this);
            this.node.runAction(cc.sequence($opera,putAcros));
        }else{
            this.onShowEnd();
        }
    }
    onShowEnd(){
        this.u_inAbc = false;
    }
    dismiss(refusalAbc:boolean = false,data?:any){
        if(refusalAbc){
            this.onHideEnd(data);
            return;
        }
        if(this.u_inAbc)
            return;
        this.node.setScale(1);
        this.node.stopActionByTag(ANIM_TAG);

        let $opera = this.getAbcConceal();
        if($opera==null&&this.style==WindowStyle.POPUP){
            $opera = this.getFffConcealAbc();
        }
        if($opera){
            $opera.setTag(ANIM_TAG);
            this.u_inAbc = true;
            let putAcros = cc.callFunc(function(){
                this.onHideEnd(data);
            },this)
            this.node.runAction(cc.sequence($opera,putAcros));
        }else{
            this.onHideEnd(data);
        }
    }

    private _onClosed:Function = null;
    public setOnClosed(func:Function){
        this._onClosed = func;
    }

    protected onHideEnd(data?:any){
        this.u_inAbc = false;
        this.node.active = false;
        if(this._onClosed){
            this._onClosed(this);
            this._onClosed = null;
        }
        if(this.u_administrator&&this.u_administrator.node.active){
            this.u_administrator.onHideEnd(this);
        }
    }

    protected onBtnClose(){
        this.dismiss();
    }
}