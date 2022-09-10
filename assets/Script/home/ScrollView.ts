// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:

import SetCom from "../utils/setCom";
import Home from "./home";

//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
interface Task_inter {
    btns: [cc.SpriteFrame],
    imgs: [cc.SpriteFrame],
}
const { ccclass, property } = cc._decorator;
const taskImgs = cc.Class({
    name: "taskImgs",
    properties: {
        btns: {
            default: [],
            type: [cc.SpriteFrame],
        },
        imgs: {
            default: [],
            type: [cc.SpriteFrame],
        }
    },
});

function getNowStartTime() {
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let time = new Date(year + "-" + month + "-" + day + " " + 0 + ":" + 0 + ":" + 0).getTime();
    return time;
}
@ccclass
export default class NewClass extends cc.Component {
    @property(Home)
    homeCom: Home = null;

    @property(taskImgs)
    taskImg_list: Task_inter = null;

    @property(cc.JsonAsset)
    private taskCfg: cc.JsonAsset = null;
    @property(cc.Prefab)
    private task_pfb: cc.Prefab = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.SpriteFrame)
    dobuleImg: cc.SpriteFrame = null

    private task_list = []
    /**
     * 关闭
     * @param event 
     * @param data 
     */
    notNeed(event: any, data: string) {
        this.homeCom.setTaskNum(this.task_list.filter(item => item.taskState != 4).length)
        this.node.active = false
    }

    public getTaskListFn() {
        let startTme = getNowStartTime();
        let storageData: any = localStorage.getItem('taskCfg');
        let list = this.taskCfg.json.data
        if (storageData) {
            storageData = JSON.parse(storageData)
            if (storageData.time < startTme) {
                list = this.taskCfg.json.data
            } else {
                list = storageData.data
            }
        }
        return list
    }

    receiveReward(e, element, taskLabel) {
        e.node.getComponent(cc.Sprite).spriteFrame = this.taskImg_list.btns[3]
        this.resOpenModal(element, this.taskImg_list.imgs[element.taskIcon - 1], taskLabel + `x${element.taskRewardNum}`)
        element.taskState = 4
        let data = {
            data: this.task_list,
            time: new Date().getTime()
        }
        localStorage.setItem('taskCfg', JSON.stringify(data))
    }

    initialize() {

        let content = this.scrollView.content;
        content?.removeAllChildren();

        this.task_list = this.getTaskListFn()
        content.height = this.task_list.length * (this.task_pfb.data.height + 20);

        for (let index = 0; index < this.task_list.length; index++) {
            let taskLabel = ''

            const element = this.task_list[index];
            switch (element.taskIcon) {
                case 1:
                    taskLabel = "碎片"
                    break;
                case 2:
                    taskLabel = "体力"
                    break;

                default:
                    break;
            }
            let _node = cc.instantiate(this.task_pfb);
            let taskIcon = _node.getChildByName("taskIcon")
            let tashBtn = _node.getChildByName("tashBtn")
            let taskText = _node.getChildByName("taskLabels").getChildByName("taskText")
            let taskLabels = _node.getChildByName("taskLabels").getChildByName("taskLabels")
            taskIcon.getComponent(cc.Sprite).spriteFrame = this.taskImg_list.imgs[element.taskIcon - 1]
            tashBtn.getComponent(cc.Sprite).spriteFrame = this.taskImg_list.btns[element.taskState - 1]
            taskText.getComponent(cc.Label).string = element.taskText
            taskLabels.getComponent(cc.Label).string = taskLabel + `x${element.taskRewardNum}`
            tashBtn.on('click', (e) => {
                if (element.taskState != 4) {
                    let handleName = element.taskState == 3 ? 'advertisement' : 'shareFriend'

                    SetCom[handleName](
                        {
                            success: (_res) => {

                                this.receiveReward(e, element, taskLabel)
                            },
                            fail: () => {
                                SetCom.shareFriend(
                                    {
                                        success: (_res) => {
                                            this.receiveReward(e, element, taskLabel)
                                        },
                                    })
                            }
                        })
                }
            })
            content.addChild(_node);
        }



        this.scrollView.scrollToTop(0)


    }
    opcOpen() {
        this.node.active = true
    }
    resOpenModal(data, img: cc.SpriteFrame, label) {
        let obj = {
            "rewardIcon": img,
            "rewardNum": data.taskRewardNum,
            "name": label,
            "type": data.taskIcon,
            "curState": data.rewardIcon,
        }
        switch (data.taskIcon) {
            case 2:
                obj.curState = 5
                this.node.parent.getComponent('home').openOpc(3, obj, undefined, this.dobuleImg, '收下了', 1);
                break;
            case 1:
                obj.curState = 4
                this.node.parent.getComponent('home').openOpc(2, obj, undefined, this.dobuleImg, '收下了', 1);
                break;
            default:
                break;
        }
        this.homeCom.show()
        data.taskState = 4
    }

    receiveClick(data) {
        switch (data.taskIcon) {
            case 1:
                SetCom.global_prop.fragment += data.taskRewardNum
                break;
            case 2:
                SetCom.global_prop.physicalStrength += data.taskRewardNum
                break;
            default:
                break;
        }
        this.homeCom.show()
        data.taskState = 4
    }
    onLoad() {
        this.initialize()
    }
    start() {
    }


}
