import { SceneNames } from "./data/const";
import { ScreenAdapter, ScreenFit } from "./utils/screen_adapt";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LaunchScene extends cc.Component {


    onLoad () {
        ScreenAdapter.adaptScreenSize(this.node, ScreenFit.SHOW_ALL);
        ScreenAdapter.adaptScreenSize(this.node.getChildByName('bg'), ScreenFit.NO_BORDER);
        
        displayInit();
    }

    start () {
        cc.director.preloadScene(SceneNames.play,null,()=>{
            cc.director.loadScene(SceneNames.play);
        })
    }

}


function displayInit(){
    let getFrameSize = cc.view.getFrameSize();
    let getCanvasSize = cc.view.getCanvasSize();
    let getScaleX = cc.view.getScaleX();
    let getScaleY = cc.view.getScaleY();
    let getDesignResolutionSize = cc.view.getDesignResolutionSize();
    let getVisibleSize = cc.view.getVisibleSize();
    let getDevicePixelRatio = cc.view.getDevicePixelRatio();
    cc.log("--------cc.view",JSON.stringify({
        getFrameSize:getFrameSize,
        getCanvasSize:getCanvasSize,
        getScaleX:getScaleX,
        getScaleY:getScaleY,
        getDesignResolutionSize:getDesignResolutionSize,
        getVisibleSize:getVisibleSize,
        getDevicePixelRatio:getDevicePixelRatio,
    },null,"  "))

    display.width = getVisibleSize.width;
    display.height = getVisibleSize.height;
    display.cx = display.width*0.5;
    display.cy = display.height*0.5;
    display.gapHeight = getVisibleSize.height - getDesignResolutionSize.height;
    
    let langCode = cc.sys.languageCode.toLowerCase();
    langCode = langCode.replace("-","_");
    let arr = langCode.split("_");
    let lang = arr[0];
    let region = langCode.substring(lang.length);
    if(region.substr(0,1)=="_"){
        region = region.substring(1)
    }
    display.sys_lang = lang;
    if(lang=="zh"){
        region = region.replace("hans","");
        region = region.replace("hant","");
        region = region.replace("#","");
        region = region.replace("_","");
        region = region.replace("-","");
        region = region.replace("=","");
    }
    display.sys_region = region
    display.sys_langCode = lang+"_"+region;
    
    let visible = cc.view.getVisibleSize();
    let design = cc.Canvas.instance.designResolution;
    display.screenScale = cc.v2(visible.width / design.width, visible.height / design.height)
    display.aspectRatio = visible.height/visible.width;
    display.isLongScreen = display.aspectRatio>=2.0
    cc.log("================display start=============")
    for(let k of Object.keys(display)){
        cc.log(`------------display.${k} = ${display[k]}`)
    }
    cc.log("================display end=============")
}