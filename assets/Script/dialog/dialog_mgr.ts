import { obtainGlobalElement, GlobalNode } from "../global_node";
import { LayerColor } from "../utils/layer_color";
import { BaseDialog, WindowStyle } from "./base_dialog";


export interface ShowWindowArgs{
    style?:WindowStyle,
    maskOpacity?:number,
    
    closeByTouchBg?:boolean,
    closeByTouchBack?:boolean,
}

const {ccclass, property} = cc._decorator;


function applyWidget(node:cc.Node){
    let widget =  node.getComponent(cc.Widget);
    if(widget==null){
        widget = node.addComponent(cc.Widget);
    }
    widget.bottom = 0;
    widget.top = 0;
    widget.left = 0;
    widget.right = 0;
    widget.isAlignBottom = true;
    widget.isAlignTop = true;
    widget.isAlignLeft = true;
    widget.isAlignRight = true;

    widget.updateAlignment();
}

export class PopupMgr extends cc.Component{
    static EVT_POPO_OPEN_FRIST = "EVT_POPO_OPEN_FRIST";
    static EVT_POPO_CLOSE_LAST = "EVT_POPO_CLOSE_LAST";
    static getInstance():PopupMgr{
        let _node = obtainGlobalElement(GlobalNode.POPUMGR);
        let ret = _node.getComponent(PopupMgr)
        if(ret==null){
            applyWidget(_node);
            ret = _node.addComponent(PopupMgr)
            ret.createMaskNode();
        }
        return ret;
    }
    @property
    m_popups:Array<BaseDialog> = []

    onLoad(){

    }
    onDestroy(){

    }

    private maskBg:LayerColor = null;
    private createMaskNode():LayerColor{
        this.maskBg = new LayerColor(cc.color(0,0,0));
        this.maskBg.opacity = 0;
        this.maskBg.parent = this.node;
        return this.maskBg;
    }

    async showWindow<T>(param:string|cc.Prefab,bundleData?:T|any,...args):Promise<BaseDialog>{
        return new Promise<BaseDialog>((resolve,reject)=>{
            if(param==null){
                reject();
                return;
            }
            let _prefab:cc.Prefab;
            if(param instanceof cc.Prefab){
                _prefab = param;
            }else if(typeof(param)=="string" ){
    
            }
            if(_prefab!=null){
                let popu = this.createWindowByPrefab(_prefab,_prefab.name,false,bundleData,...args);
                resolve(popu);
            }else{
                let path = param as string;
                if(!path){
                    reject();
                    return;
                }
                let popu = PopupMgr.getInstance().getWindowByTag(path);
                if(popu){
                    popu.refreshView(bundleData,...args);
                    popu.node.zIndex++;
                    cc.log("========弹窗",popu.node.name,popu.node.zIndex)
                    resolve(popu);
                    return;
                }
                let url = path;
                _prefab = cc.resources.get(url,cc.Prefab) as cc.Prefab;
                if(_prefab){
                    setTimeout(()=>{
                        let popu = this.createWindowByPrefab(_prefab,path,true,bundleData,...args);
                        resolve(popu);
                    })
                }else{
                    cc.resources.load(url,cc.Prefab,(error,_prefab:cc.Prefab)=>{
                        if(error){
                            cc.error("---------弹窗加载错误",error)
                            reject();
                            return;
                        }
                        cc.log("---------------load prefab success",path)
                        let popu = this.createWindowByPrefab(_prefab,path,true,bundleData,...args);
                        resolve(popu);
                    });
                }
                    
            }
        }); 
    }

    private createWindowByPrefab(_prefab:cc.Prefab,tag:string,isPfbRaw:boolean,bundleData:any,...args):BaseDialog{
        if(!cc.isValid(this)){
            return null;
        }
        let popu = PopupMgr.getInstance().getWindowByTag(tag);
        if(popu){
            popu.refreshView(bundleData,...args);
            return null;
        }
        let node = cc.instantiate(_prefab);
        if(node==null){
            cc.log("弹窗预制文件不存在");
            return null;
        }
        node.setPosition(0,0);
        let popup = node.getComponent(BaseDialog);
        if(!popup){
            cc.log("--------error prefab弹窗异常",tag);
            return null;
        }
        popup.initWindow(this,tag,isPfbRaw,()=>{
            this.realShow(popup,bundleData,...args);
        });
        return popup
    }

    private _isMaskOn = false;
    private realShow(popup:BaseDialog,bundleData:any,...args){
            this.maskBg.off(cc.Node.EventType.TOUCH_START,this.onBgTouch,this);
            this.maskBg.on(cc.Node.EventType.TOUCH_START,this.onBgTouch,this);
            if(popup.maskOpacity){
                let fadetime = popup.style==WindowStyle.POPUP?0.2:0;
                if(cc.director.isPaused()){
                    this.maskBg.opacity = popup.maskOpacity;
                }else{
                    this.maskBg.fadeTo(fadetime,popup.maskOpacity,0);
                }
                
            }
            
            this._isMaskOn = true;
        let zOrder = 0;
        if(this.m_popups.length==0){
            this.node.emit(PopupMgr.EVT_POPO_OPEN_FRIST);
        }else{
            zOrder = this.m_popups[this.m_popups.length-1].node.zIndex;
        }
        this.maskBg.zIndex = (zOrder)
        this.maskBg.setSiblingIndex(zOrder+1)
        popup.node.zIndex = zOrder+1;
        this.node.addChild(popup.node);
        popup.showWindow(bundleData,...args);

        this.m_popups.push(popup);
    }

    onBgTouch(event:cc.Event.EventTouch){
        for(let i=this.m_popups.length-1;i>=0;i--){
            let popup = this.m_popups[i];
            if(cc.isValid(popup.node)&&popup.node.active){
                if(popup.closeByTouchBg&&!popup.isPupuAni){
                    popup.dismiss();
                }
                return;
            }
        }
    }

    onBack(){
        let ret = false
        if(!cc.isValid(this)||!this.node.active)
            return ret;
        for(let i=this.m_popups.length-1;i>=0;i--){
            do{
                let popup = this.m_popups[i];
                if(!cc.isValid(popup.node))
                    break;
                if(!popup.node.active){
                    break;
                }else if(!popup.closeByTouchBack||popup.isPupuAni){
                    ret = true;
                }else{
                    ret = true;
                    popup.dismiss();
                }
            }while(false)
            if(ret)
                break;
        }
        return ret
    }
    onHideEnd(popup:BaseDialog){
        for(let i = 0;i<this.m_popups.length;i++){
            if(this.m_popups[i]===popup){
                this.m_popups.splice(i,1);
                popup.onPreDestroy();
                popup.node.destroy();
                break
            }
        }
        if(this.m_popups.length==0){
            this.maskBg.zIndex = (0)
        }else{
            let zOrder = this.m_popups[this.m_popups.length-1].node.zIndex-1;
            if(zOrder<0){
                zOrder = 0;
            }
            this.maskBg.zIndex = (zOrder);
            this.m_popups[this.m_popups.length-1].node.zIndex = (zOrder+1)
        }
        

        if(this.m_popups.length==0){
            if(cc.director.isPaused()){
                this.maskBg.opacity = 0;
            }else{
                this.maskBg.fadeOut(popup.style==WindowStyle.POPUP?0.2:0.1);
            }
            this.maskBg.off(cc.Node.EventType.TOUCH_START,this.onBgTouch,this);
            this.node.emit(PopupMgr.EVT_POPO_CLOSE_LAST);
            this._isMaskOn = false;
        }
    }
    public getVisibleCount():number{
        let num = 0;
        for(let _popup of this.m_popups){
            let node = _popup.node;
            if(cc.isValid(node)&&node.active){
                ++num;
            }
        }
        return num;
    }
    closeWindowByTag(tag:any,noAnim:boolean = true){
        for(let popup of this.m_popups){
            if(cc.isValid(popup.node)&&popup.tag==tag){
                popup.dismiss(noAnim);
                break;
            }
        }
    }
    getWindowByTag(tag:any):BaseDialog{
        for(let popup of this.m_popups){
            if(cc.isValid(popup.node)&&popup.tag==tag){
                return popup;
            }
        }
        return null;
    }

    removeAllPopup(){
        while(this.m_popups.length>0){
            let popup = this.m_popups[0];
            popup.dismiss(true);
        }
    }
}

BaseDialog.create = function<T>(pfb:string|cc.Prefab,param:T|any,...args):Promise<BaseDialog> {
    return PopupMgr.getInstance().showWindow(pfb,param,...args)
}