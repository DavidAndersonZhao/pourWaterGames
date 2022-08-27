import { PopupMgr } from "../dialog/dialog_mgr";
import { DlgYouWin } from "../dialog/dlg_youWIn";
import Cup, { _CupInfo } from "./cup";
import { WaterFlow } from "./waterFlow";

const { ccclass, property,executeInEditMode } = cc._decorator;

const COOKIE_LEVEL = "level"
const COOKIE_LAST_CFG = "last_cfg"
const COOKIE_ACTION_HISTORY = "action_history"

const spacesArr = {
    [1] : [0,1],
    [2] : [80,1],
    [3] : [50,1],
    [4] : [40,0.9],
    [5] : [30,0.8],
    [6] : [30,0.65],
    [7] : [20,0.6,60],
    [8] : [10,0.55,80],
}

@ccclass
@executeInEditMode
export class CupMgrC extends cc.Component{
    @property(cc.JsonAsset)
    private levelCfg:cc.JsonAsset = null;
    @property(cc.Prefab)
    private pfb:cc.Prefab = null;

    private _level = 1;
    private curCfg:Array<_CupInfo> = [];
    private _waterFlow:WaterFlow = null;
    onLoad(){
        if(CC_EDITOR){
            return
        }
        this._level = checkint(cc.sys.localStorage.getItem(COOKIE_LEVEL)||1);
        
        let str = cc.sys.localStorage.getItem(COOKIE_LAST_CFG);
        if(str){
            try{
                this.curCfg = JSON.parse(str);
            }catch(e){
                this.initCfg()
            }
        }else{
            this.initCfg()
        }
        str = cc.sys.localStorage.getItem(COOKIE_ACTION_HISTORY);
        if(str){
            try{
                this._actions = JSON.parse(str);
            }catch(e){

            }
        }
        this.createCups();

        let _node = new cc.Node();
        _node.parent = this.node;
        
        this._waterFlow = _node.addComponent(WaterFlow);
    }

    private initCfg(){
        this.curCfg = [];
        let cfgArr:Array<number> = this.levelCfg.json[this._level-1];//每一关的数据，都是数组，每四个数字代表一杯水
        let acc = 0;
        while(acc<cfgArr.length){
            let info = {
                colorIds:[cfgArr[acc],cfgArr[acc+1]||0,cfgArr[acc+2]||0,cfgArr[acc+3]||0]
            }
            this.curCfg.push(info);
            acc+=4;
        }
    }

    @property private _debugLevel: number = 0;
    @property({ tooltip: CC_DEV && '调试关卡' })
    public get debugLevel() { return this._debugLevel; }
    public set debugLevel(value: number) { 
        this._debugLevel = value;
        this._level = value;
        this.nextLevel()
    }
    
    private _cups:Array<Cup> = [];
    private layout_v:cc.Layout = null;
    private async createCups(){
        if(this.layout_v){
            this.layout_v.node.destroyAllChildren();
        }
        this._cups = [];
        this.selected = null;
        this._actions = [];

        let arr = this.curCfg;
        const len = this.curCfg.length;
        if(len==0){
            return;
        }
        for(let i=0;i<len;i++){
            let info = arr[i];

            let _node = cc.instantiate(this.pfb);
            _node.parent = this.node;
            let _cup = _node.getComponent(Cup)
            _cup.setCupInfo(info,this.onClickCup.bind(this));
            this._cups.push(_cup)
        }

        function _createLayout(type:cc.Layout.Type,parent:cc.Node,name?:string) {
            let node = new cc.Node(name);
            node.parent = parent;
            let layout = node.addComponent(cc.Layout);
            layout.type = type;
            layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            return layout
        }
        if(this.layout_v==null){
            this.layout_v = _createLayout(cc.Layout.Type.VERTICAL,this.node,"layout_v");
            this.layout_v.node.zIndex = 1;
        }
                
        let cupSize = this._cups[0].node.getContentSize();
        let cupIdxGroups:Array<Array<number>> = [];
        if(len<=4){
            let idGroup:Array<number> = [];
            for(let i=0;i<this._cups.length;i++){
                idGroup.push(i);
            }
            cupIdxGroups.push(idGroup);
        }else if(len<=15){
            let idGroup:Array<number> = [];
            let i=0;
            let middleId = (len)/2;
            for(;i<middleId;i++){
                idGroup.push(i);
            }
            cupIdxGroups.push(idGroup);
            idGroup = [];
            
            for(;i<len;i++){
                idGroup.push(i);
            }
            cupIdxGroups.push(idGroup);
            idGroup = [];
        }

        let layoutArr:Array<cc.Layout> = [];
        let maxNum = 1;
        for(let i = 0;i<cupIdxGroups.length;i++){
            let node_layout_h = _createLayout(cc.Layout.Type.HORIZONTAL,this.layout_v.node,`layout_h_${i}`);
            node_layout_h.node.height = cupSize.height;
            let idGroup = cupIdxGroups[i];
            for(let j=0;j<idGroup.length;j++){
                let id = idGroup[j];
                this._cups[id].node.parent = node_layout_h.node;
            }
            maxNum = Math.max(maxNum,node_layout_h.node.childrenCount);
            let spaceX = spacesArr[maxNum][0];
            if(spaceX!=node_layout_h.spacingX){
                node_layout_h.spacingX = spaceX;
            }
            layoutArr.push(node_layout_h);
        }

        this.layout_v.enabled = true;
        this.layout_v.node.scale = spacesArr[maxNum][1];
        this.layout_v.spacingY = spacesArr[maxNum][2]||40;

        for(let layout of layoutArr){
            layout.updateLayout();
            layout.enabled = false;
        }
        this.layout_v.updateLayout();
        this.layout_v.enabled = false;
        for(let cup of this._cups){
            (cup as any).orignPt = cup.node.position;
        }
    }

    private selected:Cup = null;
    private onClickCup(cup:Cup){
        if(this.selected){
            if(this.selected==cup){
                this.doSelect(cup,false);
                this.selected = null;
            }else if(this.checkPour(this.selected,cup)){
                this.startPour(this.selected,cup);
            }else{
                this.doSelect(this.selected,false);
                this.selected = null;
            }
        }else{
            this.selected = cup;
            this.doSelect(cup,true);
        }
            
    }

    private checkPour(src:Cup,dst:Cup){
        let srcTop = src.getTop();
        let dstTop = dst.getTop();
        if(srcTop.topColorId==0){
            return false;
        }
        if(dstTop.topColorId==0){
            return true;
        }
        return srcTop.topColorNum<=dstTop.emptyNum;
    }

    private startPour(src:Cup,dst:Cup){
        dst.node.zIndex = 0;
        dst.node.parent.zIndex = 0;
        src.node.zIndex = 10;
        src.node.parent.zIndex = 10;
        let srcTop = src.getTop();
        let dstPt = cc.v2(dst.node.position);
        let dstGlobal = dst.node.parent.convertToWorldSpaceAR(dstPt)
        let viewSize = cc.view.getVisibleSize()
        let isRight = dstGlobal.x>viewSize.width*0.5;
        if(Math.abs(dstGlobal.x-viewSize.width*0.5)<2){
            let srcPt = src.node.parent.convertToWorldSpaceAR(cc.v2(src.node.position));
            isRight = srcPt.x<viewSize.width*0.5;
        }
        dstPt.y += 60 + dst.node.height*0.5;
        let offsetX = 0
        dstPt.x = dstPt.x + (isRight?-offsetX:offsetX);

        dstPt = dst.node.parent.convertToWorldSpaceAR(dstPt);
        

        src.setPourAnchor(isRight)
        dstPt = src.node.parent.convertToNodeSpaceAR(dstPt);

        const flow = this._waterFlow;
        flow.setLineScale(this.layout_v.node.scale)
        const onPourStart = ()=>{
            let startPt = src.node.convertToWorldSpaceAR(cc.v2())
            startPt = flow.node.parent.convertToNodeSpaceAR(startPt);
            let endPt = cc.v2(startPt.x,dst.getWaterSurfacePosY());
            endPt = flow.node.parent.convertToNodeSpaceAR(endPt);
            endPt.x = startPt.x

            flow.strokeColor = new cc.Color().fromHEX(srcTop.colorHex);
            
            flow.playFlowAni(startPt,endPt,0.2,false,()=>{
                dst.startAddWater(srcTop.topColorId,srcTop.topColorNum,(cup:Cup,isFinished:boolean)=>{
                    this.onPourOneFinished(src,dst,srcTop.topColorId,srcTop.topColorNum);
                });
            })
        }

        function onPourFinish() {
            let startPt = src.node.convertToWorldSpaceAR(cc.v2())
            startPt = flow.node.parent.convertToNodeSpaceAR(startPt);

            let endPt = cc.v2(startPt.x,dst.getWaterSurfacePosY(true));
            endPt = flow.node.parent.convertToNodeSpaceAR(endPt);
            endPt.x = startPt.x
            
            flow.playFlowAni(startPt,endPt,0.2,true,()=>{
                flow.clear();
            })

            src.setNormalAnchor();

            let pt = (src as any).orignPt;
            let moveBack = cc.tween(src.node)
                .delay(0.7)
                .to(0.5,{x:pt.x,y:pt.y,angle:0},{easing:"sineOut"})
                .call(()=>{
                    src.node.zIndex = 0;
                    src.node.parent.zIndex = 0;
                })
            moveBack.start();
        }
        this.selected = null;

        src.moveToPour(dstPt,isRight,onPourStart.bind(this),onPourFinish.bind(this));
    }

    private doSelect(cup:Cup,bool:boolean){
        let pt = (cup as any).orignPt;
        let y = pt.y+(bool?cup.node.height*0.2:0);
        cc.tween(cup.node).stop();
        cc.tween(cup.node).to(0.2,{y:y}).start();
    }

    private _actions:Array<Action> = [];
    private onPourOneFinished(from:Cup,to:Cup,colorId:number,num:number){
        let fromCupIdx = this._cups.indexOf(from);
        let toCupIdx = this._cups.indexOf(to);
        if(this._actions.length==5){
            this._actions.shift()
        }
        this._actions.push({
            from:fromCupIdx,
            to:toCupIdx,
            colorId:colorId,
            num:num
        })

        let isAllFinished = this.checkIsAllFinished();
        if(isAllFinished){
            cc.log("---------完成了")
            this._level++;
            cc.sys.localStorage.setItem(COOKIE_LEVEL,this._level);
            
            this.node.emit("level_finish")
        }else{
            this.node.emit("do_pour")
        }
        cc.sys.localStorage.setItem(COOKIE_LAST_CFG,JSON.stringify(this.curCfg));
        cc.sys.localStorage.setItem(COOKIE_ACTION_HISTORY,JSON.stringify(this._actions));
    }

    public getActionNum(){
        return this._actions.length;
    }

    public undoAction(){
        let action = this._actions.pop();
        if(action==null){
            return false;
        }
        let {from,to,num,colorId} = action;
        let toCup = this._cups[to];
        let fromCup = this._cups[from];
        if(toCup.isPouring()||fromCup.isPouring()){
            return false;
        }
        toCup.removeTopWaterImmediately(num);
        fromCup.addWaterImmediately(colorId,num);

        return true;
    }
    
    public nextLevel(){
        this.initCfg();
        this.createCups();
    }

    public getLevel(){
        return this._level;
    }

    private checkIsAllFinished(){
        for(let cup of this._cups){
            if(!cup.checkIsFinshed()){
                return false
            }
        }
        return true;
    }
}

interface Action{
    from:number,
    to:number,
    num:number,
    colorId:number,
}

async function wait(sec:number) {
    return new Promise(function (resolve,reject) {
        setTimeout(() => {
            resolve(null);
        }, sec*1000);
    })
}

function checkint(val){
    if(val==null){
        return 0;
    }
    let ret = parseInt(val);
    if(ret==NaN){
        ret = 0;
    }
    return ret;
}