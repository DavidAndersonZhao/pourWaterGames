
export function createLines(color:cc.Color=cc.color(255,255,255,255),size:cc.Size=cc.size(6,6)) {
    let _w = size.width;
    let _h = size.height;
    let _tex = new cc.Texture2D();
    let _buffer = new ArrayBuffer(_w*_h*4);
    let _arrary = new Uint8Array(_buffer);

    _arrary.fill(0)
    for(let i=0;i<_w;i++){
        for(let j=0;j<_h;j++){
            let idx = (i*_h+j)*4;
            _arrary[idx] = color.r;
            _arrary[idx+1] = color.g;
            _arrary[idx+2] = color.b;
            _arrary[idx+3] = color.a;
            let k = 0;
        }
    }
    _tex.initWithData(_arrary,cc.Texture2D.PixelFormat.RGBA8888, _w, _h);

    return _tex;
}


let _texture:cc.Texture2D = null;
export function setupColorSpriteFrame(rect:cc.Rect=null){
    if(_texture==null){
        _texture = createLines()
    } 
    rect = rect || cc.rect(0,0,cc.view.getVisibleSize().width,cc.view.getVisibleSize().height);
    let spriteFrame = new cc.SpriteFrame(_texture,rect)
    return spriteFrame;
}