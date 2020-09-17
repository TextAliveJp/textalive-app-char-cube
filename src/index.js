import * as THREE from "three";
import { Player } from "textalive-app-api";

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
                altLyricsUrl: "data:text/plain;base64,44G744KT44Go44Gu44Kz44OI44CA44G744KT44Go44Gu44Kt44Oi44OB44Gg44GR44CA5Lyd44GI44KJ44KM44Gf44KJ44GE44GE44Gu44Gr44Gt44CA44Gq44KT44GmCuOBqOOBjeOBqeOBjeOAgOiAg+OBiOOBn+OCiuOBmeOCi+OBkeOBqeOAgOOBneOBhuOBneOBhuOAgOOBhuOBvuOBj+OBr+OBhOOBi+OBquOBhOOBv+OBn+OBhOOBrQoK44Gf44Go44GI44Gw44CA44Gd44GG44CA5oSb5oOz44KI44GP56yR44GG44GC44Gu5a2Q44Gu55yf5Ly844Go44GL44GX44Gf44KK44KC44GZ44KL44GR44GpCuOBn+OBhOOBpuOBhOOAgOOBhuOCj+OBueOBoOOBkeOBp+OAgOOBqeOBhuOBq+OCguOAgOOBk+OBhuOBq+OCguOAgOOBquOCk+OBqOOCguOAgOOBquOCieOBquOBhOOCguOBruOBpwoK44Gd44KM44Gn44KC44CA44G744KJ44CA44Kt44Of44GM56yR44Gj44Gm44KL44CA44G+44KP44KK44Gv44GE44Gk44KC5Yil5LiW55WM44GnCuOBteOBqOOBl+OBn+OBqOOBjeOAgOebruOBqOebruOBjOOBguOBo+OBn+OCieOAgOOCveODr+OCveODr+OBl+OBoeOCg+OBhuOAgOOCreODn+OBruOBm+OBhOOBoOOBi+OCiQoK5oGL44Gu44Ot44Oz44Oq55qE44Gr44CA6KqH5aSn5aaE5oOz44CA6ZuG5Lit56Cy54Gr44GnCuOCreODn+OBruOCs+ODiOODkOOBruOBsuOBqOOBpOOBsuOBqOOBpOOBq+OAgOaSg+OBoeaKnOOBi+OCjOOBn+ODj+ODvOODiOOBrwrjgZ/jgYjjgZrjgIDkuI3lronlrprjgafjgIDjgajjgY3jganjgY3jgIDou6LjgbPjgZ3jgYbjgavjgoLjgarjgovjgZHjgakK44Gd44Gj44Go44CA5pSv44GI44Gm44GP44KM44KL44CA44Gd44GG44GE44GG44Go44GT44KN44GM5aW944GN44Gq44Gu44GVCgoK44GE44Gk44KC44Gu44Kz44OI44CA44GC44KK44G144KM44Gf44Kz44OI44OQ44GV44GI44CA5Ye644Gm44GT44Gq44GP44Gm44CA44Oi44Ok44Oi44Ok44GX44Gf44KK44GtCuOBquOCk+OBpuOBreOAgOaCqeOCk+OBoOOCiuOCguOBmeOCi+OBkeOBqeOAgOOBneOBhuOBneOBhuOAgOetlOOBiOOBr+OBv+OBpOOBi+OCieOBquOBhOOBruOBrQoK44Gf44Go44GI44Gw44CA44Gd44GG44CA5puy44GM44KK6KeS5puy44GM44Gj44Gm44CA5YG254S244Kt44Of44Go5Ye65Lya44Gj44Gf44Go44GN44Gr44GvCuOCouOCv+ODleOCv+OBl+OBpuOBsOOBi+OCiuOBp+OAgOOBqeOBhuOBq+OCguOAgOOBk+OBhuOBq+OCguOAgOOBquOCk+OBqOOCguOAgOOBquOCieOBquOBhOOCguOBruOBpwoK44Gd44KM44Gn44KC44CA44G744KJ44CA44Kt44Of44GM6KaL44Gk44KB44Gm44KL44CA44G+44KP44KK44Gv44GE44Gk44KC5Yil5qyh5YWD44GnCuOBquOBq+OCguOBi+OCguOBjOOAgOOBoeOBo+OBveOBkeOBq+imi+OBiOOCi+OAgOacuuOBruS4iuOBq+etlOOBiOOBr+eEoeOBhOOBi+OCiQoK5oGL44Gu44Kr44Ks44Kv55qE44Gr44CA6I2S5ZSQ54Sh56i944CA57W156m65LqL44Gn44KCCuOCreODn+OBruWCjeOBq+OBhOOBn+OBhOOBruOAgOOCs+ODiOODkOOBquOCk+OBpuOBhOOCieOBquOBhOOBj+OCieOBhOOBqwrjgZ/jgYjjgZrjgIDpmqPjgavjgYTjgabjgIDmjIHjgaHjgaTmjIHjgZ/jgozjgaTjgIDjgoLjgZ/jgozjgYvjgYvjgorjgaTjgacK44Gd44Gj44Go44CA5omL44Go5omL5Y+W44KK5ZCI44GG44CA44Gd44GG44GE44GG5LqM5Lq644Gr44Gq44KK44Gf44GE44Gu44GVCgoK5oGL44Gu44Ot44Oz44Oq55qE44Gr44CA55+b55u+44Gg44KJ44GR44Gu44CA5aSi54mp6Kqe44GnCuOCreODn+OBruWPs+aJi+W3puaJi+OAgOOBpOOBi+OBvuOBiOOBpumbouOBleOBquOBhOOBj+OCieOBhOOBrwrjgZ/jgYjjgZrjgIDnqbrlm57jgorjgafjgIDjgajjgY3jganjgY3jgIDou6LjgbPjgZ3jgYbjgavjgoLjgarjgovjgZHjgakK44Gd44Gj44Go44CA5oqx44GI44Gm44GP44KM44KL44CA44Gd44GG44GE44GG44Go44GT44KN44GM5aW944GN44Gq44Gu44GV"
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