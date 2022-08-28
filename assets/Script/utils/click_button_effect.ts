import { AudioEnum, UtilAudio } from "./audio_util";

const {ccclass, property, requireComponent, menu} = cc._decorator;

@ccclass
@menu("audio/button_click")
@requireComponent(cc.Button)
export default class AudioClick extends cc.Component {    

    onLoad () {
        let button = this.node.getComponent(cc.Button);
        let eventHD = new cc.Component.EventHandler()
        eventHD.component = "audio_button_click"
        eventHD.handler = "onClick"
        eventHD.target = this.node
        button.clickEvents.push(eventHD)

    }

    async onClick(){
        UtilAudio.effect_play(AudioEnum.button)
    }
}
