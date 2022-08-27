// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import SetCom from "./utils/setCom";

@ccclass
export default class NewClass extends cc.Component {

    // 进度条节点
    @property(cc.Node)
    progressBar: cc.Node = null;
    // 进度百分比
    @property(cc.Label)
    progressData: cc.Label = null;
    // 定义一个状态
    @property(cc.Label)
    status: cc.Label = null;

    private proBar: cc.ProgressBar = null
    // 完成标志
    private comFlag = false
    // 完成度
    private compDegress: number = 0
    //当前已经过去的时间
    private nowTime: number = 0
    //总时间
    private allTime: number = 10
    onLoad() {
        if (typeof wx !== "undefined") {
            wx.cloud.init({
                env: 'game-yun-1g16a4u31c52b0c6'
            })
        }


        // 获取进度条组件
        this.proBar = this.progressBar.getComponent(cc.ProgressBar);

        // 加载资源文件夹
        this.loadSources();

    }
    _progressCallback(completeCount, totalCount, res) {
        //加载进度回调
        // console.log("第 " + completeCount + "加载完成！", totalCount, res);
        this.compDegress = completeCount / totalCount; //已经完成的数量/总数量
    }

    _completeCallback(err, texture) {
        //加载完成回调
        cc.director.loadScene("home");
    }
    // 加载资源文件夹
    loadSources() {
        var _this = this;
        // cc.resources.load
        // cc.resources.loadDir('res', cc.Texture2D, (err, assets, paths) => console.log(paths,assets,err));
        // cc.resources.loadDir("respre", cc.Texture2D, (err, assets, paths) =>
        //     console.log(paths, assets, err)
        // );
        cc.loader.loadResDir(
            "/",
            _this._progressCallback.bind(_this),
            _this._completeCallback.bind(_this)
        );
        // cc.assetManager.loadBundle('https://vuetest-5gm5shnx249b44d4-1304618648.tcloudbaseapp.com/spin', (err, bundle) => {
        //     console.log(bundle);

        //     // bundle.load('xxx');
        // });
        cc.resources.loadDir("Texture", function (err, assets) {
            // this.status.string = "正在加载图片资源中。。。";
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
                // this.status.string = "正在加载动画。。。";
                // 载入一个目录
                cc.loader.loadResDir(
                    "prefabs",
                    _this._progressCallback.bind(_this),
                    _this._completeCallback.bind(_this)
                );
                // ...
            });
            // ...
        });


    }
    update(dt: number) {
        //写按照时间刷新进度条的显示  dt每次刷新的时间段
        if (this.comFlag) {
            // this.status.string = "即将开始游戏，请稍后";
        } else {
            this.proBar.progress = this.compDegress;
            this.progressData.string = Math.floor(this.compDegress * 100) + "%";
        }

        // this.nowTime += dt; // 当前获取的时间加dt
        // var timePer = this.nowTime / this.allTime; //定义时间百分比
        // if (timePer > 1) {
        //   timePer = 1;
        // }
        // this.proBar.progress = timePer;

        // this.progressData.string = parseInt(timePer * 100) + "%";
    }
}
