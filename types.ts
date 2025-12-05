
export interface LrcLine {
  id: string;
  timestamp: number; // in seconds
  text: string;
  timeStr: string;
}

export interface ScriptConfig {
  compName: string;
  compWidth: number;
  compHeight: number;
  fps: number;
  duration: number;
  fontSize: number;
  fontFamily: string;
  textColor: string; // The "Active" color (White)
  inactiveTextColor: string; // The "Waiting" color (Gray)
  activeScale: number;
  inactiveOpacity: number;
  blurAmount: number;
  spacing: number;
  motionDamping: number; // Used for bounce amplitude/frequency now
  alignment: 'left' | 'center';
  textLift: number; // How many pixels the active text moves up
}

export const DEFAULT_LRC = `[ti:世末歌者]
[ar:COP/乐正绫]
[al:世末歌者-COSMOSⅡ]
[00:00.00]世末歌者 - COP/乐正绫 (Yuezheng Ling)
[00:03.26]词：COP
[00:06.52]曲：COP
[00:09.78]编调：COP
[00:13.04]蝉时雨 化成淡墨渲染暮色
[00:17.97]渗透着 勾勒出足迹与车辙
[00:23.05]欢笑声 与漂浮的水汽饱和
[00:28.15]隔着窗 同城市一并模糊了
[00:33.33]拨弄着 旧吉他 哼着四拍子的歌
[00:38.37]回音中 一个人 仿佛颇悠然自得
[00:43.39]等凉雨 的温度 将不安燥热中和
[00:48.52]寻觅着 风的波折
[00:52.73]我仍然在无人问津的阴雨霉湿之地
[00:57.82]和着雨音 唱着没有听众的歌曲
[01:02.74]人潮仍是漫无目的地向目的地散去
[01:08.59]忙碌着 无为着 继续
[01:13.03]等待着谁能够将我的心房轻轻叩击
[01:18.32]即使是你 也仅仅驻足了片刻便离去
[01:23.43]想着或许 下个路口会有谁与我相遇
[01:28.95]哪怕只一瞬的奇迹
[01:54.64]夏夜空 出现在遥远的记忆
[02:00.18]绽放的 璀璨花火拥着繁星
[02:05.24]消失前 做出最温柔的给予
[02:10.35]一如那些模糊身影的别离
[02:15.43]困惑地 拘束着 如城市池中之鱼
[02:20.52]或哽咽 或低泣 都融进了泡沫里
[02:25.58]拖曳疲惫身躯 沉入冰冷的池底
[02:30.64]注视着 色彩褪去
[02:35.08]我仍然在无人问津的阴雨霉湿之地
[02:40.01]和着雨音 唱着没有听众的歌曲
[02:45.00]人潮仍是漫无目的地向目的地散去
[02:50.68]忙碌着 无为着 继续
[02:55.43]祈求着谁能够将我的心房轻轻叩击
[03:00.36]今天的你是否会留意并尝试去靠近
[03:05.72]因为或许
[03:06.95]下个路口仍是同样的结局
[03:11.20]不存在刹那的奇迹`;
