/**
* Copyright (c) 2020—2020 虚咖科技  All rights reserved.
* Autor: Created by 李清风 on 2020-11-17.
* Desc: 
@exg Design：
@exp Use Cases：
@exg Tag Fixed：
*/
const { ccclass, property } = cc._decorator;
declare let require: (string) => any;
import async from "async";
@ccclass
export class GuideTaskMgr extends cc.Component {

    /**手指预制件 */
    @property(cc.Prefab)
    FINGER_PREFAB: cc.Prefab = null;

    _finger: cc.Node = null;

    _mask: cc.Mask;
    _maskInfo: cc.Node; //调试面板（查看挖洞是否正常）
    _targetNode: any; //引导的目标（也就是要引导玩家操作的目标）
    _isOpenMaskInfo: boolean = true; //是否打开调试面板

    _task: any;//当前引导任务


    static readonly FINGER: string = 'movefinger';//指令注册

    static readonly typeList = [
        GuideTaskMgr.FINGER,
    ];

    onLoad() {
        if (this.FINGER_PREFAB) {
            this._finger = cc.instantiate(this.FINGER_PREFAB);
            this._finger.parent = this.node;
            this._finger.active = false;
            //this._finger.getComponent("GuideFinger").stopAnim(); //手指可以挂一些动画脚本
        }

        this.node.setContentSize(cc.winSize);
        cc.systemEvent.on("ExcuteGuideTask", this.ExcuteGuideTask, this); //注册引导事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.addSetSwallowTouchesEventListener, this);

        this._mask = this.node.getComponentInChildren(cc.Mask);
        this._maskInfo = this._mask.node.getChildByName("info");

        this._mask.node.active = false; //mask遮挡面板默认不开启，只有在引导时在开启
        this._maskInfo.active = this._isOpenMaskInfo;
    }



    /**
     * 由事件进行派发的引导处理
     * @param data 
     */
    ExcuteGuideTask(data) {


        this._mask.node.active = true;  //引导前开启遮挡面板


        let flie = data.taskFlie; //要执行的引导文件
        let index = data.stepIndex;//要执行的步骤

        let { task } = require(flie);
        // this._task = task;

        let step = task.steps[index]; //取得要执行的步骤

        this._targetNode = null; //每次引导执行前，都将之前的引导目标清空
        const guideFn = () => {
            //调用async.series来执行引导的步骤
            async.series({
                stepStart(markonCb) {
                    if (step.onStart) {
                        step.onStart(() => {
                            markonCb();
                        });
                    } else {
                        markonCb();
                    }
                },
                stepExcute: (markonCb) => {
                    if (step.onExcute) {
                        step.onExcute(() => {
                            this._mask.node.getChildByName("label").getComponent(cc.Label).string = step.command.text;

                            this.scheduleOnce(() => {
                                let cmd = GuideTaskMgr[step.command.cmd];
                                if (cmd) {
                                    cmd(this, step, (error) => {
                                        markonCb(error);
                                    });
                                }
                            }, step.delayTime || 0);
                        });
                    }
                },
                stepEnd: (markonCb) => {
                    if (step.onEnd) {
                        step.onEnd(() => {
                            markonCb();
                        });
                    } else {
                        markonCb();
                    }
                    step = task.steps[++index]

                    if (step) {
                        guideFn()
                    } else {
                        //引导执行完毕
                        this._mask._graphics.clear();
                        this._mask.node.active = false;//关闭遮挡面板
                        this._finger.active = false;
                    }
                },
            },
                (error) => {
                    if (error) {
                        //如果存在意外终止 doSomething。。。。
                    }

                })
        }
        guideFn()

    }


    /**
     * 事件的吞没处理机制
     */
    addSetSwallowTouchesEventListener(event) {
        if (!this._mask.node.active) {
            this.node._touchListener.setSwallowTouches(false);
            return;
        }
        if (!this._targetNode) {
            this.node._touchListener.setSwallowTouches(true);
            return;
        }
        if (!cc.isValid(this._targetNode)) {
            return;
        }
        let rect = this._targetNode.getBoundingBoxToWorld();
        if (rect.contains(event.getLocation())) {
            //如果玩家点击了规定的区域，则让事件往下派发
            this.node._touchListener.setSwallowTouches(false);
        } else {
            this.node._touchListener.setSwallowTouches(true);
        }
    }



    static movefinger(guideTaskMgr, step, callback) {

        let params = step.command;
        guideTaskMgr._targetNode = null; //先置空之前查找的目标节点

        //开始查找新的目标节点
        guideTaskMgr.find(params.args, (node: cc.Node, rect) => {
            let cup = node
            //查找到之后并且聚焦过去
            guideTaskMgr.fingerToNode(cup, () => {
                guideTaskMgr._targetNode = cup; //赋值新的查找到的目标节点
                node.once(cc.Node.EventType.TOUCH_END, () => {
                    callback();

                });

            });
        });
    }



    //******************工具集函数********************* */


    /**
     * 查找节点
     * @param value 
     * @param cb 
     */
    private find(value, cb?) {
        let root = cc.find('Canvas');
        this.locateNode(root, value, (error, node) => {
            if (error) {
                return;
            }
            let rect = this._focusToNode(node);
            if (cb) {
                cb(node, rect);
            }
        });
    }


    /**
    * 路径特殊字符使用正则表达式进行拆分
    * @param locator 查询的路径配置，形如：'bottom/bag/bagContent/casting',
    */
    private parse(locator: string) {
        let names = locator.split(/[.,//,>,#]/g);
        let arr = [];
        let map = {};
        for (let item of names) {
            var reg = new RegExp(`[.,//,>,#]+${item}`, "g");
            let res = locator.match(reg);
            if (map[item]) {
                map[item]++;
            } else {
                map[item] = 1;
            }
            let symbol = res ? res[map[item] || 0]?.replace(item, "") || "/" : "/";
            arr.push({ symbol, name: item.trim(), index: map[item] - 1 || 0 });
        }
        return arr;
    }


    /**
    * 根据查找路径和根节点定位要查找的目标节点
    * @param root 
    * @param locator 
    * @param cb 
    */
    private locateNode(root: cc.Node, locator, cb?) {
        let segments = this.parse(locator);
        let child, node = root;
        for (let i = 0; i < segments.length; i++) {
            let item = segments[i];
            switch (item.symbol) {
                case '/':
                    child = node.getChildByName(item.name);
                    break;
                case ',':
                    child = node.parent.children.filter(data => data.name == item.name)[item.index]
                    break
            }
            if (!child) {
                node = null;
                break;
            }
            node = child;
        }
        if (node && node.active && cb) {
            cb(null, node);
        } else {
            cb(locator)
        }
        return node;
    }


    /**
     * 聚焦到目标节点并绘制图形
     * @param node 查找的节点
     */
    _focusToNode(node: cc.Node) {
        this._mask._graphics.clear();
        let rect = node.getBoundingBoxToWorld();
        let p = this.node.convertToNodeSpaceAR(rect.origin);
        rect.x = p.x;
        rect.y = p.y;
        this._mask._graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
        return rect;
    }


    /**
     * 移动手指到目标节点
     * @param node 
     * @param markonCb 
     */
    fingerToNode(node: cc.Node, markonCb) {
        if (!this._finger) {
            markonCb();
        }
        this._finger.active = true;
        this._finger.stopAllActions();

        let p = this.node.convertToNodeSpaceAR(node.parent.convertToWorldSpaceAR(node.position));
        p.y -= 160
        this._finger.setPosition(p);
        //this._finger.getComponent("GuideFinger").playAnim(); //手指可以挂一些动画脚本，用来控制动画播放
        markonCb();
    }


}
