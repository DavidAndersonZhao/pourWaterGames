
const {ccclass, property,menu,executeInEditMode} = cc._decorator;

export enum ScreenF{
    NO_BORDER,
    SHOW_ALL,
    EXACT_FIT,
}

export class ADScreen{
    public static get canvasBigOrSmall():cc.Size{
        let size = cc.view.getCanvasSize();
        do{
            let canvas_element = cc.Canvas.instance.node;
            if(!canvas_element){break;}
            size = canvas_element.getContentSize();
        }while(false)
        return size;
    }

    public static get upperLeft(): cc.Vec2 {
        let size = this.canvasBigOrSmall;
        return cc.v2(-size.width * 0.5, size.height * 0.5);
    }

    public static get lowerMiddle(): cc.Vec2 {
        let size = this.canvasBigOrSmall;
        let pos =  cc.v2(0, -size.height * 0.5);
        return pos;
    }

    public static get screenZoom(){
        let visible = this.canvasBigOrSmall;
        let des = cc.Canvas.instance.designResolution;
        return cc.v2(visible.width / des.width, visible.height / des.height);
    }

    public static get aspRatio():number{
        let visible = this.canvasBigOrSmall;
        let rat = visible.height/visible.width;
        return rat;
    }

    public static get isHigherScreen(): boolean{
        return this.aspRatio >= 2.0;
    }

    public static adaptScreenSize(cvs_element: cc.Node, screenSuit: ScreenF = ScreenF.NO_BORDER): void {
        if (cvs_element) {
            let canvas = cvs_element.getComponent(cc.Canvas);
            if (canvas != null) {
                let _screenScale = this.screenZoom;
                if (screenSuit == ScreenF.NO_BORDER) {
                    let _fitH = false;
                    let _fitW = false;
                    if (_screenScale.x < _screenScale.y) {
                        _fitH = true;
                    } else if (_screenScale.x > _screenScale.y) {
                        _fitW = true;
                    }
                    canvas.fitWidth = _fitW;
                    canvas.fitHeight = _fitH;
                } else if (screenSuit == ScreenF.SHOW_ALL) {
                    canvas.fitWidth = _screenScale.x < _screenScale.y;
                    canvas.fitHeight = !canvas.fitWidth;
                } else {
                    canvas.fitWidth = true;
                    canvas.fitHeight = true;
                }
            } else {
                let _nodeZoom = cc.v2(this.canvasBigOrSmall.width/cvs_element.width,this.canvasBigOrSmall.height/cvs_element.height);
                if (screenSuit == ScreenF.NO_BORDER) {
                    let zoom: number = Math.max(_nodeZoom.x, _nodeZoom.y);
                    cvs_element.setScale(zoom);
                } else if (screenSuit == ScreenF.SHOW_ALL) {
                    let scale: number = Math.min(_nodeZoom.x, _nodeZoom.y);
                    cvs_element.setScale(scale);
                } else {
                    cvs_element.setScale(_nodeZoom);
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
    
    _screenFit: ScreenF = ScreenF.NO_BORDER;
    @property({
        type:cc.Enum(ScreenF),
        tooltip:`NO_BORDER,//保证短边能铺满屏幕，长边可能会超出屏幕区域
        SHOW_ALL,//保证长边铺满屏幕，能显示所有内容，可能会有黑边
        EXACT_FIT,//长短边均拉伸铺满屏幕，可能会变形
        `,
    })
    set screenFit(val){
        this._screenFit = val;
        ADScreen.adaptScreenSize(this.node,this.screenFit);
    }
    get screenFit(){
        return this._screenFit;
    }

    onLoad(){
        if(!CC_EDITOR){
            ADScreen.adaptScreenSize(this.node,this.screenFit);
        }
    }
}