(function() {
  //AudioContextクラスのコンストラクタを呼び出して、
  //AudioContextクラスのインスタンスを生成。これが処理の起点
  //これをすることにより、Web Audio APIが定義するプロパティやメソッドにアクセス可能。
  // ベンダープレフィックスが現状のブラウザの実装には必要
  //Firefoxではプレフィックスなし、Operaではプレフィックスに対応
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext();

  // 音源ノード生成（audio要素からオーディオデータ取得）
  var audioSrc = document.getElementById("audio-element"); // audio要素を取得
  var audio = context.createMediaElementSource(audioSrc); // audio要素を音源とするMediaElementAudioSourceNodeを生成

  // 中間処理（音量調整処理）を表すAudioNodeが持つAudioParamに
  // input要素の値を代入。表示にも値を反映する
  var elementGain = document.getElementById('gain');
  var elementGainValue = document.getElementById('gain-value')
  var gain = context.createGain();
  setGain = function() {
    gain.gain.value = elementGainValue.innnerText = elementGain.value;
  };
  setGain();

  //音源ノード → GainNode
  audio.connect(gain);

  // オーディオノード接続：Gainノード -> 音声出力ノード
  gain.connect(context.destination);

  // 音源再生
  // audioSrc.play();
  //10病後停止
  // window.setTimeout(function() {
  //   audio.pause();
  // }, 10000);

  //再生＆停止ボタン
  var elementButton = document.getElementById('button');
  var isPlaying;
  // DOMへのイベント登録
  elementButton.addEventListener('click', function() {
    //最初は再生されていない、押すと再生
    audioSrc[!isPlaying ? 'play' : 'pause']();
    isPlaying = !isPlaying;
  });
  elementGain.addEventListener('mouseup', setGain);

})();
