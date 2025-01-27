# ユーザーのサンプルデータ作成
user1 = User.create!(email: "user1@example.com", password: "password123", name: "ユーザー1")
user2 = User.create!(email: "user2@example.com", password: "password123", name: "ユーザー2")
admin = Admin.create!(email: "admin@example.com", password: "password123", name: "博士太郎")



# テストのサンプルデータ作成
test1 = Test.create!(
  title: "カリスマ性テスト",
  description: "このテストでは、あなたのカリスマ性を6つの質問に基づいて評価します。",
  site_url: "https://example.com",
  improvement_suggestion: "カリスマ性を高めるためには、他人とのコミュニケーションを積極的に取ることが大切です。",
  min_score: 1,
  max_score: 5,
  avg_score: 3.5,  # 仮の平均スコア
  created_at: Time.now,
  updated_at: Time.now,
  admin: admin,
  status: 30
)


# 質問のサンプルデータ作成 (反転する質問も含む)
question1 = Question.create!(question_text: "自分は、どこにいても存在感があると思う", test: test1, isReversedScore: false)
question2 = Question.create!(question_text: "私は他人に影響をおよぼす能力を持っている", test: test1, isReversedScore: false)
question3 = Question.create!(question_text: "私はグループの導き方をよくわかっている", test: test1, isReversedScore: false)
question4 = Question.create!(question_text: "私は他人を良い気分にさせるのが得意だ", test: test1, isReversedScore: true)  # 反転する質問
question5 = Question.create!(question_text: "私は他人によく笑いかける", test: test1, isReversedScore: false)
question6 = Question.create!(question_text: "私は誰とでもうまくやることができる", test: test1, isReversedScore: false)

# ユーザー1のテスト回答データ作成
test_answer1 = TestAnswer.create!(user: user1, test: test1, count: 1, timestamp: Time.now)

# TestAnswerDetail のサンプルデータ作成
TestAnswerDetail.create!(test_answer: test_answer1, question: question1, score: 4)
TestAnswerDetail.create!(test_answer: test_answer1, question: question2, score: 5)
TestAnswerDetail.create!(test_answer: test_answer1, question: question3, score: 3)
TestAnswerDetail.create!(test_answer: test_answer1, question: question4, score: 1)  # 反転する質問
TestAnswerDetail.create!(test_answer: test_answer1, question: question5, score: 4)
TestAnswerDetail.create!(test_answer: test_answer1, question: question6, score: 5)

# ユーザー2のテスト回答データ作成
test_answer2 = TestAnswer.create!(user: user2, test: test1, count: 1, timestamp: Time.now)

TestAnswerDetail.create!(test_answer: test_answer2, question: question1, score: 3)
TestAnswerDetail.create!(test_answer: test_answer2, question: question2, score: 2)
TestAnswerDetail.create!(test_answer: test_answer2, question: question3, score: 5)
TestAnswerDetail.create!(test_answer: test_answer2, question: question4, score: 4)  # 反転する質問
TestAnswerDetail.create!(test_answer: test_answer2, question: question5, score: 5)
TestAnswerDetail.create!(test_answer: test_answer2, question: question6, score: 3)

# ユーザー1の2回目のテスト回答データ作成
test_answer1_round2 = TestAnswer.create!(user: user1, test: test1, count: 2, timestamp: Time.now)

# ユーザー1の2回目の TestAnswerDetail データ作成
TestAnswerDetail.create!(test_answer: test_answer1_round2, question: question1, score: 5)
TestAnswerDetail.create!(test_answer: test_answer1_round2, question: question2, score: 4)
TestAnswerDetail.create!(test_answer: test_answer1_round2, question: question3, score: 4)
TestAnswerDetail.create!(test_answer: test_answer1_round2, question: question4, score: 2)  # 反転する質問
TestAnswerDetail.create!(test_answer: test_answer1_round2, question: question5, score: 5)
TestAnswerDetail.create!(test_answer: test_answer1_round2, question: question6, score: 4)

# ユーザー2の2回目のテスト回答データ作成
test_answer2_round2 = TestAnswer.create!(user: user2, test: test1, count: 2, timestamp: Time.now)

# ユーザー2の2回目の TestAnswerDetail データ作成
TestAnswerDetail.create!(test_answer: test_answer2_round2, question: question1, score: 2)
TestAnswerDetail.create!(test_answer: test_answer2_round2, question: question2, score: 3)
TestAnswerDetail.create!(test_answer: test_answer2_round2, question: question3, score: 5)
TestAnswerDetail.create!(test_answer: test_answer2_round2, question: question4, score: 3)  # 反転する質問
TestAnswerDetail.create!(test_answer: test_answer2_round2, question: question5, score: 4)
TestAnswerDetail.create!(test_answer: test_answer2_round2, question: question6, score: 5)

description_text = <<-MD

## エゴレジリエンスとは？

エゴレジリエンスとは「日常的に生じるストレスに対し，状況に合わ
せて自らの行動を調整する能力」のことで、[1950年に米国心理学者・ジャックブロック氏](https://kodomo-manabi-labo.net/ego-resilience#:~:text=%E5%8A%9B%E3%80%8D%E3%81%A7%E3%81%99%E3%80%82-,%E7%B1%B3%E5%9B%BD%E3%81%AE%E5%BF%83%E7%90%86%E5%AD%A6%E8%80%85%E3%82%B8%E3%83%A3%E3%83%83%E3%82%AF%E3%83%BB%E3%83%96%E3%83%AD%E3%83%83%E3%82%AF%E6%B0%8F,-%E3%81%8C1950%E5%B9%B4)によって提唱されました。

また、ブロック氏によると、エゴレジリエンスが高い人は、以下の２つの力を柔軟にコントロールすることができるとのことです。

- 一方的に衝動や感情を過剰に抑制する
- 他方に衝動や感情を容易に表出する


## エゴレジリエンスが高い人・低い人の特徴

そして、エゴレジリエンスが高い人の特徴としては、

- ストレスフルな状況下でも、柔軟な対応ができる。
- ストレスフルな経験をしても、精神的な立ち直りが早い
- [自信の成長するための経験をしていることが多い。](https://www.researchgate.net/publication/222530864_Ego-control_and_ego-resiliency_Generalization_of_self-report_scales_based_on_personality_descriptions_from_acquaintances_clinicians_and_the_self)


また、エゴレジリエンスが低い人の特徴としては、

- 状況によらず、衝動的な行動を取ることが多い。
- 薬物使用が多く、抑うつ症状になりやすい

となっています。つまり、**エゴレジリエンスの高い人とは、日常では自分の感情をコントロールしてコツコツと物事を進められるうえに、疲れている時にストレスをうまく発散できる人**がエゴレジリエンスが高いと言えるかなと思います。

### 日本の高齢者を対象にしたエゴレジリエンスの研究

[2018年に日本で行われた平均77歳の高齢者を対象にした研究](https://www.jstage.jst.go.jp/article/rika/35/4/35_581/_pdf)では、エゴレジリエンスの高いグループと低いグループを分けて、日常生活（家事、趣味、友人・家族との交流）の活動を評価しました。その結果、以下のような結果がでました。

- **エゴレジリエンスが高いグループは、低いグループに加えて、外出、屋外歩行、趣味、読書、仕事の評価が高く、同居家族や友人からのサポートの得点が高かった。** つまり、エゴレジリエンスが高い人は、活動的で、より他人との交流をしていたとのこと。

-  **エゴレジリエンスが高いグループは、低いグループとの間に健康上の差ははないにもかかわらず、エゴレジリエンスが高い人は活動的だった。** このことから、研究者は、エゴレジリエンスが高い人は、心身のストレスを感じても、楽観的にとらえて、前向きに行動するといった対処方法が豊かであると述べています。

### 学生を対象にしたエゴレジリエンスの研究

2013年に学生を対象に行われた目白大学の研究では以下のことが分かりました。その結果以下のことが分かりました。

- エゴレジリエンスが高い学生は、[自己同一性(アイデンティティ)](https://psychoterm.jp/basic/personality/identity)の確立が早く、精神的健康度にプラスの影響を与えることが分かった。

MD


improvement_suggestion_text = <<-MD


[目白大学の先生である小野寺さん](https://next.rikunabi.com/journal/20170130_m1/)によると、
エゴレジリエンスを高めるには、以下のことが重要だそうです。

- 思いやりの「一手間」をかける(身の回りの人に感謝の気持ちを伝える)
- 初めてのこと、慣れないことも、まずやってみる
- たまにはいつもと違う道を通ってみる
- 誘いに乗ってみる（セミナーに参加してみる）

上記のことからも、エゴレジリエンス
を高めるには新しい人や物事に対しても「オープンマインド」を持ったり、思いやりの心を持つことが大事です。



MD


test2 = Test.create!(
  title: "エゴレジリエンス評価テスト",
  description: description_text,
  site_url: "https://next.rikunabi.com/journal/20170130_m1/",
  improvement_suggestion: improvement_suggestion_text,
  min_score: 1,
  max_score: 4,
  avg_score: 2.5,  # 仮の平均スコア
  created_at: Time.now,
  updated_at: Time.now,
  admin: admin,
  status: 30
)



questions = [
  { text: "私は慣れていないことにも楽しみながら取り組むことができる", isReversedScore: false },
  { text: "私は人よりも好奇心が強いと思う", isReversedScore: false },
  { text: "私は新しいことをするのが好きだ", isReversedScore: false },
  { text: "私は日々の生活の中で面白いと感じることが多い", isReversedScore: false },
  { text: "私は人からとてもエネルギッシュな人だと思われている", isReversedScore: false },
  { text: "私は何かするとき，アイデアがたくさん浮かぶほうだ", isReversedScore: false },
  { text: "私の周りには，感じがよい人が多い", isReversedScore: false },
  { text: "私はショックをうけることがあっても直ぐに立ち直るほうだ", isReversedScore: false },
  { text: "私は人にたいてい好印象を与えることができる", isReversedScore: false },
  { text: "私は「かなり強い個性」の持ち主であると思う", isReversedScore: false },
  { text: "私はよく知っているところへ行くにも，違う道を通っていくのが好きだ", isReversedScore: false },
  { text: "私は今まで食べたことがない食べ物を試すことが好きだ", isReversedScore: false },
  { text: "私は誰かのことで腹を立てても，すぐに機嫌が直る", isReversedScore: false },
  { text: "私は友達に対して思いやりがあり，親しい関係をもてる", isReversedScore: false }
]

# 質問データの作成
questions.each do |q|
  Question.create!(question_text: q[:text], test: test2, isReversedScore: q[:isReversedScore])
end


description_text = <<-MD
このテストでは、あなたの自己概念の明確さと一貫性を評価します。以下の質問に対して、回答してください。
### 自己概念とは

自己概念とは、自分自身についての理解が高く、自己に一貫性があることを示しています。
[岡山大学が2012年に行った日本人を対象にした研究論文](https://www.jstage.jst.go.jp/article/personality/20/3/20_193/_pdf)では、以下のことが述べられています。

- 自己概念が高い人は外向性、誠実性、協調性が高い。また、自尊感情が高い。
- 自己概念が低い人は、うつや不安、神経症的な傾向が高い。

上記の事からも、自己概念が低い人は、自分の精神的な面をコントロールすることができず、
計画的な行動を取れない傾向があり、自己概念が高いほど真面目で自尊心高く生活することができることが分かります。

この理由としては、自己概念が低いと、自分が何者かどうか分からないため、
目標を立ててもぶれることが多く、困難なことが生じても、過去の自分の乗り越え方が分からないため、適切に対処できないことがあげられます。
一方で、自己概念が高いと、自分のことを理解して、過去の自分の経験をもとに、適切な目標を立てて、困難な状況にも対処できることが考えられます。
MD

improvement_suggestion_text = <<-MD
自己概念を改善するためには、自分の感情や思考に対してより意識的になり、他者とのコミュニケーションを通じてフィードバックを受けることが大切です。また、自己認識を高めるためにジャーナリングやセルフリフレクションを行うことも有効です。
MD

description_text = <<-MD
このテストでは、あなたの自己概念の明確さと一貫性を評価します。以下の質問に対して、回答してください。
### 自己概念とは

自己概念とは、自分自身についての理解が高く、自己に一貫性があることを示しています。
[岡山大学が2012年に行った日本人を対象にした研究論文](https://www.jstage.jst.go.jp/article/personality/20/3/20_193/_pdf)では、以下のことが述べられています。

- 自己概念が高い人は外向性、誠実性、協調性が高い。また、自尊感情が高い。
- 自己概念が低い人は、うつや不安、神経症的な傾向が高い。

上記の事からも、自己概念が低い人は、自分の精神的な面をコントロールすることができず、
計画的な行動を取れない傾向があり、自己概念が高いほど真面目で自尊心高く生活することができることが分かります。

この理由としては、自己概念が低いと、自分が何者かどうか分からないため、
目標を立ててもぶれることが多く、困難なことが生じても、過去の自分の乗り越え方が分からないため、適切に対処できないことがあげられます。
一方で、自己概念が高いと、自分のことを理解して、過去の自分の経験をもとに、適切な目標を立てて、困難な状況にも対処できることが考えられます。
MD

improvement_suggestion_text = <<-MD
自己概念を改善するためには、自分の感情や思考に対してより意識的になり、他者とのコミュニケーションを通じてフィードバックを受けることが大切です。また、自己認識を高めるためにジャーナリングやセルフリフレクションを行うことも有効です。
MD

test3 = Test.create!(
  title: "自己概念テスト",
  description: description_text,
  site_url: "https://example.com",
  improvement_suggestion: improvement_suggestion_text,
  min_score: 1,
  max_score: 5,
  avg_score: 2.8,  # 仮の平均スコア
  created_at: Time.now,
  updated_at: Time.now,
  admin: admin,
  status: 30
)

# 質問のサンプルデータ作成 (自己概念に関する質問)
questions = [
  { text: "私は自分の性格のいろいろな側面の間に矛盾を感じることはめったにない", isReversedScore: false },
  { text: "私が持っている自分自身に関する信念は頻繁に変わるようだ", isReversedScore: true },
  { text: "私が持っている自分自身に関する信念は，しばしば，互いに矛盾する", isReversedScore: true },
  { text: "これまでの自分がどのような種類の人間であったかを考えても，本当にそのような者であったのかについて，確信はない", isReversedScore: true },
  { text: "時々，私は日ごろの自分が本当の自分ではないという気がする", isReversedScore: true },
  { text: "自分の性格を説明するように求められた場合，私が行う記述は日によって異なるかもしれない", isReversedScore: true },
  { text: "おおむね，私は自分が誰であり何者であるかに関して明確に自覚している", isReversedScore: false },
  { text: "ある日，私は自分自身に関してある意見を持つかもしれないが，別の日にはそれと異なる意見を持つかもしれない", isReversedScore: true },
  { text: "私は，自分が何をしたいのかよくわからないので，しばしば，物事を決心することが困難である", isReversedScore: true },
  { text: "私は，自分が本当はどのような人間であるのかについて考えることに，多くの時間を費やしている", isReversedScore: true },
  { text: "どんなに話したいときでも，私は本当の自分がどのような人間であるかについて誰にも話さないだろうと思う", isReversedScore: true },
  { text: "私は，時々，自分自身のことより他者のことのほうがよく知っていると思うことがある", isReversedScore: true }
]

# 質問データの作成
questions.each do |q|
  Question.create!(question_text: q[:text], test: test3, isReversedScore: q[:isReversedScore])
end