(function() {

  //厳格モード
  'use strict';

  //AudioContextクラスのコンストラクタを呼び出して、
  //AudioContextクラスのインスタンスを生成。これが処理の起点
  //これをすることにより、Web Audio APIが定義するプロパティやメソッドにアクセス可能。
  // ベンダープレフィックスが現状のブラウザの実装には必要
  //Firefoxではプレフィックスなし、Operaではプレフィックスに対応
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext();

  // 音源ノード生成（audio要素からオーディオデータ取得）
  // audio要素を取得
  var audioSrc = document.getElementById("audio-element");
  // audio要素を音源とするMediaElementAudioSourceNodeを生成
  var audio = context.createMediaElementSource(audioSrc);

  // 中間処理（音量調整処理）を表すAudioNodeが持つAudioParamに
  // input要素の値を代入。表示にも値を反映する
  var elementGain = document.getElementById('gain');
  var elementGainValue = document.getElementById('gain-value');
  var gain = context.createGain();
  var setGain = function() {
    gain.gain.value = elementGainValue.innerText = elementGain.value;
  };
  setGain();

  //フィルター
  var elementBiquadFilterType = document.getElementById('biquad-filter-type');
  var elementBiquadFilterFrequency = document.getElementById('biquad-filter-frequency');
  var elementBiquadFilterFrequencyValue = document.getElementById('biquad-filter-frequency-value');
  var elementBiquadFilterFrequencyContainer = document.getElementById('biquad-filter-frequency-container');
  var biquadFilter = context.createBiquadFilter();
  var setBiquadFilterType = function() {
    //biquadFilterTypeを選び、textに代入
    var text = elementBiquadFilterType.options[elementBiquadFilterType.selectedIndex].text;
    //gainノード、biquadFilterノード、共にすべての接続を一度切断
    gain.disconnect();
    biquadFilter.disconnect();
    //BiquadFilterNodeがオフの場合 textがoff
    if (text === 'off') {
      //id="biquad-filter-frequency-container"にis-hidden追加
      elementBiquadFilterFrequencyContainer.classList.add('is-hidden');
      //GainNode → Destination
      gain.connect(context.destination);
      //BiquadFilterがローパスフィルターかハイパスフィルターの場合
    } else {
      //id="biquad-filter-frequency-container"からis-hiddenを取り除く
      elementBiquadFilterFrequencyContainer.classList.remove('is-hidden');
      //BiquadFilterTypeを選び、BiquadFilter.typeに代入
      biquadFilter.type = elementBiquadFilterType.options[elementBiquadFilterType.selectedIndex].text;
      //GainNode → BiquadFilterNode → Destination
      gain.connect(biquadFilter);
      biquadFilter.connect(context.destination);
    }
  };
  var setBiquadFilterFrequency = function() {
    //〜Hzか表示
    biquadFilter.frequency.value = elementBiquadFilterFrequencyValue.innerText = elementBiquadFilterFrequency.value;
  };
  setBiquadFilterFrequency();


  //音源ノード → GainNode
  audio.connect(gain);
  //Gainノード -> 音声出力ノード
  gain.connect(context.destination);

  // DOMへのイベント登録
  var elementButton = document.getElementById('button');
  var isPlaying;
  //再生＆停止ボタン
  elementButton.addEventListener('click', function() {
    //最初は再生されていない、押すと再生
    audioSrc[!isPlaying ? 'play' : 'pause']();
    isPlaying = !isPlaying;
  });
  //音量調節
  elementGain.addEventListener('mouseup', setGain);
  //
  elementBiquadFilterType.addEventListener('change', setBiquadFilterType);
  elementBiquadFilterFrequency.addEventListener('mouseup', setBiquadFilterFrequency);

})();
