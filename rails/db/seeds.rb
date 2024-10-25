# ユーザーのサンプルデータ作成
user1 = User.create!(email: "user1@example.com", password: "password123", name: "ユーザー1")
user2 = User.create!(email: "user2@example.com", password: "password123", name: "ユーザー2")


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
  updated_at: Time.now
)

test2 = Test.create!(
  title: "リーダーシップテスト",
  description: "リーダーシップ能力を測るためのテストです。",
  site_url: "https://example.com",
  improvement_suggestion: "リーダーシップを高めるためには、自己啓発を行うことが大切です。",
  min_score: 1,
  max_score: 5,
  avg_score: 4.0,  # 仮の平均スコア
  created_at: Time.now,
  updated_at: Time.now
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
  updated_at: Time.now
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