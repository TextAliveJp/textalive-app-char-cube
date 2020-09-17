import * as THREE from "three";
import { Player, stringToDataUrl } from "textalive-app-api";

/**
 * 
 * 3Dライブラリ「three.js」を使用したシンプルなデモ
 * 
 */
class Main
{
    constructor ()
    {
        var threeMng = new ThreeManager();
        this._threeMng = threeMng;

        this._initPlayer();
        
        window.addEventListener("resize", () => this._resize());
        this._update();
    }
    // プレイヤー初期化
    _initPlayer ()
    {
        var player = new Player({
            app: {
                appAuthor: "daniwell",
                appName: "Char Cube",
                parameters: [
                    {
                        title: "テキスト色",
                        name: "Color",
                        className: "Color",
                        initialValue: "#000000"
                    },
                    {
                        title: "背景色",
                        name: "BackgroundColor",
                        className: "Color",
                        initialValue: "#EEEEEE"
                    },
                ],
            },
            mediaElement: document.querySelector("#media")
        });
        
        player.addListener({
            onAppReady: (app) => this._onAppReady(app),
            onVideoReady: (v) => this._onVideoReady(v),
            onTimeUpdate: (pos) => this._onTimeUpdate(pos),
            onAppParameterUpdate: (name, value) => this._onAppParameterUpdate(name, value)
        });
        this._player = player;
    }
    // アプリ準備完了
    _onAppReady (app)
    {
        if (! app.songUrl)
        {
            this._player.createFromSongUrl("https://www.youtube.com/watch?v=-6oxY-quTOA", {
                // 歌詞タイミングをバージョン固定
                video: {
                    lyricId: 49058,
                    lyricDiffId: 2559
                },
                // 歌詞テキストを固定
                altLyricsUrl: stringToDataUrl(`
                    ほんとのコト　ほんとのキモチだけ　伝えられたらいいのにね　なんて
                    ときどき　考えたりするけど　そうそう　うまくはいかないみたいね
                    
                    たとえば　そう　愛想よく笑うあの子の真似とかしたりもするけど
                    たいてい　うわべだけで　どうにも　こうにも　なんとも　ならないもので
                    
                    それでも　ほら　キミが笑ってる　まわりはいつも別世界で
                    ふとしたとき　目と目があったら　ソワソワしちゃう　キミのせいだから
                    
                    恋のロンリ的に　誇大妄想　集中砲火で
                    キミのコトバのひとつひとつに　撃ち抜かれたハートは
                    たえず　不安定で　ときどき　転びそうにもなるけど
                    そっと　支えてくれる　そういうところが好きなのさ
                    
                    いつものコト　ありふれたコトバさえ　出てこなくて　モヤモヤしたりね
                    なんてね　悩んだりもするけど　そうそう　答えはみつからないのね
                    
                    たとえば　そう　曲がり角曲がって　偶然キミと出会ったときには
                    アタフタしてばかりで　どうにも　こうにも　なんとも　ならないもので
                    
                    それでも　ほら　キミが見つめてる　まわりはいつも別次元で
                    なにもかもが　ちっぽけに見える　机の上に答えは無いから
                    
                    恋のカガク的に　荒唐無稽　絵空事でも
                    キミの傍にいたいの　コトバなんていらないくらいに
                    たえず　隣にいて　持ちつ持たれつ　もたれかかりつで
                    そっと　手と手取り合う　そういう二人になりたいのさ
                    
                    恋のロンリ的に　矛盾だらけの　夢物語で
                    キミの右手左手　つかまえて離さないくらいは
                    たえず　空回りで　ときどき　転びそうにもなるけど
                    そっと　抱えてくれる　そういうところが好きなのさ
                `)
            });
        }

        // 画面クリックで再生／一時停止
        document.getElementById("view").addEventListener("click", () => function(p){ 
            if (p.isPlaying) p.requestPause();
            else             p.requestPlay();
        }(this._player));
    }
    // ビデオ準備完了
    _onVideoReady (v)
    {
        // 歌詞のセットアップ
        var lyrics = [];
        if (v.firstChar)
        {
            var c = v.firstChar;
            while (c)
            {
                lyrics.push(new Lyric(c));
                c = c.next;
            }
        }
        this._threeMng.setLyrics(lyrics);
    }
    // 再生位置アップデート
    _onTimeUpdate (position)
    {
        this._position   = position;
        this._updateTime = Date.now();

        this._threeMng.update(position);
    }
    // パラメタアップデート
    _onAppParameterUpdate (name, value)
    {
        var  col = value.r * 256 * 256 + value.g * 256 + value.b;
        switch (name)
        {
        case "Color":
            this._threeMng.changeColor(col);
            break;
        case "BackgroundColor":
            this._threeMng.changeBackgroundColor(col);
            break;
        }
    }

    _update ()
    {
        if (this._player.isPlaying && 0 <= this._updateTime && 0 <= this._position)
        {
            var t = (Date.now() - this._updateTime) + this._position;
            this._threeMng.update(t);
        }
        window.requestAnimationFrame(() => this._update());
    }
    _resize ()
    {
        this._threeMng.resize();
    }
}

class Lyric
{
    constructor (data)
    {
        this.text      = data.text;      // 歌詞文字
        this.startTime = data.startTime; // 開始タイム [ms]
        this.endTime   = data.endTime;   // 終了タイム [ms]
        this.duration  = data.duration;  // 開始から終了迄の時間 [ms]

        if (data.next && data.next.startTime - this.endTime < 500) this.endTime = data.next.startTime;
        else this.endTime += 500;
    }
}

class ThreeManager
{
    constructor ()
    {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;

        //
        // THREE.js (Renderer, Scene, Camera) の初期化
        //        
        var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(w, h);
        document.getElementById("view").appendChild(renderer.domElement);

        var col   = 0xeeeeee;
        var scene = new THREE.Scene();
        scene.background = new THREE.Color(col);

        var camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        camera.position.z = 20;
        camera.lookAt(0, 0, 0);

        this._renderer = renderer;
        this._scene    = scene;
        this._camera   = camera;

        this._color = "#000";

        // 歌詞表示用ボックスの生成
        this._can = document.createElement("canvas");
        this._ctx = this._can.getContext("2d");
        var tex = this._tex = new THREE.Texture(this._can);
        var mat = this._mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide });
        var box = this._box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), mat);
        scene.add(box);     
        
        this._drawFrame();
    }

    // 色の変更（外枠＆文字）
    changeColor (color)
    {
        var col = color.toString(16);
        for (var i = col.length; i < 6; i ++) col = "0" + col;
        this._color = "#" + col;
        
        this._drawFrame();
    }
    // 背景色の変更
    changeBackgroundColor (color)
    {
        this._scene.background.set(color);
    }
    // 歌詞の更新
    setLyrics (lyrics)
    {
        this._lyrics = lyrics;
    }

    // 再生位置アップデート
    update (position)
    {
        this._position = position;
        if (! this._lyrics) return;

        // 外枠を残してキャンバスをクリア
        this._ctx.clearRect(8, 8, this._can.width - 16, this._can.height - 16);
        var tk = "";

        for (var i = 0, l = this._lyrics.length; i < l; i ++)
        {
            var lyric = this._lyrics[i];
            // 開始タイム < 再生位置 && 再生位置 < 終了タイム
            if (lyric.startTime <= position && position < lyric.endTime)
            {
                // 歌詞の描画
                var progress = this._easeOutBack(Math.min((position - lyric.startTime) / Math.min(lyric.endTime - lyric.startTime, 200), 1));
                tk = lyric.text + progress;
                if (this._tk != tk) this._drawText(lyric.text, progress);
                break;
            }
        }
        // テクスチャの更新
        if (this._tk != tk) this._tex.needsUpdate = true;
        this._tk = tk;

        // ボックスの回転
        this._box.rotation.set(position / 1234, position / 2345, position / 3456);

        this._renderer.render(this._scene, this._camera);
    }
    // リサイズ
    resize ()
    {
        var stw = this._stw = document.documentElement.clientWidth;
        var sth = this._sth = document.documentElement.clientHeight;
        
        this._camera.aspect = stw / sth;
        this._camera.updateProjectionMatrix();
        
        this._renderer.setSize(stw, sth);
    }
    
    // 外枠（ワイヤーフレーム）の描画
    _drawFrame ()
    {
        var can = this._can;
        var ctx = this._ctx;

        can.width = can.height = 512;

        ctx.strokeStyle = this._color;
        ctx.lineWidth = 8;
        ctx.rect(0, 0, can.width, can.height);
        ctx.stroke();
        this._tex.needsUpdate = true;
    }
    // 文字の描画
    _drawText (text, progress)
    {
        var can = this._can;
        var ctx = this._ctx;

        var size = can.width;
        var fontSize = size * 0.5 * progress;
        ctx.textAlign = "center";
        ctx.fillStyle = this._color;
        ctx.font = "bold " + fontSize + "px sans-serif";

        ctx.fillText(text, size/2, size/2 + fontSize * 0.37);
    }
    _easeOutBack (x) { return 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2); }
}

new Main()