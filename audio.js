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


  //音源ノード生成（audio要素からオーディオデータ取得）
  //audio要素を取得
  var audioSrc = document.getElementById("audio-element");
  // audio要素を音源とするMediaElementAudioSourceNodeを生成
  var audio = context.createMediaElementSource(audioSrc);


  //ゲイン
  //中間処理（音量調整処理）を表すAudioNodeが持つAudioParamに
  //input要素の値を代入。表示にも値を反映する
  var elementGain = document.getElementById('gain');
  var elementGainValue = document.getElementById('gain-value');
  var gain = context.createGain();
  var setGain = function() {
    gain.gain.value = elementGainValue.innerText = elementGain.value;
  };
  setGain();


  //ローパスフィルター＆ハイパスフィルター
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


  //なにも選ばないときはこれ。
  //音源ノード → GainNode
  audio.connect(gain);
  //Gainノード -> 音声出力ノード
  gain.connect(context.destination);


  //AnalyserNodeオブジェクトを生成
  var analyser = context.createAnalyser();
  //解析対象の音声データを格納するための型付き配列を準備(Uint8Array:符号なし8bit整数の配列)
  //引数(配列の要素数)にはAnalyserNodeオブジェクトのfrequencyBinCountプロパティを設定する
  var frequencies = new Uint8Array(analyser.frequencyBinCount);
  //音量として、解析結果の全周波数の振幅の平均を計算する
  var getByteFrequencyDataAverage = function() {
    //配列に周波数ごとの振幅を格納
    analyser.getByteFrequencyData(frequencies);
    //解析結果の全周波数の振幅を合計し要素数で割ることで平均を求める
    return frequencies.reduce(function(previous, current) {
      return previous + current;
    }) / analyser.frequencyBinCount;
  };


  //マイク取得
  //音声のみ取得する場合は引数を{audio: true}に設定する
  //返り値はPromiseオブジェクト
  navigator.mediaDevices.getUserMedia({audio: true})
    // 成功ハンドラが引数としてMediaStreamオブジェクトを受け取る
    .then(function(stream) {
      // Firefoxには、グローバルに保持しておかないと
      // MediaStreamオブジェクトへの参照が時間経過でなくなってしまうバグがあるため、対策しておく
      window.hackForMozzila = stream;
      // MediaStreamAudioSourceNodeを生成
      // 引数にはMediaStreamオブジェクトが必要 アナライザーに接続
      context.createMediaStreamSource(stream).connect(analyser);
    });


  //ボリューム表示
  var draw;
  var elementVolume = document.getElementById('volume');
  //可能な限り高いフレームレートで音量を取得し、表示を更新する
  (draw = function() {
    elementVolume.innerHTML = Math.floor(getByteFrequencyDataAverage());
    requestAnimationFrame(draw);
  })();


  var elementImg = document.getElementById('prfmMagicOfLove');


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
