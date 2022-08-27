
///全局常驻节点的枚举
export enum GlobalNodeNames{
    PopuMgr = "PopuMgr",
    SoundMgr = "SoundMgr",
    GlobalScheduler = "GlobalScheduler",//全局定时器
}

let zOrder = {
    [GlobalNodeNames.PopuMgr] : 1,
    [GlobalNodeNames.SoundMgr] : 2,
    [GlobalNodeNames.GlobalScheduler] : 3,
    
}


let _globalNode:cc.Node = null;
/**
 * 获得或者生成常驻节点
 */
export function getGlobalNode(type:GlobalNodeNames,offset:cc.Vec2 = cc.v2(0,0)){
    if(_globalNode==null){
        _globalNode = new cc.Node("_globalNode");
        _globalNode.zIndex = 100;
        if(!CC_EDITOR){
            cc.game.addPersistRootNode(_globalNode);
        }
    }
    let size = cc.view.getVisibleSize();

    _globalNode.setContentSize(size);
    _globalNode.setPosition(size.width/2,size.height/2);
    
    let ret = _globalNode.getChildByName(type);
    if(!ret){
        ret = new cc.Node(type);
        ret.zIndex = zOrder[type]||0;
        _globalNode.addChild(ret);
    }
    ret.position = cc.v3(offset);
    return ret;
}