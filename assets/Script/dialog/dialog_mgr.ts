import { getGlobalNode, GlobalNodeNames } from "../global_node";
import { LayerColor } from "../utils/layer_color";
import { BaseDialog, WindowStyle } from "./base_dialog";


export interface ShowWindowArgs{
    style?:WindowStyle,
    maskOpacity?:number,
    
    closeByTouchBg?:boolean,
    closeByTouchBack?:boolean,
}

const {ccclass, property} = cc._decorator;


function aplWt(node:cc.Node){
    let wiet =  node.getComponent(cc.Widget);
    if(wiet==null){
        wiet = node.addComponent(cc.Widget);
    }
    wiet.bottom = 0;
    wiet.top = 0;
    wiet.left = 0;
    wiet.right = 0;
    wiet.isAlignBottom = true;
    wiet.isAlignTop = true;
    wiet.isAlignLeft = true;
    wiet.isAlignRight = true;

    wiet.updateAlignment();
}

export class Ppr extends cc.Component{
    static EVT_POPO_OPEN_FRIST = "EVT_POPO_OPEN_FRIST";
    static EVT_POPO_CLOSE_LAST = "EVT_POPO_CLOSE_LAST";
    static getInstance():Ppr{
        let $point = getGlobalNode(GlobalNodeNames.PopuMgr);
        let reeee = $point.getComponent(Ppr)
        if(reeee==null){
            aplWt($point);
            reeee = $point.addComponent(Ppr)
            reeee.createMaskNode();
        }
        return reeee;
    }
    @property
    $ppps:Array<BaseDialog> = []

    onLoad(){

    }
    onDestroy(){

    }

    private metBb:LayerColor = null;
    private createMaskNode():LayerColor{
        this.metBb = new LayerColor(cc.color(0,0,0));
        this.metBb.opacity = 0;
        this.metBb.parent = this.node;
        return this.metBb;
    }

    async showWindow<T>(pdate:string|cc.Prefab,bundleData?:T|any,...args):Promise<BaseDialog>{
        return new Promise<BaseDialog>((resolve,reject)=>{
            if(pdate==null){
                reject();
                return;
            }
            let _prefab:cc.Prefab;
            if(pdate instanceof cc.Prefab){
                _prefab = pdate;
            }else if(typeof(pdate)=="string" ){
    
            }
            if(_prefab!=null){
                let popu = this.createWindowByPrefab(_prefab,_prefab.name,false,bundleData,...args);
                resolve(popu);
            }else{
                let path = pdate as string;
                if(!path){
                    reject();
                    return;
                }
                let pppsu = Ppr.getInstance().getWindowByTag(path);
                if(pppsu){
                    pppsu.refreshView(bundleData,...args);
                    pppsu.node.zIndex++;
                    cc.log("========弹窗",pppsu.node.name,pppsu.node.zIndex)
                    resolve(pppsu);
                    return;
                }
                let url = path;
                _prefab = cc.resources.get(url,cc.Prefab) as cc.Prefab;
                if(_prefab){
                    setTimeout(()=>{
                        let pppsu = this.createWindowByPrefab(_prefab,path,true,bundleData,...args);
                        resolve(pppsu);
                    })
                }else{
                    cc.resources.load(url,cc.Prefab,(error,_prefab:cc.Prefab)=>{
                        if(error){
                            cc.error("---------弹窗加载错误",error)
                            reject();
                            return;
                        }
                        cc.log("---------------load prefab success",path)
                        let pppsu = this.createWindowByPrefab(_prefab,path,true,bundleData,...args);
                        resolve(pppsu);
                    });
                }
                    
            }
        }); 
    }

    private createWindowByPrefab(_prefab:cc.Prefab,tag:string,isPfbRaw:boolean,bundleData:any,...args):BaseDialog{
        if(!cc.isValid(this)){
            return null;
        }
        let pppsu = Ppr.getInstance().getWindowByTag(tag);
        if(pppsu){
            pppsu.refreshView(bundleData,...args);
            return null;
        }
        let node = cc.instantiate(_prefab);
        if(node==null){
            cc.log("弹窗预制文件不存在");
            return null;
        }
        node.setPosition(0,0);
        let ppppsu = node.getComponent(BaseDialog);
        if(!ppppsu){
            cc.log("--------error prefab弹窗异常",tag);
            return null;
        }
        ppppsu.initWindow(this,tag,isPfbRaw,()=>{
            this.realShow(ppppsu,bundleData,...args);
        });
        return ppppsu
    }

    private $iMsn = false;
    private realShow(ppppsu:BaseDialog,bundleData:any,...args){
            this.metBb.off(cc.Node.EventType.TOUCH_START,this.onBgTouch,this);
            this.metBb.on(cc.Node.EventType.TOUCH_START,this.onBgTouch,this);
            if(ppppsu.maskOpacity){
                let fadetime = ppppsu.style==WindowStyle.POPUP?0.2:0;
                if(cc.director.isPaused()){
                    this.metBb.opacity = ppppsu.maskOpacity;
                }else{
                    this.metBb.fadeTo(fadetime,ppppsu.maskOpacity,0);
                }
                
            }
            
            this.$iMsn = true;
        let sfirst = 0;
        if(this.$ppps.length==0){
            this.node.emit(Ppr.EVT_POPO_OPEN_FRIST);
        }else{
            sfirst = this.$ppps[this.$ppps.length-1].node.zIndex;
        }
        this.metBb.zIndex = (sfirst)
        this.metBb.setSiblingIndex(sfirst+1)
        ppppsu.node.zIndex = sfirst+1;
        this.node.addChild(ppppsu.node);
        ppppsu.showWindow(bundleData,...args);

        this.$ppps.push(ppppsu);
    }

    onBgTouch(event:cc.Event.EventTouch){
        for(let i=this.$ppps.length-1;i>=0;i--){
            let ppppsu = this.$ppps[i];
            if(cc.isValid(ppppsu.node)&&ppppsu.node.active){
                if(ppppsu.closeByTouchBg&&!ppppsu.isPuAbc){
                    ppppsu.dismiss();
                }
                return;
            }
        }
    }

    onBack(){
        let ret = false
        if(!cc.isValid(this)||!this.node.active)
            return ret;
        for(let i=this.$ppps.length-1;i>=0;i--){
            do{
                let ppppsu = this.$ppps[i];
                if(!cc.isValid(ppppsu.node))
                    break;
                if(!ppppsu.node.active){
                    break;
                }else if(!ppppsu.closeByTouchBack||ppppsu.isPuAbc){
                    ret = true;
                }else{
                    ret = true;
                    ppppsu.dismiss();
                }
            }while(false)
            if(ret)
                break;
        }
        return ret
    }
    onHideEnd(ppppsu:BaseDialog){
        for(let i = 0;i<this.$ppps.length;i++){
            if(this.$ppps[i]===ppppsu){
                this.$ppps.splice(i,1);
                ppppsu.onPreDestroy();
                ppppsu.node.destroy();
                break
            }
        }
        if(this.$ppps.length==0){
            this.metBb.zIndex = (0)
        }else{
            let sfirst = this.$ppps[this.$ppps.length-1].node.zIndex-1;
            if(sfirst<0){
                sfirst = 0;
            }
            this.metBb.zIndex = (sfirst);
            this.$ppps[this.$ppps.length-1].node.zIndex = (sfirst+1)
        }
        

        if(this.$ppps.length==0){
            if(cc.director.isPaused()){
                this.metBb.opacity = 0;
            }else{
                this.metBb.fadeOut(ppppsu.style==WindowStyle.POPUP?0.2:0.1);
            }
            this.metBb.off(cc.Node.EventType.TOUCH_START,this.onBgTouch,this);
            this.node.emit(Ppr.EVT_POPO_CLOSE_LAST);
            this.$iMsn = false;
        }
    }
    public getVisibleCount():number{
        let $num = 0;
        for(let _ppppsu of this.$ppps){
            let node = _ppppsu.node;
            if(cc.isValid(node)&&node.active){
                ++$num;
            }
        }
        return $num;
    }
    closeWindowByTag(tag:any,noAnim:boolean = true){
        for(let ppppsu of this.$ppps){
            if(cc.isValid(ppppsu.node)&&ppppsu.tag==tag){
                ppppsu.dismiss(noAnim);
                break;
            }
        }
    }
    getWindowByTag(tag:any):BaseDialog{
        for(let ppppsu of this.$ppps){
            if(cc.isValid(ppppsu.node)&&ppppsu.tag==tag){
                return ppppsu;
            }
        }
        return null;
    }

    removeAllPopup(){
        while(this.$ppps.length>0){
            let ppppsu = this.$ppps[0];
            ppppsu.dismiss(true);
        }
    }
}

BaseDialog.create = function<T>(pfb:string|cc.Prefab,param:T|any,...args):Promise<BaseDialog> {
    return Ppr.getInstance().showWindow(pfb,param,...args)
}