const phraseData = {
  "en": {
    "name": "English",
    "langCode": "en-US",
    "categories": {
      "greetings": {
        "name": "挨拶・基本",
        "icon": "fa-hand-wave",
        "phrases": [
          { "ja": "はい", "target": "Yes", "kana": "イエス" },
          { "ja": "いいえ", "target": "No", "kana": "ノー" },
          { "ja": "こんにちは", "target": "Hello", "kana": "ハロー" },
          { "ja": "おはようございます", "target": "Good morning", "kana": "グッド モーニング" },
          { "ja": "はじめまして", "target": "Nice to meet you", "kana": "ナイストゥ ミートゥ ユー" },
          { "ja": "お元気ですか？", "target": "How are you?", "kana": "ハウ アー ユー" },
          { "ja": "ありがとう", "target": "Thank you very much", "kana": "サンキュー ヴェリィ マッチ" },
          { "ja": "またね！", "target": "See you later", "kana": "シー ユー レイター" }
        ]
      },
      "hospitality": {
        "name": "おもてなし",
        "icon": "fa-mug-hot",
        "phrases": [
          { "ja": "何か飲む？", "target": "Would you like something to drink?", "kana": "ウッド ユー ライク サムシング トゥ ドリンク" },
          { "ja": "コーヒーと紅茶、どっちがいい？", "target": "Would you like coffee or tea?", "kana": "ウッド ユー ライク コーヒー オア ティ" },
          { "ja": "お茶を入れるね。", "target": "I'll make some tea.", "kana": "アイル メイク サム ティ" },
          { "ja": "お菓子もどうぞ。", "target": "Help yourself to some snacks.", "kana": "ヘルプ ユアセルフ トゥ サム スナックス" },
          { "ja": "遠慮しないでね。", "target": "Make yourself at home.", "kana": "メイク ユアセルフ アット ホーム" },
          { "ja": "もっと食べてね！", "target": "Have some more!", "kana": "ハヴ サム モア" },
          { "ja": "お口に合うといいんだけど。", "target": "I hope you like it.", "kana": "アイ ホープ ユー ライク イット" },
          { "ja": "これ、私が作ったんだよ。", "target": "I made this myself.", "kana": "アイ メイド ディス マイセルフ" },
          { "ja": "ゆっくりしていってね。", "target": "Stay as long as you like.", "kana": "ステイ アズ ロング アズ ユー ライク" },
          { "ja": "何か必要なものはある？", "target": "Do you need anything?", "kana": "ドゥ ユー ニード エニシング" }
        ]
      },
      "welcoming": {
        "name": "お出迎え",
        "icon": "fa-house-chimney",
        "phrases": [
          { "ja": "いらっしゃい！", "target": "Welcome!", "kana": "ウェルカム" },
          { "ja": "来てくれてありがとう！", "target": "Thanks for coming!", "kana": "サンクス フォー カミング" },
          { "ja": "どうぞ、入って！", "target": "Come on in!", "kana": "カム オン イン" },
          { "ja": "靴を脱いでね。", "target": "You can take your shoes off.", "kana": "ユー キャン テイク ユア シューズ オフ" },
          { "ja": "久しぶり！元気だった？", "target": "Long time no see! How have you been?", "kana": "ロング タイム ノー シー ハウ ハヴ ユー ビーン" },
          { "ja": "会えてうれしいよ！", "target": "It's so good to see you!", "kana": "イツ ソー グッド トゥ シー ユー" },
          { "ja": "道に迷わなかった？", "target": "Did you have any trouble finding the place?", "kana": "ディド ユー ハヴ エニ トラブル ファインディング ザ プレイス" },
          { "ja": "遠かったでしょう？お疲れさま。", "target": "It must have been a long trip. You must be tired.", "kana": "イット マスト ハヴ ビーン ア ロング トリップ ユー マスト ビー タイアード" },
          { "ja": "荷物を預かるよ。", "target": "Let me take your bag.", "kana": "レット ミー テイク ユア バッグ" },
          { "ja": "こっちに来て、座ってね。", "target": "Come over here and have a seat.", "kana": "カム オーバー ヒア アンド ハヴ ア シート" },
          { "ja": "最近どう？何か変わったことあった？", "target": "What's new? Anything exciting lately?", "kana": "ホワッツ ニュー エニシング エキサイティング レイトリー" },
          { "ja": "今度一緒にご飯でも行こうよ。", "target": "Let's grab a bite sometime.", "kana": "レッツ グラブ ア バイト サムタイム" },
          { "ja": "それは大変だったね。", "target": "That must have been tough.", "kana": "ダッツ マスト ハヴ ビーン タフ" },
          { "ja": "また連絡するね！", "target": "I'll talk to you later!", "kana": "アイル トーク トゥ ユー レイター" },
          { "ja": "今日は本当に楽しかった！", "target": "I had a really great time today!", "kana": "アイ ハヴd ア リアリー グレート タイム トゥデイ" }
        ]
      },
      "outing": {
        "name": "おでかけ",
        "icon": "fa-person-walking-luggage",
        "phrases": [
          { "ja": "着いた！", "target": "We're here!", "kana": "ウィアー ヒア" },
          { "ja": "着いたね！", "target": "We made it!", "kana": "ウィ メイド イット" },
          { "ja": "出発しよう！", "target": "Let's get going!", "kana": "レッツ ゲット ゴーイング" },
          { "ja": "気をつけてね。", "target": "Watch your step.", "kana": "ウォッチ ユア ステップ" },
          { "ja": "もうすぐだよ。", "target": "We'll be there in a minute.", "kana": "ウィル ビー ゼア イン ア ミニット" }
        ]
      },
      "mom": {
        "name": "お母さん",
        "icon": "fa-child-reaching",
        "phrases": [
          { "ja": "おかえり！", "target": "Welcome home!", "kana": "ウェルカム ホーム" },
          { "ja": "手を洗ってね。", "target": "Wash your hands.", "kana": "ウォッシュ ユア ハンドズ" },
          { "ja": "学校はどうだった？", "target": "How was school?", "kana": "ハウ ワズ スクール" },
          { "ja": "宿題は終わった？", "target": "Did you finish your homework?", "kana": "ディド ユー フィニッシュ ユア ホームワーク" },
          { "ja": "先に宿題を済ませちゃおう。", "target": "Let's get your homework done first.", "kana": "レッツ ゲット ユア ホームワーク ダン ファースト" },
          { "ja": "もうゲームはおしまい！", "target": "That's enough video games for now!", "kana": "ダッツ イナフ ビデオ ゲームズ フォー ナウ" },
          { "ja": "そろそろ片付けて。", "target": "It's time to clean up.", "kana": "イツ タイム トゥ クリーン アップ" },
          { "ja": "ごはんの時間だよ！", "target": "It's time for dinner!", "kana": "イツ タイム フォー ディナー" },
          { "ja": "好き嫌いしないで食べてね。", "target": "Try to eat a little of everything.", "kana": "トライ トゥ イート ア リトル オブ エブリシング" },
          { "ja": "おかわりいる？", "target": "Would you like some more?", "kana": "ウッド ユー ライク サム モア" },
          { "ja": "起きて！朝だよ！", "target": "Wake up! It's morning!", "kana": "ウェイク アップ イッツ モーニング" },
          { "ja": "顔を洗っておいで。", "target": "Go wash your face.", "kana": "ゴー ウォッシュ ユア フェイス" },
          { "ja": "歯を磨いてね。", "target": "Brush your teeth.", "kana": "ブラッシュ ユア ティース" },
          { "ja": "着替えてきて。", "target": "Go get dressed.", "kana": "ゴー ゲット ドレスド" },
          { "ja": "パジャマを片付けてね。", "target": "Put your pajamas away.", "kana": "プット ユア パジャマズ アウェイ" },
          { "ja": "朝ごはんできたよ！", "target": "Breakfast is ready!", "kana": "ブレックファスト イズ レディ" },
          { "ja": "早く食べないと遅刻するよ。", "target": "Hurry up and eat, or you'll be late.", "kana": "ハリー アップ アンド イート オア ユール ビー レイト" },
          { "ja": "忘れ物はない？", "target": "Do you have everything?", "kana": "ドゥ ユー ハヴ エブリシング" },
          { "ja": "準備できた？", "target": "Are you ready?", "kana": "アー ユー レディ" },
          { "ja": "さあ、行くよ！", "target": "Come on, let's go!", "kana": "カム オン レッツ ゴー" }
        ]
      },
      "discovery": {
        "name": "発見・気づき",
        "icon": "fa-lightbulb",
        "phrases": [
          { "ja": "見つけた！", "target": "Found it!", "kana": "ファウンド イット" },
          { "ja": "あった！", "target": "There it is!", "kana": "ゼア イズ イット" },
          { "ja": "ここにあったんだ！", "target": "Here it is!", "kana": "ヒア イズ イット" },
          { "ja": "わかった！", "target": "I got it!", "kana": "アイ ゴット イット" },
          { "ja": "あっ、そういうことか！", "target": "Oh, I get it now!", "kana": "オー アイ ゲット イット ナウ" },
          { "ja": "もしかして、これ？", "target": "Could it be this?", "kana": "クッド イット ビィ ディス" },
          { "ja": "あれ、なんだろう？", "target": "Huh, what's that?", "kana": "ハァ ワッツ ザット" },
          { "ja": "あっちに何かあるよ！", "target": "There's something over there!", "kana": "ゼアズ サムシング オーバー ゼア" },
          { "ja": "やっと見つけた！", "target": "I finally found it!", "kana": "アイ ファイナリー ファウンド イット" },
          { "ja": "こんなところにあったなんて！", "target": "I can't believe it was here!", "kana": "アイ カント ビリーブ イット ワズ ヒア" }
        ]
      },
      "reactions": {
        "name": "短いリアクション",
        "icon": "fa-comment-dots",
        "phrases": [
          { "ja": "えっ、本当？", "target": "Really?", "kana": "リアリー" },
          { "ja": "そっか！", "target": "I see!", "kana": "アイ シー" },
          { "ja": "もちろん！", "target": "Of course!", "kana": "オブ コース" },
          { "ja": "それ、めっちゃ面白いね！", "target": "That's so funny!", "kana": "ダッツ ソー ファニー" },
          { "ja": "本当にそう思う！", "target": "I totally agree!", "kana": "アイ トータリー アグリー" },
          { "ja": "それで、どうなったの？", "target": "So, what happened?", "kana": "ソー ホワット ハップンド" },
          { "ja": "ちょっとだけね。", "target": "Just a little.", "kana": "ジャスト ア リトル" },
          { "ja": "いいよ！", "target": "Sure!", "kana": "シュア" },
          { "ja": "こっちこっち！", "target": "Over here!", "kana": "オーバー ヒア" },
          { "ja": "あぶない！", "target": "Watch out!", "kana": "ウォッチ アウト" },
          { "ja": "ありがとう、助かったよ。", "target": "Thanks, that really helped.", "kana": "サンクス ザット リアリー ヘルプト" },
          { "ja": "どういたしまして。", "target": "You're welcome.", "kana": "ユアー ウェルカム" },
          { "ja": "なんでもないよ。", "target": "It's nothing.", "kana": "イツ ナッシング" }
        ]
      },
      "daily": {
        "name": "優しい日常会話",
        "icon": "fa-heart",
        "phrases": [
          { "ja": "すみません、通してください。", "target": "Excuse me, coming through.", "kana": "エクスキューズ ミー カミング スルー" },
          { "ja": "ちょっと待って！", "target": "Wait a second!", "kana": "ウェイト ア セカンド" },
          { "ja": "大丈夫だよ。", "target": "It's okay.", "kana": "イツ オッケー" },
          { "ja": "気にしないで！", "target": "Don't worry about it!", "kana": "ドント ウォーリー アバウト イット" },
          { "ja": "こっちにおいで。", "target": "Come over here.", "kana": "カム オーバー ヒア" },
          { "ja": "手をつないでね。", "target": "Hold my hand.", "kana": "ホールド マイ ハンド" },
          { "ja": "ゆっくり歩こうね。", "target": "Let's walk slowly.", "kana": "レッツ ウォーク スローリー" },
          { "ja": "転ばないように気をつけてね。", "target": "Be careful not to fall.", "kana": "ビー カルフール ノット トゥ フォール" },
          { "ja": "もうすぐ着くよ。", "target": "We'll be there soon.", "kana": "ウィル ビィ ゼア スーン" },
          { "ja": "見て見て！", "target": "Look, look!", "kana": "ルック ルック" },
          { "ja": "本当だ！", "target": "You're right!", "kana": "ユアー ライト" },
          { "ja": "やったね！", "target": "You did it!", "kana": "ユー ディッド イット" },
          { "ja": "もう一回やってみよう！", "target": "Let's try again!", "kana": "レッツ トライ アゲイン" },
          { "ja": "こわくないよ。", "target": "There's nothing to be afraid of.", "kana": "ゼアズ ナッシング トゥ ビィ アフレイド オブ" },
          { "ja": "泣かないで。そばにいるよ。", "target": "Don't cry. I'm right here.", "kana": "ドント クライ アイム ライト ヒア" },
          { "ja": "お腹すいた？", "target": "Are you hungry?", "kana": "アー ユー ハングリー" },
          { "ja": "お水を飲もうか。", "target": "Let's have some water.", "kana": "レッツ ハヴ サム ウォーター" },
          { "ja": "もう大丈夫？", "target": "Are you okay now?", "kana": "アー ユー オッケー ナウ" },
          { "ja": "一緒にやろう！", "target": "Let's do it together!", "kana": "レッツ ドゥ イット トゥゲザー" },
          { "ja": "またあとでね！", "target": "See you later!", "kana": "シー ユー レイター" }
        ]
      },
      "hospital": {
        "name": "病院を受診",
        "icon": "fa-hospital",
        "phrases": [
          { "ja": "今日はどうされましたか？", "target": "What brings you in today?", "kana": "ホワット ブリングズ ユー イン トゥデイ" },
          { "ja": "頭が痛いんです。", "target": "I have a headache.", "kana": "アイ ハヴ ア ヘラクエ" },
          { "ja": "昨日から熱があります。", "target": "I've had a fever since yesterday.", "kana": "アイヴ ハヴd ア フィーバー シンス イエスタデイ" },
          { "ja": "ここが痛みます。", "target": "It hurts right here.", "kana": "イット ハーツ ライト ヒア" },
          { "ja": "いつから症状がありますか？", "target": "When did your symptoms start?", "kana": "ホウェン ディッド ユア シンプトムズ スタート" },
          { "ja": "薬のアレルギーはありますか？", "target": "Do you have any medication allergies?", "kana": "ドゥ ユー ハヴ エニ メディケーション アレルギーズ" },
          { "ja": "息苦しさはありますか？", "target": "Are you having trouble breathing?", "kana": "アー ユー ハヴィング トラブル ブリージング" },
          { "ja": "薬を飲んで、しばらく様子を見てください。", "target": "Take this medicine and see how you feel.", "kana": "テイク ディス メディシン アンド シー ハウ ユー フィール" },
          { "ja": "検査を受ける必要があります。", "target": "You'll need to have some tests done.", "kana": "ユール ニード トゥ ハヴ サム テストス ダン" },
          { "ja": "何か質問はありますか？", "target": "Do you have any questions?", "kana": "ドゥ ユー ハヴ エニ クエスチョンズ" }
        ]
      },
      "directions": {
        "name": "道案内",
        "icon": "fa-map-location-dot",
        "phrases": [
          { "ja": "何かお困りですか？", "target": "Can I help you with something?", "kana": "キャン アイ ヘルプ ユー ウィズ サムシング" },
          { "ja": "どこに行きたいですか？", "target": "Where are you trying to go?", "kana": "ウェア アー ユー トライング トゥ ゴー" },
          { "ja": "この道をまっすぐ進んでください。", "target": "Go straight down this street.", "kana": "ゴー ストレート ダウン ディス ストリート" },
          { "ja": "次の角を右に曲がってください。", "target": "Turn right at the next corner.", "kana": "ターン ライト アット ザ ネクスト コーナー" },
          { "ja": "駅は近くにありますよ。", "target": "The station is nearby.", "kana": "ザ ステーション イズ ニアバイ" },
          { "ja": "歩いて10分くらいです。", "target": "It's about a ten-minute walk.", "kana": "イツ アバウト ア テン ミニット ウォーク" },
          { "ja": "信号を渡ったところにあります。", "target": "It's just across the street at the traffic light.", "kana": "イツ ジャスト アクロス ザ ストリート アット ザ トラフィック ライト" },
          { "ja": "この地図を見てください。", "target": "Take a look at this map.", "kana": "テイク ア ルック アット ディス マップ" },
          { "ja": "すみません、私も詳しくはわからないんです。", "target": "Sorry, I'm not really sure either.", "kana": "ソリー アイム ノット リアリー シュア イーザー" },
          { "ja": "気をつけて行ってくださいね！", "target": "Have a safe trip!", "kana": "ハヴ ア セーフ トリップ" }
        ]
      },
      "kids": {
        "name": "子供と話す",
        "icon": "fa-children",
        "phrases": [
          { "ja": "今日は学校どうだった？", "target": "How was school today?", "kana": "ハウ ワズ スクール トゥデイ" },
          { "ja": "宿題はもう終わった？", "target": "Are you done with your homework?", "kana": "アー ユー ダン ウィズ ユア ホームワーク" },
          { "ja": "ゆっくりでいいよ。焦らなくていいからね。", "target": "Take your time. There's no rush.", "kana": "テイク ユア タイム ゼアズ ノー ラッシュ" },
          { "ja": "すごいね！よく頑張ったね。", "target": "That's amazing! You did a great job!", "kana": "ダッツ アメイジング ユー ディッド ア グレート ジョブ" },
          { "ja": "何か困っていることある？", "target": "Is something bothering you?", "kana": "イズ サムシング ボダリング ユー" },
          { "ja": "忘れ物はない？", "target": "Did you forget anything?", "kana": "ディド ユー フォゲット エニシング" },
          { "ja": "気をつけて行ってきてね。", "target": "Have a good day. Be careful!", "kana": "ハヴ ア グッド デイ ビー カルフール" },
          { "ja": "もう少しだけ頑張ってみようか。", "target": "Let's try just a little harder.", "kana": "レッツ トライ ジャスト ア リトル ハーダー" },
          { "ja": "失敗しても大丈夫だよ。", "target": "It's okay to make mistakes.", "kana": "イツ オッケー トゥ メイク ミステイクス" },
          { "ja": "今日は一緒に遊ぼうか。", "target": "Let's play together today.", "kana": "レッツ プレイ トゥゲザー トゥデイ" }
        ]
      },
      "proverbs": {
        "name": "ことわざ・名台詞",
        "icon": "fa-quote-left",
        "phrases": [
          { "ja": "意志あるところに道は開ける。", "meaning": "アメリカのことわざ", "target": "Where there's a will, there's a way.", "kana": "ウェア デアズ ア ウィル ウェア デアズ ア ウェイ" },
          { "ja": "遅くなっても、やらないよりはまし。", "meaning": "アメリカのことわざ", "target": "Better late than never.", "kana": "ベター レイト ザン ネバー" },
          { "ja": "言葉より行動が大切。", "meaning": "アメリカのことわざ", "target": "Actions speak louder than words.", "kana": "アクションズ スピーク ラウダー ザン ワーズ" },
          { "ja": "どんな困難にも、希望の光はある。", "meaning": "イギリスのことわざ", "target": "Every cloud has a silver lining.", "kana": "エブリ クラウド ハズ ア シルバー ライニング" },
          { "ja": "人は見かけによらない。", "meaning": "英語圏のことわざ", "target": "Don't judge a book by its cover.", "kana": "ドント ジャッジ ア ブック バイ イッツ カバー" },
          { "ja": "早起きは三文の徳。", "meaning": "イギリスのことわざ", "target": "The early bird catches the worm.", "kana": "ジ アーリー バード キャッチズ ザ ワーム" },
          { "ja": "継続は力なり。", "meaning": "英語圏のことわざ", "target": "Practice makes perfect.", "kana": "プラクティス メイクス パーフェクト" },
          { "ja": "最後まで勝負はわからない。", "meaning": "アメリカのことわざ", "target": "It's not over until it's over.", "kana": "イッツ ノット オーバー アンティル イッツ オーバー" },
          { "ja": "無限の彼方へ、さあ行くぞ！", "meaning": "映画『トイ・ストーリー』(アメリカ)", "source": "バズ・ライトイヤーの決め台詞", "target": "To infinity and beyond!", "kana": "トゥ インフィニティ アンド ビヨンド" },
          { "ja": "フォースとともにあらんことを。", "meaning": "映画『スター・ウォーズ』(アメリカ)", "source": "名台詞", "target": "May the Force be with you.", "kana": "メイ ザ フォース ビィ ウィズ ユー" }
        ]
      },
      "cafe_service": {
        "name": "カフェの接客",
        "icon": "fa-coffee",
        "phrases": [
          { "ja": "いらっしゃいませ！", "target": "Hi! Welcome in!", "kana": "ハイ ウェルカム イン" },
          { "ja": "ご注文はお決まりですか？", "target": "What can I get for you?", "kana": "ホワット キャン アイ ゲット フォー ユー" },
          { "ja": "店内でお召し上がりですか？お持ち帰りですか？", "target": "For here or to go?", "kana": "フォー ヒア オア トゥ ゴー" },
          { "ja": "サイズはいかがなさいますか？", "target": "What size would you like?", "kana": "ホワット サイズ ウッド ユー ライク" },
          { "ja": "ミルクの種類はどうされますか？", "target": "What kind of milk would you like?", "kana": "ホワット カインド オブ ミルク ウッド ユー ライク" },
          { "ja": "ホットとアイス、どちらになさいますか？", "target": "Would you like that hot or iced?", "kana": "ウッド ユー ライク ザット ホット オア アイスド" },
          { "ja": "お名前をお伺いしてもよろしいですか？", "target": "Can I get your name?", "kana": "キャン アイ ゲット ユア ネーム" },
          { "ja": "ご注文を繰り返します。", "target": "Let me repeat your order.", "kana": "レット ミー リピート ユア オーダー" },
          { "ja": "お待たせいたしました！", "target": "Thanks for waiting!", "kana": "サンクス フォー ウェイティング" },
          { "ja": "ごゆっくりお過ごしください。", "target": "Enjoy your drink!", "kana": "エンジョイ ユア ドリンク" }
        ]
      },
      "general_store_service": {
        "name": "雑貨屋さんの接客",
        "icon": "fa-store",
        "phrases": [
          { "ja": "何かお探しですか？", "target": "Are you looking for anything in particular?", "kana": "アー ユー ルッキング フォー エニシング イン パティキュラー" },
          { "ja": "どうぞご自由にご覧ください。", "target": "Feel free to look around.", "kana": "フィール フリー トゥ ルック アラウンド" },
          { "ja": "こちらが新商品です。", "target": "These are our new arrivals.", "kana": "ディーズ アー アワ ニュー アライバルズ" },
          { "ja": "こちらが一番人気です。", "target": "This is our most popular item.", "kana": "ディス イズ アワ モスト ポピュラー アイテム" },
          { "ja": "色違いもございます。", "target": "It comes in other colors, too.", "kana": "イット カムズ イン アザー カラーズ トゥー" },
          { "ja": "お手に取ってご覧ください。", "target": "Feel free to pick it up.", "kana": "フィール フリー トゥ ピック イット アップ" },
          { "ja": "プレゼント用ですか？", "target": "Is it a gift?", "kana": "イズ イット ア ギフト" },
          { "ja": "ラッピングいたしましょうか？", "target": "Would you like it gift-wrapped?", "kana": "ウッド ユー ライク イット ギフト ラップト" },
          { "ja": "お会計はこちらです。", "target": "You can pay right here.", "kana": "ユー キャン ペイ ライト ヒア" },
          { "ja": "またお越しくださいませ。", "target": "We hope to see you again!", "kana": "ウィ ホープ トゥ シー ユー アゲイン" }
        ]
      },
      "math_dialogue": {
        "name": "数学のセリフ",
        "icon": "fa-calculator",
        "phrases": [
          { "ja": "まず問題をよく読んでみよう。", "target": "Let's read the problem carefully first.", "kana": "レッツ リード ザ プロブレム ケアーフルリー ファースト" },
          { "ja": "答えはいくつになりますか？", "target": "What do you get for your answer?", "kana": "ホワット ドゥ ユー ゲット フォー ユア アンサー" },
          { "ja": "ここに数字を書いてください。", "target": "Write the number here.", "kana": "ライト ザ ナンバー ヒア" },
          { "ja": "これらの数字を足してください。", "target": "Add these numbers.", "kana": "アド ディーズ ナンバーズ" },
          { "ja": "大きい数から小さい数を引きます。", "target": "Subtract the smaller number from the larger one.", "kana": "サブトラクト ザ スモラー ナンバー フロム ザ ラージャー ワン" },
          { "ja": "何倍になりますか？", "target": "How many times greater is it?", "kana": "ハウ メニー タイズ グレイター イズ イット" },
          { "ja": "これを半分に分けましょう。", "target": "Let's divide this in half.", "kana": "レッツ ディバイド ディス イン ハーフ" },
          { "ja": "分数で表してみよう。", "target": "Let's write it as a fraction.", "kana": "レッツ ライト イット アズ ア フラクション" },
          { "ja": "答えを確かめてみよう。", "target": "Let's check the answer.", "kana": "レッツ チェック ザ アンサー" },
          { "ja": "どうしてそうなるのか説明できる？", "target": "Can you explain why?", "kana": "キャン ユー エクスプレイン ホワイ" }
        ]
      },
      "cooking_dialogue": {
        "name": "料理のセリフ",
        "icon": "fa-utensils",
        "phrases": [
          { "ja": "まず野菜を洗ってね。", "target": "Wash the vegetables first.", "kana": "ウォッシュ ザ ベジタブルズ ファースト" },
          { "ja": "玉ねぎを薄く切って。", "target": "Slice the onion thinly.", "kana": "スライス ザ オニオン シンリー" },
          { "ja": "お鍋に油を入れて。", "target": "Pour some oil into the pot.", "kana": "ポール サム オイル イン トゥ ザ ポット" },
          { "ja": "中火で炒めてね。", "target": "Cook it over medium heat.", "kana": "クック イット オーバー ミディアム ヒート" },
          { "ja": "よく混ぜてね。", "target": "Mix it well.", "kana": "ミックス イット ウェル" },
          { "ja": "塩を少し加えて。", "target": "Add a little salt.", "kana": "アド ア リトル ソルト" },
          { "ja": "ふたをして煮込んでね。", "target": "Put the lid on and let it simmer.", "kana": "プット ザ リッド オン アンド レット イット シマー" },
          { "ja": "焦げないように気をつけて！", "target": "Be careful not to burn it!", "kana": "ビー カルフール ノット トゥ バーン イット" },
          { "ja": "味見してみて。", "target": "Give it a taste.", "kana": "ギヴ イット ア テスト" },
          { "ja": "さあ、できあがり！", "target": "And it's ready!", "kana": "アンド イッツ レディ" }
        ]
      }
    }
  },
  "es": {
    "name": "Español",
    "langCode": "es-ES",
    "categories": {
      "greetings": {
        "name": "挨拶・基本",
        "icon": "fa-hand-wave",
        "phrases": [
          { "ja": "はい", "target": "Sí", "kana": "シ", "enText": "Yes" },
          { "ja": "いいえ", "target": "No", "kana": "ノ", "enText": "No" },
          { "ja": "こんにちは", "target": "Hola", "kana": "オラ", "enText": "Hello" },
          { "ja": "おはようございます", "target": "Buenos días", "kana": "ブエノス ディアス", "enText": "Good morning" },
          { "ja": "こんばんは", "target": "Buenas noches", "kana": "ブエナス ノチェス", "enText": "Good evening" },
          { "ja": "はじめまして", "target": "Mucho gusto", "kana": "ムーチョ グスト", "enText": "Nice to meet you" },
          { "ja": "ありがとう", "target": "Muchas gracias", "kana": "ムーチャス グラシアス", "enText": "Thank you very much" },
          { "ja": "さようなら", "target": "Hasta luego", "kana": "アスタ ルエゴ", "enText": "See you later" }
        ]
      },
      "hospitality": {
        "name": "おもてなし",
        "icon": "fa-mug-hot",
        "phrases": [
          { "ja": "何か飲む？", "target": "¿Quieres tomar algo?", "kana": "キエレス トマール アルゴ", "enText": "Would you like something to drink?" },
          { "ja": "コーヒーと紅茶、どっちがいい？", "target": "¿Prefieres café o té?", "kana": "プレフィエレス カフェ オ テ", "enText": "Would you like coffee or tea?" },
          { "ja": "お茶を入れるね。", "target": "Voy a preparar un té.", "kana": "ボイ ア プレパラール ウン テ", "enText": "I'll make some tea." },
          { "ja": "お菓子もどうぞ。", "target": "Sírvete unos dulces.", "kana": "シルベテ ウノス ドゥルセス", "enText": "Help yourself to some snacks." },
          { "ja": "遠慮しないでね。", "target": "No te cortes.", "kana": "ノ テ コルテス", "enText": "Make yourself at home." },
          { "ja": "もっと食べてね！", "target": "¡Come un poco más!", "kana": "コメ ウン ポコ マス", "enText": "Have some more!" },
          { "ja": "お口に合うといいんだけど。", "target": "Espero que te guste.", "kana": "エスペロ ケ テ グステ", "enText": "I hope you like it." },
          { "ja": "これ、私が作ったんだよ。", "target": "Lo he hecho yo.", "kana": "ロ エ エチョ ジョ", "enText": "I made this myself." },
          { "ja": "ゆっくりしていってね。", "target": "Quédate todo el tiempo que quieras.", "kana": "ケダテ トド エル ティエンポ ケ キエラス", "enText": "Stay as long as you like." },
          { "ja": "何か必要なものはある？", "target": "¿Necesitas algo?", "kana": "ネセシタス アルゴ", "enText": "Do you need anything?" }
        ]
      },
      "welcoming": {
        "name": "お出迎え",
        "icon": "fa-house-chimney",
        "phrases": [
          { "ja": "いらっしゃい！", "target": "¡Bienvenido!", "kana": "ビエンベニド", "enText": "Welcome!" },
          { "ja": "来てくれてありがとう！", "target": "¡Gracias por venir!", "kana": "グラシアス ポル ベニール", "enText": "Thanks for coming!" },
          { "ja": "どうぞ、入って！", "target": "¡Pasa, pasa!", "kana": "パサ パサ", "enText": "Come on in!" },
          { "ja": "靴を脱いでね。", "target": "Puedes quitarte los zapatos.", "kana": "プエデス キタルトス ロス サパトス", "enText": "You can take your shoes off." },
          { "ja": "久しぶり！元気だった？", "target": "¡Cuánto tiempo! ¿Qué tal estás?", "kana": "クアント ティエンポ ケ タル エスタス", "enText": "Long time no see! How have you been?" },
          { "ja": "会えてうれしいよ！", "target": "¡Qué alegría verte!", "kana": "ケ アレグリア ベルテ", "enText": "It's so good to see you!" },
          { "ja": "道に迷わなかった？", "target": "¿Te ha costado encontrar la casa?", "kana": "テ ア コスタド エンコントラル ラ カサ", "enText": "Did you have any trouble finding the place?" },
          { "ja": "遠かったでしょう？お疲れさま。", "target": "Habrá sido un viaje largo.", "kana": "アブラ シド ウン ビアヘラルゴ", "enText": "It must have been a long trip." },
          { "ja": "荷物を預かるよ。", "target": "Déjame que te coja el bolso.", "kana": "デハメ ケ テ コハ エル ボルソ", "enText": "Let me take your bag." },
          { "ja": "こっちに来て、座ってね。", "target": "Ven por aquí y siéntate.", "kana": "ベン ポル アキ イ シエンタテ", "enText": "Come over here and have a seat." },
          { "ja": "最近どう？何か変わったことあった？", "target": "¿Qué hay de nuevo?", "kana": "ケ ハイ デ ニューボ", "enText": "What's new?" },
          { "ja": "今度一緒にご飯でも行こうよ。", "target": "A ver si quedamos un día para comer.", "kana": "ア ベル シ ケダモス ウン ディア パラ コメル", "enText": "Let's grab a bite sometime." },
          { "ja": "それは大変だったね。", "target": "Vaya, qué duro habrá sido.", "kana": "バヤ ケ ドゥロ アブラ シド", "enText": "That must have been tough." },
          { "ja": "また連絡するね！", "target": "¡Hablamos luego!", "kana": "アブラモス ルエゴ", "enText": "I'll talk to you later!" },
          { "ja": "今日は本当に楽しかった！", "target": "¡Me lo he pasado genial hoy!", "kana": "メ ロ エ パサド ヘニアル ホイ", "enText": "I had a really great time today!" }
        ]
      },
      "outing": {
        "name": "おでかけ",
        "icon": "fa-person-walking-luggage",
        "phrases": [
          { "ja": "着いた！", "target": "¡Ya llegamos!", "kana": "ヤ ジェガモス", "enText": "We're here!" },
          { "ja": "到着したよ！", "target": "¡Hemos llegado!", "kana": "エモス ジェガド", "enText": "We made it!" },
          { "ja": "さあ、出発しよう！", "target": "¡Vámonos!", "kana": "バモノス", "enText": "Let's get going!" },
          { "ja": "気をつけてね。", "target": "Ten cuidado.", "kana": "テン クイドーダ", "enText": "Watch your step." },
          { "ja": "もうすぐ着くよ。", "target": "Ya casi llegamos.", "kana": "ヤ カシ ジェガモス", "enText": "We'll be there soon." }
        ]
      },
      "mom": {
        "name": "お母さん",
        "icon": "fa-child-reaching",
        "phrases": [
          { "ja": "おかえり！", "target": "¡Bienvenido a casa!", "kana": "ビエンベニド ア カサ", "enText": "Welcome home!" },
          { "ja": "手を洗ってね。", "target": "Lávate las manos.", "kana": "ラバテ ラス マノス", "enText": "Wash your hands." },
          { "ja": "学校はどうだった？", "target": "¿Qué tal el cole?", "kana": "ケ タル エル コレ", "enText": "How was school?" },
          { "ja": "宿題は終わった？", "target": "¿Has terminado los deberes?", "kana": "アス テルミナド ロス デベレス", "enText": "Did you finish your homework?" },
          { "ja": "先に宿題を済ませちゃおう。", "target": "Vamos a hacer primero los deberes.", "kana": "バモス ア アセル プリーメロ ロス デベレス", "enText": "Let's get your homework done first." },
          { "ja": "もうゲームはおしまい！", "target": "¡Ya basta de videojuegos por hoy!", "kana": "ヤ バスタ デ ビデオフエゴス ポル ホイ", "enText": "That's enough video games for now!" },
          { "ja": "そろそろ片付けて。", "target": "Ya va siendo hora de recoger.", "kana": "ヤ バ シエンド オラ デ レコヘル", "enText": "It's time to clean up." },
          { "ja": "ごはんの時間だよ！", "target": "¡Es hora de cenar!", "kana": "エス オラ デ セナル", "enText": "It's time for dinner!" },
          { "ja": "好き嫌いしないで食べてね。", "target": "Intenta comer un poco de todo.", "kana": "インテンタ コメル ウン ポコ デ トド", "enText": "Try to eat a little of everything." },
          { "ja": "おかわりいる？", "target": "¿Quieres repetir?", "kana": "キエレス レペティール", "enText": "Would you like some more?" },
          { "ja": "起きて！朝だよ！", "target": "¡Despierta! ¡Ya es de día!", "kana": "デスピエルタ ヤ エス デ ディア", "enText": "Wake up! It's morning!" },
          { "ja": "顔を洗っておいで。", "target": "Ve a lavarte la cara.", "kana": "ベ ア ラヴァルト ラ カラ", "enText": "Go wash your face." },
          { "ja": "歯を磨いてね。", "target": "Lávate los dientes.", "kana": "ラバテ ロス ディエンテス", "enText": "Brush your teeth." },
          { "ja": "着替えてきて。", "target": "Ve a vestirte.", "kana": "ベ ア ベスティルト", "enText": "Go get dressed." },
          { "ja": "パジャマを片付けてね。", "target": "Guarda el pijama.", "kana": "グアルダ エル ピヤマ", "enText": "Put your pajamas away." },
          { "ja": "朝ごはんできたよ！", "target": "¡El desayuno está listo!", "kana": "エル デサジュノ エスタ リスト", "enText": "Breakfast is ready!" },
          { "ja": "早く食べないと遅刻するよ。", "target": "Date prisa y desayuna, que vas a llegar tarde.", "kana": "ダテ プリサ イ デサジュナ ケ バス ア ジェガール タルデ", "enText": "Hurry up and eat, or you'll be late." },
          { "ja": "忘れ物はない？", "target": "¿Llevas todo lo que necesitas?", "kana": "ジェバス トド ロ ケ ネセシタス", "enText": "Do you have everything?" },
          { "ja": "準備できた？", "target": "¿Estás listo?", "kana": "エスタス リスト", "enText": "Are you ready?" },
          { "ja": "さあ、行くよ！", "target": "¡Venga, nos vamos!", "kana": "ベンガ ノス バモス", "enText": "Come on, let's go!" }
        ]
      },
      "discovery": {
        "name": "発見・気づき",
        "icon": "fa-lightbulb",
        "phrases": [
          { "ja": "見つけた！", "target": "¡Lo encontré!", "kana": "ロ エンコントレ", "enText": "Found it!" },
          { "ja": "あった！", "target": "¡Ahí está!", "kana": "アイ エスタ", "enText": "There it is!" },
          { "ja": "ここにあったんだ！", "target": "¡Aquí estaba!", "kana": "アキ エスタバ", "enText": "Here it is!" },
          { "ja": "わかった！", "target": "¡Ya lo tengo!", "kana": "ヤ ロ テンゴ", "enText": "I got it!" },
          { "ja": "あっ、そういうことか！", "target": "¡Ah, ahora lo entiendo!", "kana": "ア アオラ ロ エンティエンド", "enText": "Oh, I get it now!" },
          { "ja": "もしかして、これ？", "target": "¿Será esto?", "kana": "セラ エスト", "enText": "Could it be this?" },
          { "ja": "あれ、なんだろう？", "target": "¿Eh? ¿Qué será eso?", "kana": "エ ケ セラ エソ", "enText": "Huh, what's that?" },
          { "ja": "あっちに何かあるよ！", "target": "¡Hay algo por allí!", "kana": "アイ アルゴ ポル アジ", "enText": "There's something over there!" },
          { "ja": "やっと見つけた！", "target": "¡Por fin lo encontré!", "kana": "ポル フィン ロ エンコントレ", "enText": "I finally found it!" },
          { "ja": "こんなところにあったなんて！", "target": "¡No me puedo creer que estuviera aquí!", "kana": "ノ メ プエド クレール ケ エストゥビエラ アキ", "enText": "I can't believe it was here!" }
        ]
      },
      "reactions": {
        "name": "短いリアクション",
        "icon": "fa-comment-dots",
        "phrases": [
          { "ja": "えっ、本当？", "target": "¿De verdad?", "kana": "デ ベルダット", "enText": "Really?" },
          { "ja": "そっか！", "target": "¡Ya veo!", "kana": "ヤ ベオ", "enText": "I see!" },
          { "ja": "もちろん！", "target": "¡Por supuesto!", "kana": "ポル スプエスト", "enText": "Of course!" },
          { "ja": "それ、めっちゃ面白いね！", "target": "¡Qué gracioso!", "kana": "ケ グラシオソ", "enText": "That's so funny!" },
          { "ja": "本当にそう思う！", "target": "¡Estoy totalmente de acuerdo!", "kana": "エストイ トタルメンテ デ アクエルド", "enText": "I totally agree!" },
          { "ja": "それで、どうなったの？", "target": "Y entonces, ¿qué pasó?", "kana": "イ エントンセス ケ パソ", "enText": "So, what happened?" },
          { "ja": "ちょっとだけね。", "target": "Solo un poquito.", "kana": "ソロ ウン ポキート", "enText": "Just a little." },
          { "ja": "いいよ！", "target": "¡Vale!", "kana": "バレ", "enText": "Sure!" },
          { "ja": "こっちこっち！", "target": "¡Por aquí!", "kana": "ポル アキ", "enText": "Over here!" },
          { "ja": "あぶない！", "target": "¡Cuidado!", "kana": "クイドーダ", "enText": "Watch out!" },
          { "ja": "ありがとう、助かったよ。", "target": "Gracias, me has ayudado mucho.", "kana": "グラシアス メ アス アジュダド ムーチョ", "enText": "Thanks, that really helped." },
          { "ja": "どういたしまして。", "target": "De nada.", "kana": "デ ナダ", "enText": "You're welcome." },
          { "ja": "なんでもないよ。", "target": "No es nada.", "kana": "ノ エス ナダ", "enText": "It's nothing." }
        ]
      },
      "daily": {
        "name": "優しい日常会話",
        "icon": "fa-heart",
        "phrases": [
          { "ja": "すみません、通してください。", "target": "Perdona, ¿me dejas pasar?", "kana": "ペルドナ メ デハス パサル", "enText": "Excuse me, coming through." },
          { "ja": "ちょっと待って！", "target": "¡Espera un momento!", "kana": "エスペラ ウン モメント", "enText": "Wait a second!" },
          { "ja": "大丈夫だよ。", "target": "No pasa nada.", "kana": "ノ パサ ナダ", "enText": "It's okay." },
          { "ja": "気にしないで！", "target": "¡No te preocupes!", "kana": "ノ テ プレオクペス", "enText": "Don't worry about it!" },
          { "ja": "こっちにおいで。", "target": "Ven aquí.", "kana": "ベン アキ", "enText": "Come over here." },
          { "ja": "手をつないでね。", "target": "Dame la mano.", "kana": "ダメ ラ マノ", "enText": "Hold my hand." },
          { "ja": "ゆっくり歩こうね。", "target": "Vamos despacito.", "kana": "バモス デスパシート", "enText": "Let's walk slowly." },
          { "ja": "転ばないように気をつけてね。", "target": "Ten cuidado de no caerte.", "kana": "テン クイドーダ デ ノ カエルテ", "enText": "Be careful not to fall." },
          { "ja": "もうすぐ着くよ。", "target": "Ya casi llegamos.", "kana": "ヤ カシ ジェガモス", "enText": "We'll be there soon." },
          { "ja": "見て見て！", "target": "¡Mira, mira!", "kana": "ミラ ミラ", "enText": "Look, look!" },
          { "ja": "本当だ！", "target": "¡Es verdad!", "kana": "エス ベルダット", "enText": "You're right!" },
          { "ja": "やったね！", "target": "¡Lo has conseguido!", "kana": "ロ アス コンセギド", "enText": "You did it!" },
          { "ja": "もう一回やってみよう！", "target": "¡Vamos a intentarlo otra vez!", "kana": "バモス ア インテンタルロ オトラ ベス", "enText": "Let's try again!" },
          { "ja": "こわくないよ。", "target": "No tengas miedo.", "kana": "ノ テンガス ミエド", "enText": "There's nothing to be afraid of." },
          { "ja": "泣かないで。そばにいるよ。", "target": "No llores. Estoy aquí contigo.", "kana": "ノ ジョレス エストイ アキ コンティゴ", "enText": "Don't cry. I'm right here." },
          { "ja": "お腹すいた？", "target": "¿Tienes hambre?", "kana": "ティエネス アンブレ", "enText": "Are you hungry?" },
          { "ja": "お水を飲もうか。", "target": "Vamos a beber un poco de agua.", "kana": "バモス ア ベベル ウン ポコ デ アグア", "enText": "Let's have some water." },
          { "ja": "もう大丈夫？", "target": "¿Ya estás bien?", "kana": "ヤ エスタス ビエン", "enText": "Are you okay now?" },
          { "ja": "一緒にやろう！", "target": "¡Vamos a hacerlo juntos!", "kana": "バモス ア アセルロ フントス", "enText": "Let's do it together!" },
          { "ja": "またあとでね！", "target": "¡Hasta luego!", "kana": "アスタ ルエゴ", "enText": "See you later!" }
        ]
      },
      "hospital": {
        "name": "病院を受診",
        "icon": "fa-hospital",
        "phrases": [
          { "ja": "今日はどうされましたか？", "target": "¿Qué le trae por aquí hoy?", "kana": "ケ レ トラエ ポル アキ ホイ", "enText": "What brings you in today?" },
          { "ja": "頭が痛いんです。", "target": "Me duele la cabeza.", "kana": "メ ドゥエレ ラ カベサ", "enText": "I have a headache." },
          { "ja": "昨日から熱があります。", "target": "Tengo fiebre desde ayer.", "kana": "テンゴ フィエブレ デスデ アジェール", "enText": "I've had a fever since yesterday." },
          { "ja": "ここが痛みます。", "target": "Me duele aquí.", "kana": "メ ドゥエレ アキ", "enText": "It hurts right here." },
          { "ja": "いつから症状がありますか？", "target": "¿Desde cuándo tiene estos síntomas?", "kana": "デスデ クアンド ティエネ エストス シントマス", "enText": "When did your symptoms start?" },
          { "ja": "薬のアレルギーはありますか？", "target": "¿Tiene alguna alergia a medicamentos?", "kana": "ティエネ アルグナ アレルヒア ア メディカメントス", "enText": "Do you have any medication allergies?" },
          { "ja": "息苦しさはありますか？", "target": "¿Tiene dificultad para respirar?", "kana": "ティエネ ディフィクルトッド パラ レスピラル", "enText": "Are you having trouble breathing?" },
          { "ja": "薬を飲んで、しばらく様子を見てください。", "target": "Tome este medicamento y observe cómo se encuentra.", "kana": "トメ エステ メディカメント", "enText": "Take this medicine and see how you feel." },
          { "ja": "検査を受ける必要があります。", "target": "Tendrá que hacerse unas pruebas.", "kana": "テンドラ ケ アセールセ ウナス プルエバス", "enText": "You'll need to have some tests done." },
          { "ja": "何か質問はありますか？", "target": "¿Tiene alguna pregunta?", "kana": "ティエネ アルグナ プレグンタ", "enText": "Do you have any questions?" }
        ]
      },
      "directions": {
        "name": "道案内",
        "icon": "fa-map-location-dot",
        "phrases": [
          { "ja": "何かお困りですか？", "target": "¿Necesita ayuda?", "kana": "ネセシタ アジュダ", "enText": "Can I help you with something?" },
          { "ja": "どこに行きたいですか？", "target": "¿Adónde quiere ir?", "kana": "アドンデ キエレ イール", "enText": "Where are you trying to go?" },
          { "ja": "この道をまっすぐ進んでください。", "target": "Siga todo recto por esta calle.", "kana": "シガ トド レクト ポル エスタ カリェ", "enText": "Go straight down this street." },
          { "ja": "次の角を右に曲がってください。", "target": "Gire a la derecha en la próxima esquina.", "kana": "ヒレ ア ラ デレチャ エン ラ プロキシマ エスキナ", "enText": "Turn right at the next corner." },
          { "ja": "駅はこの近くにありますよ。", "target": "La estación está cerca de aquí.", "kana": "ラ エスタシオン エスタ セルカ デ アキ", "enText": "The station is nearby." },
          { "ja": "歩いて10分くらいです。", "target": "Está a unos diez minutos a pie.", "kana": "エスタ ア ウノス ディエス ミヌトス ア ピエ", "enText": "It's about a ten-minute walk." },
          { "ja": "信号を渡ったところにあります。", "target": "Está justo al otro lado, después del semáforo.", "kana": "エスタ フスト アル オトロ ラド", "enText": "It's just across the street at the traffic light." },
          { "ja": "この地図を見てください。", "target": "Mire este mapa.", "kana": "ミレ エステ マパ", "enText": "Take a look at this map." },
          { "ja": "すみません、私も詳しくはわからないんです。", "target": "Lo siento, yo tampoco lo sé muy bien.", "kana": "ロ シエント ジョ タンポコ ロ セ ムイ ビエン", "enText": "Sorry, I'm not really sure either." },
          { "ja": "気をつけて行ってくださいね！", "target": "¡Que tenga buen viaje!", "kana": "ケ テガ ブエン ビアヘ", "enText": "Have a safe trip!" }
        ]
      },
      "kids": {
        "name": "子供と話す",
        "icon": "fa-children",
        "phrases": [
          { "ja": "今日は学校どうだった？", "target": "¿Qué tal el cole hoy?", "kana": "ケ タル エル コレ ホイ", "enText": "How was school today?" },
          { "ja": "宿題はもう終わった？", "target": "¿Has terminado los deberes?", "kana": "アス テルミナド ロス デベレス", "enText": "Are you done with your homework?" },
          { "ja": "ゆっくりでいいよ。焦らなくていいからね。", "target": "Tómate tu tiempo. No hay prisa.", "kana": "トマテ トゥ ティエンポ ノ ハイ プリサ", "enText": "Take your time. There's no rush." },
          { "ja": "すごいね！よく頑張ったね。", "target": "¡Qué bien! ¡Lo has hecho genial!", "kana": "ケ ビエン ロ アス エチョ ヘニアル", "enText": "That's amazing! You did a great job!" },
          { "ja": "何か困っていることある？", "target": "¿Te pasa algo?", "kana": "テ パサ アルゴ", "enText": "Is something bothering you?" },
          { "ja": "忘れ物はない？", "target": "¿Te dejas algo?", "kana": "テ デハス アルゴ", "enText": "Did you forget anything?" },
          { "ja": "気をつけて行ってきてね。", "target": "¡Que tengas buen día! ¡Ten cuidado!", "kana": "ケ テガス ブエン ディア", "enText": "Have a good day. Be careful!" },
          { "ja": "もう少しだけ頑張ってみようか。", "target": "Vamos a intentarlo un poquito más.", "kana": "バモス ア インテンタルロ ウン ポキート マス", "enText": "Let's try just a little harder." },
          { "ja": "失敗しても大丈夫だよ。", "target": "No pasa nada si te equivocas.", "kana": "ノ パサ ナダ シ テ エキボカス", "enText": "It's okay to make mistakes." },
          { "ja": "今日は一緒に遊ぼうか。", "target": "¿Jugamos juntos hoy?", "kana": "フガモス フントス ホイ", "enText": "Let's play together today." }
        ]
      },
      "proverbs": {
        "name": "ことわざ・名台詞",
        "icon": "fa-quote-left",
        "phrases": [
          { "ja": "意志あるところに道は開ける。", "meaning": "アメリカのことわざ", "target": "Querer es poder.", "kana": "ケレル エ ポテレ", "enText": "Where there's a will, there's a way." },
          { "ja": "遅くなっても、やらないよりはまし。", "meaning": "スペインのことわざ", "target": "Más vale tarde que nunca.", "kana": "マス バレ タルデ ケ ヌンカ", "enText": "Better late than never." },
          { "ja": "言葉より行動が大切。", "meaning": "スペイン語圏のことわざ", "target": "Obras son amores y no buenas razones.", "kana": "オブラス ソン アモレス", "enText": "Actions speak louder than words." },
          { "ja": "どんな困難にも、希望の光はある。", "meaning": "スペインのことわざ", "target": "No hay mal que por bien no venga.", "kana": "ノ ハイ マル ケ ポル ビエン ノ ベンガ", "enText": "Every cloud has a silver lining." },
          { "ja": "人は見かけによらない。", "meaning": "スペインのことわざ", "target": "El hábito no hace al monje.", "kana": "エル アビト ノ アセ アル モンヘ", "enText": "Don't judge a book by its cover." },
          { "ja": "早起きは三文の徳。", "meaning": "スペインのことわざ", "target": "A quien madruga, Dios le ayuda.", "kana": "ア キエン マドルガ ディオス レ アジュダ", "enText": "The early bird catches the worm." },
          { "ja": "継続は力なり。", "meaning": "スペイン語圏のことわざ", "target": "La práctica hace al maestro.", "kana": "ラ プラティカ アセ アル マエストロ", "enText": "Practice makes perfect." },
          { "ja": "最後まで勝負はわからない。", "meaning": "スペインのことわざ", "target": "Hasta el rabo todo es toro.", "kana": "アスタ エル ラボ トド エス トロ", "enText": "It's not over until it's over." },
          { "ja": "無限の彼方へ、さあ行くぞ！", "meaning": "映画『トイ・ストーリー』(アメリカ)", "source": "バズ・ライトイヤー", "target": "¡Hasta el infinito y más allá!", "kana": "アスタ エル インフィニティ イ マス アジャ", "enText": "To infinity and beyond!" },
          { "ja": "フォースとともにあらんことを。", "meaning": "映画『スター・ウォーズ』(アメリカ)", "source": "名台詞", "target": "Que la Fuerza te acompañe.", "kana": "ケ ラ フエルサ テ アコンパニェ", "enText": "May the Force be with you." }
        ]
      },
      "cafe_service": {
        "name": "カフェの接客",
        "icon": "fa-coffee",
        "phrases": [
          { "ja": "いらっしゃいませ！", "target": "¡Hola! ¡Bienvenido!", "kana": "オラ ビエンベニド", "enText": "Hi! Welcome in!" },
          { "ja": "ご注文はお決まりですか？", "target": "¿Qué le pongo?", "kana": "ケ レ ポンゴ", "enText": "What can I get for you?" },
          { "ja": "店内でお召し上がりですか？お持ち帰りですか？", "target": "¿Para tomar aquí o para llevar?", "kana": "パラ トマール アキ オ パラ ジェバル", "enText": "For here or to go?" },
          { "ja": "サイズはいかがなさいますか？", "target": "¿Qué tamaño desea?", "kana": "ケ タマニョ デセア", "enText": "What size would you like?" },
          { "ja": "ミルクの種類はどうされますか？", "target": "¿Qué tipo de leche prefiere?", "kana": "ケ ティポ デ レチェ プレフィエレ", "enText": "What kind of milk would you like?" },
          { "ja": "ホットとアイス、どちらになさいますか？", "target": "¿Lo quiere caliente o con hielo?", "kana": "ロ キエレ カリエンテ", "enText": "Would you like that hot or iced?" },
          { "ja": "お名前をお伺いしてもよろしいですか？", "target": "¿Me dice su nombre, por favor?", "kana": "メ デセ ス ノンブレ", "enText": "Can I get your name?" },
          { "ja": "ご注文を繰り返します。", "target": "Le repito el pedido.", "kana": "レ レピト エル ペディド", "enText": "Let me repeat your order." },
          { "ja": "お待たせいたしました！", "target": "¡Gracias por esperar!", "kana": "グラシアス ポル エスペラル", "enText": "Thanks for waiting!" },
          { "ja": "ごゆっくりお過ごしください。", "target": "¡Que disfrute de su bebida!", "kana": "ケ ディスフルテ デ ス ベビダ", "enText": "Enjoy your drink!" }
        ]
      },
      "general_store_service": {
        "name": "雑貨屋さんの接客",
        "icon": "fa-store",
        "phrases": [
          { "ja": "何かお探しですか？", "target": "¿Busca algo en particular?", "kana": "ブスカ アルゴ エン パティキュラール", "enText": "Are you looking for anything in particular?" },
          { "ja": "どうぞご自由にご覧ください。", "target": "Puede mirar lo que quiera.", "kana": "プエデ ミラル ロ ケ キエラ", "enText": "Feel free to look around." },
          { "ja": "こちらが新商品です。", "target": "Estos son nuestros nuevos productos.", "kana": "エストス ソノ ヌエストロス ヌエボス", "enText": "These are our new arrivals." },
          { "ja": "こちらが一番人気です。", "target": "Este es nuestro artículo más vendido.", "kana": "エステ エス ヌエストロ アルティクル", "enText": "This is our most popular item." },
          { "ja": "色違いもございます。", "target": "También lo tenemos en otros colores.", "kana": "タンビエン ロ テネモス", "enText": "It comes in other colors, too." },
          { "ja": "お手に取ってご覧ください。", "target": "Puede cogerlo y verlo de cerca.", "kana": "プエデ コヘルロ イ ベルロ", "enText": "Feel free to pick it up." },
          { "ja": "プレゼント用ですか？", "target": "¿Es para regalo?", "kana": "エス パラ レガロ", "enText": "Is it a gift?" },
          { "ja": "ラッピングいたしましょうか？", "target": "¿Quiere que se lo envolvamos?", "kana": "キエレ ケ セ ロ エンボルバモス", "enText": "Would you like it gift-wrapped?" },
          { "ja": "お会計はこちらです。", "target": "Puede pagar aquí.", "kana": "プエデ パガール アキ", "enText": "You can pay right here." },
          { "ja": "またお越しくださいませ。", "target": "¡Esperamos volver a verle!", "kana": "エスペラモス ボルベル ア ベールレ", "enText": "We hope to see you again!" }
        ]
      },
      "math_dialogue": {
        "name": "数学のセリフ",
        "icon": "fa-calculator",
        "phrases": [
          { "ja": "まず問題をよく読んでみよう。", "target": "Primero, vamos a leer bien el problema.", "kana": "プリメロ バモス ア レール ビエン", "enText": "Let's read the problem carefully first." },
          { "ja": "答えはいくつになりますか？", "target": "¿Qué resultado te da?", "kana": "ケ レスルタド テ ダ", "enText": "What do you get for your answer?" },
          { "ja": "ここに数字を書いてください。", "target": "Escribe el número aquí.", "kana": "エスクリベ エル ヌメロ アキ", "enText": "Write the number here." },
          { "ja": "これらの数字を足してください。", "target": "Suma estos números.", "kana": "スマ エストス ヌメロス", "enText": "Add these numbers." },
          { "ja": "大きい数から小さい数を引きます。", "target": "Resta el número más pequeño del más grande.", "kana": "レスタ エル ヌメロ マス ペケニョ", "enText": "Subtract the smaller number from the larger one." },
          { "ja": "何倍になりますか？", "target": "¿Cuántas veces mayor es?", "kana": "クアンタス ベセス マヨール エス", "enText": "How many times greater is it?" },
          { "ja": "これを半分に分けましょう。", "target": "Vamos a dividir esto por la mitad.", "kana": "バモス ア ディビディル エスト", "enText": "Let's divide this in half." },
          { "ja": "分数で表してみよう。", "target": "Vamos a expresarlo como una fracción.", "kana": "バモス ア エクスプレサルロ", "enText": "Let's write it as a fraction." },
          { "ja": "答えを確かめてみよう。", "target": "Vamos a comprobar la respuesta.", "kana": "バモス ア コンプロバール", "enText": "Let's check the answer." },
          { "ja": "どうしてそうなるのか説明できる？", "target": "¿Puedes explicar por qué?", "kana": "プエデス エクスプリカール ポル ケ", "enText": "Can you explain why?" }
        ]
      },
      "cooking_dialogue": {
        "name": "料理のセリフ",
        "icon": "fa-utensils",
        "phrases": [
          { "ja": "まず野菜を洗ってね。", "target": "Primero, lava las verduras.", "kana": "プリメロ ラバ ラス ベルドゥラス", "enText": "Wash the vegetables first." },
          { "ja": "玉ねぎを薄く切って。", "target": "Corta la cebolla en rodajas finas.", "kana": "コルタ ラ セボジャ エン ロダハス", "enText": "Slice the onion thinly." },
          { "ja": "お鍋に油を入れて。", "target": "Echa un poco de aceite en la olla.", "kana": "エチャ ウン ポコ デ アセイレ", "enText": "Pour some oil into the pot." },
          { "ja": "中火で炒めてね。", "target": "Cocínalo a fuego medio.", "kana": "コシナルロ ア フエゴ メディオ", "enText": "Cook it over medium heat." },
          { "ja": "よく混ぜてね。", "target": "Mézclalo bien.", "kana": "メズクラロ ビエン", "enText": "Mix it well." },
          { "ja": "塩を少し加えて。", "target": "Añade un poco de sal.", "kana": "アニャデ ウン ポコ デ サル", "enText": "Add a little salt." },
          { "ja": "ふたをして煮込んでね。", "target": "Pon la tapa y déjalo cocer a fuego lento.", "kana": "ポン ラ タパ イ デハロ コセル", "enText": "Put the lid on and let it simmer." },
          { "ja": "焦げないように気をつけて！", "target": "¡Ten cuidado de que no se queme!", "kana": "テン クイドーダ デ ケ ノ セ ケメ", "enText": "Be careful not to burn it!" },
          { "ja": "味見してみて。", "target": "Pruébalo.", "kana": "プルエバロ", "enText": "Give it a taste." },
          { "ja": "さあ、できあがり！", "target": "¡Y ya está listo!", "kana": "イ ヤ エスタ リスト", "enText": "And it's ready!" }
        ]
      }
    }
  },
  "it": {
    "name": "Italiano",
    "langCode": "it-IT",
    "categories": {
      "greetings": {
        "name": "挨拶・基本",
        "icon": "fa-hand-wave",
        "phrases": [
          { "ja": "はい", "target": "Sì", "kana": "シ", "enText": "Yes" },
          { "ja": "いいえ", "target": "No", "kana": "ノ", "enText": "No" },
          { "ja": "こんにちは / やあ", "target": "Ciao", "kana": "チャオ", "enText": "Hello" },
          { "ja": "こんにちは（丁寧）", "target": "Buongiorno", "kana": "ボンジョルノ", "enText": "Good morning" },
          { "ja": "こんばんは", "target": "Buonasera", "kana": "ボナセーラ", "enText": "Good evening" },
          { "ja": "ありがとう", "target": "Grazie mille", "kana": "グラツィエ ミッレ", "enText": "Thank you very much" },
          { "ja": "お元気ですか？", "target": "Come stai?", "kana": "コメ スタイ", "enText": "How are you?" },
          { "ja": "さようなら", "target": "Arrivederci", "kana": "アッリヴェデルチ", "enText": "Goodbye" }
        ]
      },
      "hospitality": {
        "name": "おもてなし",
        "icon": "fa-mug-hot",
        "phrases": [
          { "ja": "何か飲む？", "target": "Vuoi qualcosa da bere?", "kana": "ヴォイ クアルコサ ダ ベレ", "enText": "Would you like something to drink?" },
          { "ja": "コーヒーと紅茶、どっちがいい？", "target": "Preferisci il caffè o il tè?", "kana": "プレフェリシ イル カッフェ オ イル テ", "enText": "Would you like coffee or tea?" },
          { "ja": "お茶を入れるね。", "target": "Preparo un tè.", "kana": "プレパロ ウン テ", "enText": "I'll make some tea." },
          { "ja": "お菓子もどうぞ。", "target": "Prendi pure qualche dolcetto.", "kana": "プレンディ ピュレ クアルケ ドルチェット", "enText": "Help yourself to some snacks." },
          { "ja": "遠慮しないでね。", "target": "Fai come se fossi a casa tua.", "kana": "ファイ コメ セ フォッシ ア カサ トゥア", "enText": "Make yourself at home." },
          { "ja": "もっと食べてね！", "target": "Mangiane ancora un po'!", "kana": "マンジアーネ アンコーラ ウン ポ", "enText": "Have some more!" },
          { "ja": "お口に合うといいんだけど。", "target": "Spero che ti piaccia.", "kana": "スペロ ケ ティ ピアチャ", "enText": "I hope you like it." },
          { "ja": "これ、私が作ったんだよ。", "target": "L'ho fatto io.", "kana": "ロ ファット イオ", "enText": "I made this myself." },
          { "ja": "ゆっくりしていってね。", "target": "Resta tutto il tempo che vuoi.", "kana": "レスタ トット イル テンポ ケ ヴォイ", "enText": "Stay as long as you like." },
          { "ja": "何か必要なものはある？", "target": "Hai bisogno di qualcosa?", "kana": "ハイ ビソニョ ディ クアルコサ", "enText": "Do you need anything?" }
        ]
      },
      "welcoming": {
        "name": "お出迎え",
        "icon": "fa-house-chimney",
        "phrases": [
          { "ja": "いらっしゃい！", "target": "Benvenuto!", "kana": "ベンヴェヌト", "enText": "Welcome!" },
          { "ja": "来てくれてありがとう！", "target": "Grazie per essere venuto!", "kana": "グラツィエ ペル エッセレ ヴェヌト", "enText": "Thanks for coming!" },
          { "ja": "どうぞ、入って！", "target": "Entra, entra!", "kana": "エントラ エントラ", "enText": "Come on in!" },
          { "ja": "靴を脱いでね。", "target": "Puoi toglierti le scarpe.", "kana": "プオイ トリエルティ レ スカルペ", "enText": "You can take your shoes off." },
          { "ja": "久しぶり！元気だった？", "target": "Da quanto tempo! Come stai?", "kana": "ダ クアント テンポ コメ スタイ", "enText": "Long time no see! How have you been?" },
          { "ja": "会えてうれしいよ！", "target": "Che bello vederti!", "kana": "ケ ベッロ ヴェデルティ", "enText": "It's so good to see you!" },
          { "ja": "道に迷わなかった？", "target": "Hai avuto difficoltà a trovare casa?", "kana": "ハイ アヴト ディッフィコルタ", "enText": "Did you have any trouble finding the place?" },
          { "ja": "遠かったでしょう？お疲れさま。", "target": "Sarà stato un viaggio lungo.", "kana": "サラ スタート ウン ビアッジオ", "enText": "It must have been a long trip." },
          { "ja": "荷物を預かるよ。", "target": "Lascia che ti prenda la borsa.", "kana": "ラッシャ ケ ティ プレンダ ラ ボルサ", "enText": "Let me take your bag." },
          { "ja": "こっちに来て、座ってね。", "target": "Vieni qui e siediti.", "kana": "ヴィエニ クイ エ シエディティ", "enText": "Come over here and have a seat." },
          { "ja": "最近どう？何か変わったことあった？", "target": "Che mi racconti? Ci sono novità?", "kana": "ケ ミ ラッコンティ チ ソノ ノヴィタ", "enText": "What's new?" },
          { "ja": "今度一緒にご飯でも行こうよ。", "target": "Dai, andiamo a mangiare qualcosa insieme.", "kana": "ダイ アンディアモ ア マンジャレ", "enText": "Let's grab a bite sometime." },
          { "ja": "それは大変だったね。", "target": "Dev'essere stato davvero difficile.", "kana": "デッセッレ スタート ダッヴェロ", "enText": "That must have been tough." },
          { "ja": "また連絡するね！", "target": "Ci sentiamo!", "kana": "チ センティアモ", "enText": "I'll talk to you later!" },
          { "ja": "今日は本当に楽しかった！", "target": "Oggi mi sono divertito tantissimo!", "kana": "オッジ ミ ソノ ディヴェルティト", "enText": "I had a really great time today!" }
        ]
      },
      "outing": {
        "name": "お出かけ",
        "icon": "fa-person-walking-luggage",
        "phrases": [
          { "ja": "着いた！", "target": "Siamo arrivati!", "kana": "シアモ アッリーヴァティ", "enText": "We're here!" },
          { "ja": "さあ、着いたよ！", "target": "Eccoci qua!", "kana": "エッコチ クワ", "enText": "We made it!" },
          { "ja": "出発しよう！", "target": "Andiamo!", "kana": "アンディアモ", "enText": "Let's get going!" },
          { "ja": "気をつけてね。", "target": "Fai attenzione.", "kana": "ファイ アテンツィオーネ", "enText": "Watch your step." },
          { "ja": "もうすぐ着くよ。", "target": "Siamo quasi arrivati.", "kana": "シアモ クツイ アッリーヴァティ", "enText": "We'll be there soon." }
        ]
      },
      "mom": {
        "name": "お母さん",
        "icon": "fa-child-reaching",
        "phrases": [
          { "ja": "おかえり！", "target": "Bentornato a casa!", "kana": "ベントルナト ア カサ", "enText": "Welcome home!" },
          { "ja": "手を洗ってね。", "target": "Lavati le mani.", "kana": "ラヴァティ レ マニ", "enText": "Wash your hands." },
          { "ja": "学校はどうだった？", "target": "Com'è andata a scuola?", "kana": "コメ アンダータ ア スクーラ", "enText": "How was school?" },
          { "ja": "宿題は終わった？", "target": "Hai finito i compiti?", "kana": "ハイ フィニート イ コンピティ", "enText": "Did you finish your homework?" },
          { "ja": "先に宿題を済ませちゃおう。", "target": "Facciamo prima i compiti.", "kana": "ファッチャモ プリマ イ コンピティ", "enText": "Let's get your homework done first." },
          { "ja": "もうゲームはおしまい！", "target": "Basta videogiochi per oggi!", "kana": "バスタ ビデオジョキ ペル オッジ", "enText": "That's enough video games for now!" },
          { "ja": "そろそろ片付けて。", "target": "È ora di mettere in ordine.", "kana": "エ オラ ディ メッテレ イン オルディネ", "enText": "It's time to clean up." },
          { "ja": "ごはんの時間だよ！", "target": "È ora di cena!", "kana": "エ オラ ディ チェナ", "enText": "It's time for dinner!" },
          { "ja": "好き嫌いしないで食べてね。", "target": "Cerca di mangiare un po' di tutto.", "kana": "チェルカ ディ マンジャレ ウン ポ ディ トット", "enText": "Try to eat a little of everything." },
          { "ja": "おかわりいる？", "target": "Ne vuoi ancora?", "kana": "ネ ヴォイ アンコーラ", "enText": "Would you like some more?" },
          { "ja": "起きて！朝だよ！", "target": "Svegliati! È mattina!", "kana": "スヴェリアティ エ マッティナ", "enText": "Wake up! It's morning!" },
          { "ja": "顔を洗っておいで。", "target": "Vai a lavarti la faccia.", "kana": "バイ ア ラヴァルティ ラ ファッチャ", "enText": "Go wash your face." },
          { "ja": "歯を磨いてね。", "target": "Lavati i denti.", "kana": "ラヴァティ イ デンティ", "enText": "Brush your teeth." },
          { "ja": "着替えてきて。", "target": "Vai a vestirti.", "kana": "バイ ア ヴェスティルティ", "enText": "Go get dressed." },
          { "ja": "パジャマを片付けてね。", "target": "Metti via il pigiama.", "kana": "メッティ ヴィア イル ピジャマ", "enText": "Put your pajamas away." },
          { "ja": "朝ごはんできたよ！", "target": "La colazione è pronta!", "kana": "ラ コラツィオーネ エ プロンタ", "enText": "Breakfast is ready!" },
          { "ja": "早く食べないと遅刻するよ。", "target": "Sbrigati a mangiare, altrimenti farai tardi.", "kana": "スブリガティ ア マンジャレ", "enText": "Hurry up and eat, or you'll be late." },
          { "ja": "忘れ物はない？", "target": "Hai preso tutto?", "kana": "ハイ プレゾ トット", "enText": "Do you have everything?" },
          { "ja": "準備できた？", "target": "Sei pronto?", "kana": "セイ プロント", "enText": "Are you ready?" },
          { "ja": "さあ、行くよ！", "target": "Dai, andiamo!", "kana": "ダイ アンディアモ", "enText": "Come on, let's go!" }
        ]
      },
      "discovery": {
        "name": "発見・気づき",
        "icon": "fa-lightbulb",
        "phrases": [
          { "ja": "見つけた！", "target": "L'ho trovato!", "kana": "ロ トロヴァート", "enText": "Found it!" },
          { "ja": "あった！", "target": "Eccolo!", "kana": "エッコロ", "enText": "There it is!" },
          { "ja": "ここにあったんだ！", "target": "Era proprio qui!", "kana": "エラ プロプロ クイ", "enText": "Here it is!" },
          { "ja": "わかった！", "target": "Ho capito!", "kana": "ホ カピト", "enText": "I got it!" },
          { "ja": "あっ、そういうことか！", "target": "Ah, adesso ho capito!", "kana": "ア アデッソ ホ カピト", "enText": "Oh, I get it now!" },
          { "ja": "もしかして、これ？", "target": "Forse è questo?", "kana": "フォルセ エ クエスト", "enText": "Could it be this?" },
          { "ja": "あれ、なんだろう？", "target": "Eh? Che cos'è quello?", "kana": "エ ケ コセ クエッロ", "enText": "Huh, what's that?" },
          { "ja": "あっちに何かあるよ！", "target": "C'è qualcosa laggiù!", "kana": "チェ クアルコサ ラッジュー", "enText": "There's something over there!" },
          { "ja": "やっと見つけた！", "target": "Finalmente l'ho trovato!", "kana": "フィナルメンテ ロ トロヴァート", "enText": "I finally found it!" },
          { "ja": "こんなところにあったなんて！", "target": "Non ci posso credere, era qui!", "kana": "ノン チ ポッソ クレデレ", "enText": "I can't believe it was here!" }
        ]
      },
      "reactions": {
        "name": "短いリアクション",
        "icon": "fa-comment-dots",
        "phrases": [
          { "ja": "えっ、本当？", "target": "Davvero?", "kana": "ダッヴェロ", "enText": "Really?" },
          { "ja": "そっか！", "target": "Ho capito!", "kana": "ホ カピト", "enText": "I see!" },
          { "ja": "もちろん！", "target": "Certo!", "kana": "チェルト", "enText": "Of course!" },
          { "ja": "それ、めっちゃ面白いね！", "target": "Che divertente!", "kana": "ケ ディヴェルテンテ", "enText": "That's so funny!" },
          { "ja": "本当にそう思う！", "target": "Sono completamente d'accordo!", "kana": "ソノ コンプレタメンテ ダッコルド", "enText": "I totally agree!" },
          { "ja": "それで、どうなったの？", "target": "E poi, cos'è successo?", "kana": "エ ポイ コゼ スチェッソ", "enText": "So, what happened?" },
          { "ja": "ちょっとだけね。", "target": "Solo un pochino.", "kana": "ソロ ウン ポキーノ", "enText": "Just a little." },
          { "ja": "いいよ！", "target": "Va bene!", "kana": "ヴァ ベネ", "enText": "Sure!" },
          { "ja": "こっちこっち！", "target": "Di qua!", "kana": "ディ クワ", "enText": "Over here!" },
          { "ja": "あぶない！", "target": "Attento!", "kana": "アッテント", "enText": "Watch out!" },
          { "ja": "ありがとう、助かったよ。", "target": "Grazie, mi sei stato di grande aiuto.", "kana": "グラツィエ ミ セイ スタート", "enText": "Thanks, that really helped." },
          { "ja": "どういたしまして。", "target": "Prego.", "kana": "プレゴ", "enText": "You're welcome." },
          { "ja": "なんでもないよ。", "target": "Non è niente.", "kana": "ノン エ ニエンテ", "enText": "It's nothing." }
        ]
      },
      "daily": {
        "name": "優しい日常会話",
        "icon": "fa-heart",
        "phrases": [
          { "ja": "すみません、通してください。", "target": "Scusa, permesso.", "kana": "スクーザ ペルメッソ", "enText": "Excuse me, coming through." },
          { "ja": "ちょっと待って！", "target": "Aspetta un attimo!", "kana": "アスペッタ ウン アッティモ", "enText": "Wait a second!" },
          { "ja": "大丈夫だよ。", "target": "Va tutto bene.", "kana": "ヴァ トット ベネ", "enText": "It's okay." },
          { "ja": "気にしないで！", "target": "Non ti preoccupare!", "kana": "ノン ティ プレオックパレ", "enText": "Don't worry about it!" },
          { "ja": "こっちにおいで。", "target": "Vieni qui.", "kana": "ヴィエニ クイ", "enText": "Come over here." },
          { "ja": "手をつないでね。", "target": "Dammi la mano.", "kana": "ダムミ ラ マノ", "enText": "Hold my hand." },
          { "ja": "ゆっくり歩こうね。", "target": "Camminiamo piano piano.", "kana": "カムミニャモ ピャノ ピャノ", "enText": "Let's walk slowly." },
          { "ja": "転ばないように気をつけてね。", "target": "Attento a non cadere!", "kana": "アッテント ア ノン カデレ", "enText": "Be careful not to fall." },
          { "ja": "もうすぐ着くよ。", "target": "Siamo quasi arrivati.", "kana": "シアモ クツイ アッリーヴァティ", "enText": "We'll be there soon." },
          { "ja": "見て見て！", "target": "Guarda, guarda!", "kana": "グアルダ グアルダ", "enText": "Look, look!" },
          { "ja": "本当だ！", "target": "È vero!", "kana": "エ ヴェロ", "enText": "You're right!" },
          { "ja": "やったね！", "target": "Ce l'hai fatta!", "kana": "チェ ライ ファッタ", "enText": "You did it!" },
          { "ja": "もう一回やってみよう！", "target": "Proviamo ancora!", "kana": "プロヴィアモ アンコーラ", "enText": "Let's try again!" },
          { "ja": "こわくないよ。", "target": "Non aver paura.", "kana": "ノン アヴェル パウラ", "enText": "There's nothing to be afraid of." },
          { "ja": "泣かないで。そばにいるよ。", "target": "Non piangere. Sono qui con te.", "kana": "ノン ピアンジェレ ソノ クイ", "enText": "Don't cry. I'm right here." },
          { "ja": "お腹すいた？", "target": "Hai fame?", "kana": "ハイ ファメ", "enText": "Are you hungry?" },
          { "ja": "お水を飲もうか。", "target": "Beviamo un po' d'acqua.", "kana": "ベヴィアモ ウン ポ ダックワ", "enText": "Let's have some water." },
          { "ja": "もう大丈夫？", "target": "Adesso stai bene?", "kana": "アデッソ スタイ ベネ", "enText": "Are you okay now?" },
          { "ja": "一緒にやろう！", "target": "Facciamolo insieme!", "kana": "ファッチャモロ インシエメ", "enText": "Let's do it together!" },
          { "ja": "またあとでね！", "target": "A dopo!", "kana": "ア ドポ", "enText": "See you later!" }
        ]
      },
      "hospital": {
        "name": "病院を受診",
        "icon": "fa-hospital",
        "phrases": [
          { "ja": "今日はどうされましたか？", "target": "Cosa la porta qui oggi?", "kana": "コサ ラ ポルタ クイ オッジ", "enText": "What brings you in today?" },
          { "ja": "頭が痛いんです。", "target": "Ho mal di testa.", "kana": "ホ マル ディ テスタ", "enText": "I have a headache." },
          { "ja": "昨日から熱があります。", "target": "Ho la febbre da ieri.", "kana": "ホ ラ フェッブレ ダ イエリ", "enText": "I've had a fever since yesterday." },
          { "ja": "ここが痛みます。", "target": "Mi fa male qui.", "kana": "ミ ファ マレ クイ", "enText": "It hurts right here." },
          { "ja": "いつから症状がありますか？", "target": "Da quanto ha questi sintomi?", "kana": "ダ クアント ハ クエスティ シントミ", "enText": "When did your symptoms start?" },
          { "ja": "薬のアレルギーはありますか？", "target": "Ha qualche allergia ai farmaci?", "kana": "ハ クアルケ アッレルジア", "enText": "Do you have any medication allergies?" },
          { "ja": "息苦しさはありますか？", "target": "Ha difficoltà a respirare?", "kana": "ハ ディッフィコルタ ア レスピラーレ", "enText": "Are you having trouble breathing?" },
          { "ja": "薬を飲んで、しばらく様子を見てください。", "target": "Prenda questo medicinale e vediamo come si sente.", "kana": "プレンダ クエスト メディシナレ", "enText": "Take this medicine and see how you feel." },
          { "ja": "検査を受ける必要があります。", "target": "Dovrà fare alcuni esami.", "kana": "ドヴラ ファレ アルクーニ エザミ", "enText": "You'll need to have some tests done." },
          { "ja": "何か質問はありますか？", "target": "Ha qualche domanda?", "kana": "ハ クアルケ ドマンダ", "enText": "Do you have any questions?" }
        ]
      },
      "directions": {
        "name": "道案内",
        "icon": "fa-map-location-dot",
        "phrases": [
          { "ja": "何かお困りですか？", "target": "Ha bisogno di aiuto?", "kana": "ハイ ビソニョ ディ アユート", "enText": "Can I help you with something?" },
          { "ja": "どこに行きたいですか？", "target": "Dove vuole andare?", "kana": "ドヴェ ヴォレ アンダレ", "enText": "Where are you trying to go?" },
          { "ja": "この道をまっすぐ進んでください。", "target": "Vada sempre dritto per questa strada.", "kana": "ヴァダ センプレ ドリット", "enText": "Go straight down this street." },
          { "ja": "次の角を右に曲がってください。", "target": "Giri a destra al prossimo angolo.", "kana": "ジリ ア デストラ アル プロッシモ", "enText": "Turn right at the next corner." },
          { "ja": "駅は近くにありますよ。", "target": "La stazione è qui vicino.", "kana": "ラ スタツィオーネ エ クイ ヴィチーノ", "enText": "The station is nearby." },
          { "ja": "歩いて10分くらいです。", "target": "Sono circa dieci minuti a piedi.", "kana": "ソノ チルカ ディエチ ミヌティ", "enText": "It's about a ten-minute walk." },
          { "ja": "信号を渡ったところにあります。", "target": "Si trova proprio dall'altra parte.", "kana": "シ トロヴァ プロプロ ダラトラ", "enText": "It's just across the street at the traffic light." },
          { "ja": "この地図を見てください。", "target": "Guardi questa mappa.", "kana": "グアルディ クエスタ マッパ", "enText": "Take a look at this map." },
          { "ja": "すみません、私も詳しくはわからないんです。", "target": "Mi dispiace, non lo so bene nemmeno io.", "kana": "ミ ディスピアチェ ノン ロ ソ", "enText": "Sorry, I'm not really sure either." },
          { "ja": "気をつけて行ってくださいね！", "target": "Buon viaggio! Faccia attenzione!", "kana": "ブオン ビアッジオ ファッチャ", "enText": "Have a safe trip!" }
        ]
      },
      "kids": {
        "name": "子供と話す",
        "icon": "fa-children",
        "phrases": [
          { "ja": "今日は学校どうだった？", "target": "Com'è andata a scuola oggi?", "kana": "コメ アンダータ ア スクーラ オッジ", "enText": "How was school today?" },
          { "ja": "宿題はもう終わった？", "target": "Hai già finito i compiti?", "kana": "ハイ ジャ フィニート イ コンピティ", "enText": "Are you done with your homework?" },
          { "ja": "ゆっくりでいいよ。焦らなくていいからね。", "target": "Fai con calma. Non c'è fretta.", "kana": "ファイ コン カルマ ノン チェ フレッタ", "enText": "Take your time. There's no rush." },
          { "ja": "すごいね！よく頑張ったね。", "target": "Fantastico! Hai fatto un ottimo lavoro!", "kana": "ファンタスティコ ハイ ファット", "enText": "That's amazing! You did a great job!" },
          { "ja": "何か困っていることある？", "target": "C'è qualcosa che non va?", "kana": "チェ クアルコサ ケ ノン ヴァ", "enText": "Is something bothering you?" },
          { "ja": "忘れ物はない？", "target": "Hai dimenticato qualcosa?", "kana": "ハイ ディメンティカト クアルコサ", "enText": "Did you forget anything?" },
          { "ja": "気をつけて行ってきてね。", "target": "Buona giornata! Fai attenzione!", "kana": "ブオナ ジョルナータ ファイ アテンツィオーネ", "enText": "Have a good day. Be careful!" },
          { "ja": "もう少しだけ頑張ってみようか。", "target": "Proviamoci ancora un pochino.", "kana": "プロヴィアモチ アンコーラ", "enText": "Let's try just a little harder." },
          { "ja": "失敗しても大丈夫だよ。", "target": "Non importa se sbagli.", "kana": "ノン インポルタ セ スバグリ", "enText": "It's okay to make mistakes." },
          { "ja": "今日は一緒に遊ぼうか。", "target": "Giochiamo insieme oggi?", "kana": "ジョキアモ インシエメ オッジ", "enText": "Let's play together today." }
        ]
      },
      "proverbs": {
        "name": "ことわざ・名台詞",
        "icon": "fa-quote-left",
        "phrases": [
          { "ja": "意志あるところに道は開ける。", "meaning": "イタリアのことわざ", "target": "Volere è potere.", "kana": "ヴォレレ エ ポテレ", "enText": "Where there's a will, there's a way." },
          { "ja": "遅くなっても、やらないよりはまし。", "meaning": "イタリアのことわざ", "target": "Meglio tardi che mai.", "kana": "メリオ タルディ ケ マイ", "enText": "Better late than never." },
          { "ja": "言葉より行動が大切。", "meaning": "イタリアのことわざ", "target": "I fatti contano più delle parole.", "kana": "イ ファッティ コンタノ ピュ", "enText": "Actions speak louder than words." },
          { "ja": "どんな困難にも、希望の光はある。", "meaning": "イタリアのことわざ", "target": "Non tutto il male viene per nuocere.", "kana": "ノン トット イル マレ ヴィエネ", "enText": "Every cloud has a silver lining." },
          { "ja": "人は見かけによらない。", "meaning": "イタリアのことわざ", "target": "L'abito non fa il monaco.", "kana": "ラブト ノン ファ イル モナコ", "enText": "Don't judge a book by its cover." },
          { "ja": "早起きは三文の徳。", "meaning": "イタリアのことわざ", "target": "Il mattino ha l'oro in bocca.", "kana": "イル マッティーノ ア ロロ イン ボッカ", "enText": "The early bird catches the worm." },
          { "ja": "継続は力なり。", "meaning": "イタリアのことわざ", "target": "La pratica rende perfetti.", "kana": "ラ プラティカ レンデ ペルフェッティ", "enText": "Practice makes perfect." },
          { "ja": "最後まで勝負はわからない。", "meaning": "イタリアのことわざ", "target": "Non è finita finché non è finita.", "kana": "ノン エ フィニータ フィンケ", "enText": "It's not over until it's over." },
          { "ja": "無限の彼方へ、さあ行くぞ！", "meaning": "映画『トイ・ストーリー』(アメリカ)", "source": "バズ・ライトイヤー", "target": "Verso l'infinito e oltre!", "kana": "ヴェルソ リンフィニート エ オルトレ", "enText": "To infinity and beyond!" },
          { "ja": "フォースとともにあらんことを。", "meaning": "映画『スター・ウォーズ』(アメリカ)", "source": "名台詞", "target": "Que la Forza sia con te.", "kana": "ケ ラ フォーザ シア コン テ", "enText": "May the Force be with you." }
        ]
      },
      "cafe_service": {
        "name": "カフェの接客",
        "icon": "fa-coffee",
        "phrases": [
          { "ja": "いらっしゃいませ！", "target": "Buongiorno! Benvenuto!", "kana": "ボンジョルノ ベンヴェヌト", "enText": "Hi! Welcome in!" },
          { "ja": "ご注文はお決まりですか？", "target": "Cosa le preparo?", "kana": "コサ レ プレパロ", "enText": "What can I get for you?" },
          { "ja": "店内でお召し上がりですか？お持ち帰りですか？", "target": "Da consumare qui o da portare via?", "kana": "ダ コンスマレ クイ オ ダ ポルターレ", "enText": "For here or to go?" },
          { "ja": "サイズはいかがなさいますか？", "target": "Che misura desidera?", "kana": "ケ ミズラ デジデラ", "enText": "What size would you like?" },
          { "ja": "ミルクの種類はどうされますか？", "target": "Che tipo di latte preferisce?", "kana": "ケ ティポ ディ ラッテ プレフェリシェ", "enText": "What kind of milk would you like?" },
          { "ja": "ホットとアイス、どちらになさいますか？", "target": "Lo preferisce caldo o freddo?", "kana": "ロ プレフェリシェ カルド", "enText": "Would you like that hot or iced?" },
          { "ja": "お名前をお伺いしてもよろしいですか？", "target": "Mi dice il suo nome, per favore?", "kana": "ミ ディチェ イル スオ ノメ", "enText": "Can I get your name?" },
          { "ja": "ご注文を繰り返します。", "target": "Le ripeto l'ordine.", "kana": "レ リペト ロルディネ", "enText": "Let me repeat your order." },
          { "ja": "お待たせいたしました！", "target": "Grazie per l'attesa!", "kana": "グラツィエ ペル ラッテサ", "enText": "Thanks for waiting!" },
          { "ja": "ごゆっくりお過ごしください。", "target": "Si goda la sua bevanda!", "kana": "シ ゴダ ラ スア ベヴァンダ", "enText": "Enjoy your drink!" }
        ]
      },
      "general_store_service": {
        "name": "雑貨屋さんの接客",
        "icon": "fa-store",
        "phrases": [
          { "ja": "何かお探しですか？", "target": "Sta cercando qualcosa in particolare?", "kana": "スタ チェルカンド クアルコサ", "enText": "Are you looking for anything in particular?" },
          { "ja": "どうぞご自由にご覧ください。", "target": "Dia pure un'occhiata.", "kana": "ディア ピュレ ウノッキアータ", "enText": "Feel free to look around." },
          { "ja": "こちらが新商品です。", "target": "Questi sono i nostri nuovi arrivi.", "kana": "クエスティ ソノ イ ノストリ", "enText": "These are our new arrivals." },
          { "ja": "こちらが一番人気です。", "target": "Questo è il nostro articolo più venduto.", "kana": "クエスト エ イル ノストロ", "enText": "This is our most popular item." },
          { "ja": "色違いもございます。", "target": "È disponibile anche in altri colori.", "kana": "エ ディスポニビレ アンケ", "enText": "It comes in other colors, too." },
          { "ja": "お手に取ってご覧ください。", "target": "Può prenderlo in mano e guardarlo da vicino.", "kana": "プオイ プレンデルロ イン マノ", "enText": "Feel free to pick it up." },
          { "ja": "プレゼント用ですか？", "target": "È un regalo?", "kana": "エ ウン レガロ", "enText": "Is it a gift?" },
          { "ja": "ラッピングいたしましょうか？", "target": "Vuole che glielo confezioniamo?", "kana": "ヴォレ ケ グリエロ コンフェツィオニアモ", "enText": "Would you like it gift-wrapped?" },
          { "ja": "お会計はこちらです。", "target": "Può pagare qui.", "kana": "プオイ パガレ クイ", "enText": "You can pay right here." },
          { "ja": "またお越しくださいませ。", "target": "Speriamo di rivederla presto!", "kana": "スペリアモ ディ リヴェデルラ", "enText": "We hope to see you again!" }
        ]
      },
      "math_dialogue": {
        "name": "数学のセリフ",
        "icon": "fa-calculator",
        "phrases": [
          { "ja": "まず問題をよく読んでみよう。", "target": "Per prima cosa, leggiamo attentamente il problema.", "kana": "ペル プリマ コサ レッジアモ", "enText": "Let's read the problem carefully first." },
          { "ja": "答えはいくつになりますか？", "target": "Che risultato ottieni?", "kana": "ケ リスルタド オッティーニ", "enText": "What do you get for your answer?" },
          { "ja": "ここに数字を書いてください。", "target": "Scrivi il numero qui.", "kana": "スクリーヴィ イル ヌメロ クイ", "enText": "Write the number here." },
          { "ja": "これらの数字を足してください。", "target": "Somma questi numeri.", "kana": "ソンマ クエスティ ヌメリ", "enText": "Add these numbers." },
          { "ja": "大きい数から小さい数を引きます。", "target": "Sottrai il numero più piccolo da quello più grande.", "kana": "ソットライ イル ヌメロ ピュ", "enText": "Subtract the smaller number from the larger one." },
          { "ja": "何倍になりますか？", "target": "Quante volte è più grande?", "kana": "クアンテ ヴォルテ エ ピュ", "enText": "How many times greater is it?" },
          { "ja": "これを半分に分けましょう。", "target": "Dividiamo questo a metà.", "kana": "ディヴィディアモ クエスト ア メタ", "enText": "Let's divide this in half." },
          { "ja": "分数で表してみよう。", "target": "Esprimiamolo sotto forma di frazione.", "kana": "エスプリミャモロ ソット フォーマ", "enText": "Let's write it as a fraction." },
          { "ja": "答えを確かめてみよう。", "target": "Controlliamo la risposta.", "kana": "コントロッリアモ ラ リスポスタ", "enText": "Let's check the answer." },
          { "ja": "どうしてそうなるのか説明できる？", "target": "Sai spiegare perché?", "kana": "サイ スピエガル ペルケ", "enText": "Can you explain why?" }
        ]
      },
      "cooking_dialogue": {
        "name": "料理のセリフ",
        "icon": "fa-utensils",
        "phrases": [
          { "ja": "まず野菜を洗ってね。", "target": "Per prima cosa, lava le verdure.", "kana": "ペル プリマ コサ ラヴァ レ", "enText": "Wash the vegetables first." },
          { "ja": "玉ねぎを薄く切って。", "target": "Taglia la cipolla a fettine sottili.", "kana": "タリア ラ チポッラ ア フェッティーネ", "enText": "Slice the onion thinly." },
          { "ja": "お鍋に油を入れて。", "target": "Versa un po' d'olio nella pentola.", "kana": "ヴェルサ ウン ポ ドリオ ネッラ", "enText": "Pour some oil into the pot." },
          { "ja": "中火で炒めてね。", "target": "Cuocilo a fuoco medio.", "kana": "クオチロ ア フオコ メディオ", "enText": "Cook it over medium heat." },
          { "ja": "よく混ぜてね。", "target": "Mescola bene.", "kana": "メスコラ ベネ", "enText": "Mix it well." },
          { "ja": "塩を少し加えて。", "target": "Aggiungi un po' di sale.", "kana": "アッジウンギ ウン ポ ディ サレ", "enText": "Add a little salt." },
          { "ja": "ふたをして煮込んでね。", "target": "Metti il coperchio e lascia cuocere a fuoco lento.", "kana": "メッティ イル コペルキオ", "enText": "Put the lid on and let it simmer." },
          { "ja": "焦げないように気をつけて！", "target": "Attenzione a non bruciarlo!", "kana": "アテンツィオーネ ア ノン ブルチャルロ", "enText": "Be careful not to burn it!" },
          { "ja": "味見してみて。", "target": "Assaggialo.", "kana": "アッサッジャロ", "enText": "Give it a taste." },
          { "ja": "さあ、できあがり！", "target": "Ed è pronto!", "kana": "エド エ プロント", "enText": "And it's ready!" }
        ]
      }
    }
  }
};
