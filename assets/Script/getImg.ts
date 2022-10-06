// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import ActiveOpc from "./activeOpc";

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Sprite)
    headImg: cc.Sprite = null;

    @property(cc.Node)
    imgNode: cc.Node = null

    @property(cc.Label)
    activeLabel: cc.Label = null

    // LIFE-CYCLE CALLBACKS:
    private remoteUrl
    onLoad() {
        let data = localStorage.getItem('activeData') || '{}'
        let params = JSON.parse(data)
        let urls = [
            'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/active/one.jpg',
            'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/active/two.jpg',
            'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/active/three.jpg',
            'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/active/four.jpg',
            'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/active/five.jpg',
            'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/active/six.jpg'
        ]
        let ran = ~~(Math.random() * urls.length)
        this.remoteUrl = urls[ran];
        wx.showLoading({
            title: '加载中',
        })
        cc.loader.load(this.remoteUrl, (err, texture) => {
            params[ran] = urls[ran]
            localStorage.setItem('activeData', JSON.stringify(params))
            var frame = new cc.SpriteFrame(texture);
            let { width, height } = frame.getOriginalSize()
            let scale = this.imgNode.width / width
            this.headImg.spriteFrame = frame
            this.imgNode.scale = scale
            this.activeLabel.string = `已获得：${Object.values(params).length || 1}/6`
            wx.hideLoading()
            // this.headImg.sizeMode = SizeMode
            // Use texture to create sprite frame
        });
        // var url = "http://localhost:3274/";
        // cc.loader.load({url: url, type: 'png'}, function(err,img){
        //     var mylogo  = new cc.SpriteFrame(img); 
        //     self.logo.spriteFrame = mylogo;
        // });

    }
    imgClick() {
        if (!wx) return
        let data = localStorage.getItem('activeData') || '{}'
        let params = JSON.parse(data)
        wx.previewImage({
            current: this.remoteUrl, // 当前显示图片的 http 链接
            urls: Object.values(params) // 需要预览的图片 http 链接列表
        })
    }
    start() {

    }
    handleCal() {
        this.node.destroy()
    }
    handleClick() {
        wx.downloadFile({
            url: this.remoteUrl,
            filePath: wx.env.USER_DATA_PATH + '/' + new Date().valueOf() + '.jpg',
            success: res => {
                wx.saveImageToPhotosAlbum({
                    filePath: res.filePath,
                    success: () => {
                        this.node.parent.destroy()
                    },
                    fail(err) {
                        console.log(err)
                    }
                })
            }
        })
    }
    // update (dt) {}
}
