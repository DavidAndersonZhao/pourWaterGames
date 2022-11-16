// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

interface IPeople {
    num: number;
    headImg: cc.SpriteFrame;
    nickName: string;
    passTimeShow?:string
}
@ccclass
export default class NewClass extends cc.Component {

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.Node)
    itemTemplate: cc.Node = null
    // LIFE-CYCLE CALLBACKS:
    @property([cc.SpriteFrame])
    private rankSprite: cc.SpriteFrame[] = []
    private content: cc.Node
    @property(Number)
    private totalCount = 0 // how many items we need for the whole list
    @property(Number)
    private spawnCount = 100// how many items we actually spawn
    @property(Number)
    private spacing = 0 // space between each item

    onLoad() {
        this.content = this.scrollView.content;
        // this.initialize()
        // this.setCurrentRank()
    }

    async setCurrentRank({ num, headImg, nickName, passTimeShow }: IPeople) {
        if (!headImg) return
        this.itemTemplate.active = true
        this.itemTemplate.getComponent(cc.Sprite).spriteFrame = this.rankSprite[1]
        this.itemTemplate.getChildByName('num').color = new cc.Color(255, 255, 255)
        // 排名
        let numNode = this.itemTemplate.getChildByName('num')
        numNode.getComponent(cc.Label).string = num + ''
        let rankNode = this.itemTemplate.getChildByName('rank')
        rankNode.getChildByName('time').color = new cc.Color(255, 255, 255)
        rankNode.getChildByName('time').getComponent(cc.Label).string = passTimeShow
        // 头像
        let headImgNode = rankNode.getChildByName('headImg')
        headImgNode.getComponent(cc.Sprite).spriteFrame = headImg
        headImgNode.rotation = 0
        // await this.setImg(headImg, headImgNode)
        // 名称
        let nickNode = rankNode.getChildByName('nick')
        nickNode.getComponent(cc.Label).string = nickName
        // nickNode.getComponent(cc.Label).string = Math.random().toString(36)
    }
    start() {

    }
    setTotalNum(num = 0) {
        this.totalCount = num
    }
    async initialize(arr: IPeople[]) {
        this.content.height = this.totalCount * (this.itemTemplate.height + this.spacing) + this.spacing; // get total content height
        for (let i = 0; i < arr.length; ++i) { // spawn items, we only need to do this once
            let item = arr[i]
            let itemNode: cc.Node = cc.instantiate(this.itemTemplate);
            let rankNode = itemNode.getChildByName('rank')
            // 排名
            let numNode = itemNode.getChildByName('num')
            numNode.getComponent(cc.Label).string = i + 1 + ''
            // 时间
            let timeNode = rankNode.getChildByName('time')
            timeNode.getComponent(cc.Label).string = item.passTimeShow
            // 头像
            let headImgNode = rankNode.getChildByName('headImg')
            headImgNode.getComponent(cc.Sprite).spriteFrame = item.headImg
            headImgNode.rotation = 0
            // 名称
            let nickNode = rankNode.getChildByName('nick')
            nickNode.getComponent(cc.Label).string = item.nickName
            // nickNode.getComponent(cc.Label).string = Math.random().toString(36)
            if (i) {
                numNode.color = new cc.Color(255, 255, 255)
                timeNode.color = new cc.Color(255, 255, 255)
            } else {
                itemNode.getComponent(cc.Sprite).spriteFrame = this.rankSprite[0]
            }
            itemNode.active = true
            this.content.addChild(itemNode);
            // await this.setImg(item.headImg, headImgNode)
            // itemNode.setPosition(0, -itemNode.height * (0.5 + i) - this.spacing * (i + 1));
            // itemNode.getComponent('Item').initItem(i, i);
            // this.items.push(itemNode);
        }
        this.scrollView.scrollToTop(0)
    }
    /**
 * 加载图片
 * @param url 远程图片资源url
 * @param node 节点
 * @returns 
 */
    setImg(url, node: cc.Node) {
        return new Promise<void>((resolve, reject) => {
            cc.loader.load(url, (err, texture) => {
                if (err) {
                    reject(err)
                }
                var frame = new cc.SpriteFrame(texture);
                let { width, height } = frame.getOriginalSize()
                let scale = node.width / width
                node.getComponent(cc.Sprite).spriteFrame = frame
                // node.scale = scale
                node.rotation = 0
                resolve()
                // this.headImg.sizeMode = SizeMode
                // Use texture to create sprite frame
            });
        })
    }
    // update (dt) {}
}
