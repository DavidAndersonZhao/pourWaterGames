const { ccclass, property } = cc._decorator;
import { UtilAudio } from "./utils/audio_util";
import SetCom from "./utils/setCom";

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    progressBar: cc.Node = null;
    @property(cc.Label)
    progressData: cc.Label = null;
    @property(cc.Label)
    status: cc.Label = null;

    private proBar: cc.ProgressBar = null
    private comFlag = false
    private compDegress: number = 0
    private nowTime: number = 0
    private allTime: number = 10
    private timeInt = null
    onLoad() {
        if (typeof wx !== "undefined") {
            wx.cloud.init({
                env: 'game-yun-1g16a4u31c52b0c6'
            })
        }

        this.proBar = this.progressBar.getComponent(cc.ProgressBar);

        this.loadSources();
        this.textAnimation()

    }
    _progressCallback(completeCount, totalCount, res) {
        this.compDegress = completeCount / totalCount;
    }

    _completeCallback(err, texture) {
        UtilAudio.beforeloadAll()
        //加载完成回调
        SetCom.loadScence = 'loading'
        cc.director.loadScene("home");
        clearInterval(this.timeInt)
    }
    textAnimation() {
        let textArr = [
            '载入中.',
            '载入中..',
            '载入中...',
            '载入中....',
            '载入中.....',
            '载入中......',
        ]
        let num = 0
        this.timeInt = setInterval(() => {
            this.status.string = textArr[num++ % textArr.length]
        }, 1000)
    }
    loadSources() {
        var _this = this;
        // cc.loader.loadResDir(
        //     "/",
        //     _this._progressCallback.bind(_this),
        //     // _this._completeCallback.bind(_this)z
        // );
        cc.resources.loadDir("Texture", function (err, assets) {
            let propImg = [
                '滴管@2x',
                '小烧杯@2x',
                '显微镜@2x',
                '小白机器人@2x',
                '聪明草@2x',
                '大烧杯@2x',
            ]
            let peopleImg = [
                '霍格沃茨麻瓜解锁@2x',
                '炼金术士解锁@2x',
                '红宝宝解锁@2x',
                '孟婆解锁@2x',
                '火云邪神解锁@2x',
                '太上老君解锁@2x',
            ]



            let prop_sprites: any = assets.filter(item => propImg.includes(item.name))
            let people_sprites: any = assets.filter(item => peopleImg.includes(item.name))
            SetCom.shop_people = people_sprites
            SetCom.shop_prop = prop_sprites
            cc.resources.loadDir("spin", function (err, assets) {
                cc.loader.loadResDir(
                    "prefabs",
                    _this._progressCallback.bind(_this),
                    _this._completeCallback.bind(_this)
                );
            });
        });


    }
    update(dt: number) {
        if (this.comFlag) {
        } else {
            this.proBar.progress = this.compDegress;
            this.progressData.string = Math.floor(this.compDegress * 100) + "%";
        }

    }
}
