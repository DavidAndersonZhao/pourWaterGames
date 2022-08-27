
import { createColorSpriteFrame } from "./function";

export class LayerColor extends cc.Node{
    private sprite:cc.Sprite = null;
    constructor(color = cc.color(255,255,255)){
        super();
        this.sprite = this.addComponent(cc.Sprite);
        this.sprite.spriteFrame = createColorSpriteFrame();
        this.color = color;
    }

    fadeTo(time:number,opacity:number,fromOpacity = null){
        if(fromOpacity){
            this.opacity = fromOpacity;
        }
        this.runAction(cc.fadeTo(time,opacity))
    }

    fadeIn(time:number){
        this.stopAllActions();
        this.runAction(cc.fadeIn(time))
    }

    fadeOut(time:number){
        this.stopAllActions();
        this.runAction(cc.fadeOut(time))
    }
}