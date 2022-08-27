
export function createTexture(color:cc.Color=cc.color(255,255,255,255),size:cc.Size=cc.size(6,6)) {
    let width = size.width;
    let height = size.height;
    let tex = new cc.Texture2D();
    let buf = new ArrayBuffer(width*height*4);
    let arr = new Uint8Array(buf);

    arr.fill(0)
    for(let i=0;i<width;i++){
        for(let j=0;j<height;j++){
            let idx = (i*height+j)*4;
            arr[idx] = color.r;
            arr[idx+1] = color.g;
            arr[idx+2] = color.b;
            arr[idx+3] = color.a;
            let k = 0;
        }
    }
    tex.initWithData(arr,cc.Texture2D.PixelFormat.RGBA8888, width, height);

    return tex;
}


let _texture:cc.Texture2D = null;
export function createColorSpriteFrame(rect:cc.Rect=null){
    if(_texture==null){
        _texture = createTexture()
    } 
    rect = rect || cc.rect(0,0,cc.view.getVisibleSize().width,cc.view.getVisibleSize().height);
    let spriteFrame = new cc.SpriteFrame(_texture,rect)
    return spriteFrame;
}