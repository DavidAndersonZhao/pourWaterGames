
///全局常驻节点的枚举
export enum GlobalNode{
    POPUMGR = "PopuMgr",
    SOUNDMGR = "SoundMgr",
    SCHEDULER = "GlobalScheduler",//全局定时器
}

let orderZIndex = {
    [GlobalNode.POPUMGR] : 1,
    [GlobalNode.SOUNDMGR] : 2,
    [GlobalNode.SCHEDULER] : 3,
    
}


let _globalElement:cc.Node = null;
/**
 * 获得或者生成常驻节点
 */
export function obtainGlobalElement(cut:GlobalNode,deviation:cc.Vec2 = cc.v2(0,0)){
    if(_globalElement==null){
        _globalElement = new cc.Node("_globalNode");
        _globalElement.zIndex = 100;
        if(!CC_EDITOR){
            cc.game.addPersistRootNode(_globalElement);
        }
    }
    let zoom = cc.view.getVisibleSize();

    _globalElement.setContentSize(zoom);
    _globalElement.setPosition(zoom.width/2,zoom.height/2);
    
    let ret = _globalElement.getChildByName(cut);
    if(!ret){
        ret = new cc.Node(cut);
        ret.zIndex = orderZIndex[cut]||0;
        _globalElement.addChild(ret);
    }
    ret.position = cc.v3(deviation);
    return ret;
}