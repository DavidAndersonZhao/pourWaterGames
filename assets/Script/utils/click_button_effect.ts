import { AudioEnum, AudioUtil } from "./audio_util";

const {ccclass, property, requireComponent, menu} = cc._decorator;

@ccclass
@menu("audio/button_click")
@requireComponent(cc.Button)
export default class AudioButtonClick extends cc.Component {    

    onLoad () {
        let btn = this.node.getComponent(cc.Button);
        let hd = new cc.Component.EventHandler()
        hd.component = "audio_button_click"
        hd.handler = "onClick"
        hd.target = this.node
        btn.clickEvents.push(hd)

    }

    async onClick(){
        AudioUtil.playEffect(AudioEnum.button)
    }
}
