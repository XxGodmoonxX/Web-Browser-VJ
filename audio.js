// AudioContextクラスのインスタンスを生成、これが処理の起点
//これをすることにより、Web Audio APOが定義するプロパティやメソッドにアクセス可能。
// ベンダープレフィックス等がブラウザの実装には必要
window.AudioContext = window.AudioContext || window.webkitAudioContext;
// Create the instance of AudioContext
var context = new AudioContext();

  // // OscillatorNodeクラスのcreateOscillatorメソッドでOscillatorNodeインスタンスを生成
  // // ↓
  // // connectメソッドで、OscillatorNodeインスタンスを出力点であるAudioDestinationNodeインスタンスに接続
  // // Create the instance of OscillatorNode
  // var oscillator = context.createOscillator();
  // // OscillatorNode (Input) -> AudioDestinationNode (Output)
  // oscillator.connect(context.destination);
  //
  // // まだ音を出せない、音源スイッチをONにしていないから。
  // // for legacy browsers、古いブラウザ用
  // oscillator.start = oscillator.start || oscillator.noteOn;
  // oscillator.stop  = oscillator.stop  || oscillator.noteOff;
  // // Start sound
  // oscillator.start(0); //即サウンド開始
  // // Stop sound (after 5 sec)
  // window.setTimeout(function() {
  //     oscillator.stop(0);
  // }, 5000);

  // ボリュームコントローラ
  // GainNodeインスタンスの生成は、AudioContextインスタンスのcreateGainメソッドの呼び出しで可能
  // for legacy browsers
  context.createGain = context.createGain || context.createGainNode;
  // Create the instance of GainNode
  var gain = context.createGain();

  //OscillatorNodeインスタンス生成、connectメソッドで繋ぐ
  // Create the instance of OscillatorNode
  var oscillator = context.createOscillator();
  // for legacy browsers
  oscillator.start = oscillator.start || oscillator.noteOn;
  oscillator.stop  = oscillator.stop  || oscillator.noteOff;
  oscillator.start(0); //即サウンド再生
  window.setTimeout(function() {
    oscillator.stop(0);
  }, 5000); //5秒後oscillator.stop(0)実行、即停止
  // OscillatorNode (Input) -> GainNode (Volume Controller) -> AudioDestinationNode (Output)
  oscillator.connect(gain); //OscillatorNode→GainNode
  gain.connect(context.destination); //GainNode→AudioDestinationNode

  //GainNodeインスタンスのgainプロパティのvalueプロパティ
  gain.gain.value = 0.5; //ボリュームを0.5に設定
