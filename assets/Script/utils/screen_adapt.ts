
const {ccclass, property,menu,executeInEditMode} = cc._decorator;

export enum ScreenFit{
    NO_BORDER,
    SHOW_ALL,
    EXACT_FIT,
}

export class ScreenAdapter{
    public static get canvasSize():cc.Size{
        let ret = cc.view.getCanvasSize();
        do{
            let canvas_node = cc.Canvas.instance.node;
            if(!canvas_node){break;}
            ret = canvas_node.getContentSize();
        }while(false)
        return ret;
    }

    public static get leftTop(): cc.Vec2 {
        let size = this.canvasSize;
        return cc.v2(-size.width * 0.5, size.height * 0.5);
    }

    public static get middleBottom(): cc.Vec2 {
        let size = this.canvasSize;
        let pos =  cc.v2(0, -size.height * 0.5);
        return pos;
    }

    public static get screenScale(){
        let visible = this.canvasSize;
        let design = cc.Canvas.instance.designResolution;
        cc.log(`visibleSize : ${visible.toString()} designSize:${design.toString()}`);
        return cc.v2(visible.width / design.width, visible.height / design.height);
    }

    public static get aspectRatio():number{
        let visible = this.canvasSize;
        let ratio = visible.height/visible.width;
        cc.log(`aspectRatio : ${ratio.toFixed(2)}`);
        return ratio;
    }

    public static get isHigherScreen(): boolean{
        return this.aspectRatio >= 2.0;
    }

    public static adaptScreenSize(cvs_node: cc.Node, screenFit: ScreenFit = ScreenFit.NO_BORDER): void {
        if (cvs_node) {
            let canvas = cvs_node.getComponent(cc.Canvas);
            if (canvas != null) {
                let _screenScale = this.screenScale;
                cc.log("screenScale : ", _screenScale.x.toFixed(2), _screenScale.y.toFixed(2));
                if (screenFit == ScreenFit.NO_BORDER) {
                    let _fitHeight = false;
                    let _fitWidth = false;
                    if (_screenScale.x < _screenScale.y) {
                        _fitHeight = true;
                    } else if (_screenScale.x > _screenScale.y) {
                        _fitWidth = true;
                    }
                    canvas.fitWidth = _fitWidth;
                    canvas.fitHeight = _fitHeight;
                } else if (screenFit == ScreenFit.SHOW_ALL) {
                    canvas.fitWidth = _screenScale.x < _screenScale.y;
                    canvas.fitHeight = !canvas.fitWidth;
                } else {
                    canvas.fitWidth = true;
                    canvas.fitHeight = true;
                }
            } else {
                let _nodeScale = cc.v2(this.canvasSize.width/cvs_node.width,this.canvasSize.height/cvs_node.height);
                cc.log("_nodeScale : ", _nodeScale.x.toFixed(2), _nodeScale.y.toFixed(2));
                if (screenFit == ScreenFit.NO_BORDER) {
                    let scale: number = Math.max(_nodeScale.x, _nodeScale.y);
                    cvs_node.setScale(scale);
                } else if (screenFit == ScreenFit.SHOW_ALL) {
                    let scale: number = Math.min(_nodeScale.x, _nodeScale.y);
                    cvs_node.setScale(scale);
                } else {
                    cvs_node.setScale(_nodeScale);
                }
            }
        }else{
            cc.error('adapt screen node is null');
        }
    }
}

@ccclass
@menu("adapt/screen_adapt")
@executeInEditMode
class M extends cc.Component {
    public static readonly instance: M = new M();
    
    _screenFit: ScreenFit = ScreenFit.NO_BORDER;
    @property({
        type:cc.Enum(ScreenFit),
        tooltip:`NO_BORDER,//保证短边能铺满屏幕，长边可能会超出屏幕区域
        SHOW_ALL,//保证长边铺满屏幕，能显示所有内容，可能会有黑边
        EXACT_FIT,//长短边均拉伸铺满屏幕，可能会变形
        `,
    })
    set screenFit(val){
        this._screenFit = val;
        ScreenAdapter.adaptScreenSize(this.node,this.screenFit);
    }
    get screenFit(){
        return this._screenFit;
    }

    onLoad(){
        if(!CC_EDITOR){
            ScreenAdapter.adaptScreenSize(this.node,this.screenFit);
        }
    }
}