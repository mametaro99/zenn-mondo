# 禅問道

心理学や医療健康の研究で使われているテストに回答できるアプリです。

<video src="zenn-mondo.mp4" controls="true"></video>


## 作り始めたきっかけ

もともと、心理学や健康科学に興味があり、[論文を読んで記事にまとめたり](https://mametaro99.github.io/)、研究で使われているテストに回答したりしていました。また、自分自身で掲載されているテストを受けていく中で、以下のような課題を感じました。

- 掲載されているテストの点数をメモしたり、計算したりするのが面倒
- 過去にテストを受けたときの記録が残っていないため、自分の進歩が分からない。

上記のような課題感を感じるとともに、少しでも最新の科学を発信し、個人の生活に役立ててもらおうと考え、このアプリを作成しました。

## デモ動画

![alt text](zenn-mondo.gif)

## アプリの概要

このアプリでは、以下のように心理学や健康科学に関わるいくつかのテストを受けることができます。

![alt text](tests.png)

そして、テストを受験すると、結果をグラフで見ることができます。受験者の平均点やテスト結果の推移を見ることができ、過去の結果や平均的な値と比較して、自分の状態を知ることができます。

![alt text](graph.png)

また、各テストで測られる指標についての説明や、その指標がもたらす生活への影響や、その指標の改善点を論文を元に紹介しています。

![alt text](instruction.png)

## アプリの技術スタック

### バックエンド
Ruby(3.1.2)
RailsAPI(7.0.4)

#### 主なGem

- Devise
- bullet
- kaminari
- Rspec
- FactoryBot
- rubocop

### フロントエンド
Typescript(5.3.3)

React(18.3.1)

Next.js(15.0.1) PageRouter

#### 主なライブラリ

- Material-UI(5.14.7)
- ESlint(8.48.0)
- pretter(3.0.3)
- chart.js(グラフ描画)
- marked（マークダウン表示用）

### データベース
MySQL(8.0.32)


### CI・CD
GithubActions

### ソースコード管理
Github

### インフラ
開発環境：
- Docker(24.0.5)
- Ubuntu(22.04.3 LTS)

本番環境：
- AWS（ECS,ECR,VPC,ALB,IAM等）
- zeroSSL(SSL証明書発行)
- ドメイン取得（お名前ドットコム）
- Gmail SMTP(メール送信)

### その他開発ツール

- GoogleChrome
- Talend API Tester(API動作確認)
- Chrome検証機能(フロントエンド動作確認)
- VisualStudioCode



## 開発した機能一覧

- サインイン・サインアウト機能
- サインアップ機能
- ユーザのメール認証機能
- テストの一覧・詳細表示
- テストの受験フォーム
- ユーザのテスト結果のグラフ作成

## 工夫したところ　【バックエンド】

### 1.CROD設計

RailsControllerで定義するメソッドを、[CROD設計](https://zenn.dev/code_journey_ys/articles/702a2f1d4b97da)に基づいて、以下のもののみに限定しました。

- new
- create
- index
- show
- edit
- update
- delete


上記のように、CRUD設計に従うことで、コントローラに書くメソッドを統一して、コードの可読性を上げるようにしました。

また、フロントエンド側からしても、エンドポイントやメソッドが分かりやすいように設計しました。

### 2.スコアを反転できる質問を追加できるようにして、テスト結果を適切に評価できるようにした。

[心理学などで使われる選択式アンケートでは、問われている質問に対して、
すべての回答に最大点を選択する等、被験者にバイアスがかかってしまう場合があります。](https://archives.bukkyo-u.ac.jp/rp-contents/KO/0031/KO00310L015.pdf)


そこで、[逆転項目](https://kotodori.jp/user-research/survey/questionnaire-reversal-item/#:~:text=%E3%81%8C%E3%81%A7%E3%81%8D%E3%81%BE%E3%81%99%E3%80%82-,%E9%80%86%E8%BB%A2%E9%A0%85%E7%9B%AE%E3%81%AE%E3%83%A1%E3%83%AA%E3%83%83%E3%83%88,%E3%82%92%E6%95%A3%E3%82%89%E3%81%97%E3%81%9F%E3%82%8A%E3%81%97%E3%81%BE%E3%81%99%E3%80%82)という選んだ選択肢の結果を反転する質問項目を追加することで被験者が適切な評価を行えるようにすることがあります。

このアプリにおいても、逆転項目を各テストに反映するために、
各質問について変数isRevercedScoreを使って点数を反転する質問かどうかを判断できるようにしました。

そして、ユーザがテストの各質問に回答した時に、
質問のisReversedScoreがtrueの場合に、点数を反転させるように実装しました。



![alt text](reverse.png)

### 3.N+1問題を解決

あるテスト回答結果の一覧を取得する以下のadd_index関数にて、N+1問題が起こっていました。

```ruby:rails/app/controllers/api/v1/current/tests/test_answers_controller.rb
def all_index
    ...
    @test_answers = TestAnswer.where(test: @test) #　←ここで、N+１問題が発生
    render json: @test_answers, each_serializer: CurrentTestAnswerSerializer
  end
```

実行結果

```ruby
 TestAnswer Load (0.8ms)  SELECT `test_answers`.* FROM `test_answers` WHERE `test_answers`.`test_id` = 3
  ↳ app/controllers/api/v1/current/tests/test_answers_controller.rb:39:in `all_index'
[active_model_serializers]   TestAnswerDetail Load (0.7ms)  SELECT `test_answer_details`.* FROM `test_answer_details` WHERE `test_answer_details`.`test_answer_id` = 5
[active_model_serializers]   ↳ app/controllers/api/v1/current/tests/test_answers_controller.rb:39:in `all_index'
[active_model_serializers] No serializer found for resource: #<TestAnswerDetail id: 25, test_answer_id: 5, score: 2, question_id: 21, created_at: "2025-01-29 04:08:36.614623000 +0000", updated_at: "2025-01-29 04:08:36.614623000 +0000">
[active_model_serializers]   TestAnswerDetail Load (0.9ms)  SELECT `test_answer_details`.* FROM `test_answer_details` WHERE `test_answer_details`.`test_answer_id` = 6
[active_model_serializers]   ↳ app/controllers/api/v1/current/tests/test_answers_controller.rb:39:in `all_index'
```

上記のように、TestAnswer（回答結果）のレコード(id=5,6)ごとに、TestAnswerDetailsの検索クエリが発行されていて、N+1問題が起こっています。

[N+1問題とは、データベースから取得した1つのレコードに対して、関連するデータを取得するために、関連するテーブルに対して複数のSQLクエリを発行してしまう問題のこと](https://qiita.com/disk042/items/ce0ea1774c29cb981df2#:~:text=2023%2D03%2D30-,N%2B1%E5%95%8F%E9%A1%8C%E3%81%A8%E3%81%AF,%E8%80%83%E3%81%88%E3%81%A6%E3%81%BF%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82)です。N+1問題が起こると、重複した不要なクエリが何度も発行されるためにメモリの使用量が増えたり、データベースの問合せ回数の増加により、応答時間が増えたりしてアプリケーションのパフォーマンスが下がってしまいます。
今回の場合は、以下の流れでN+1問題が起こってしまいます。


- ある一つのTest(テスト)に紐づく、すべてのTestAnswer(回答結果)を検索するクエリが発行される。
- 一件目のTestAnswer(回答結果)に紐づく、すべての質問の回答結果の詳細（TestAnswerDetails）を検索するクエリが発行される。
- 二件目のTestAnswer(回答結果)に紐づく、すべての質問の回答結果の詳細（TestAnswerDetails）を検索するクエリが発行される。
- 三件目...(すべての回答結果の件数だけ、内容のクエリが発行される)

上記のように、回答結果の数Nだけ、すべての質問の回答詳細を検索するクエリが発行され、N+1問題が発生してしまいます。

これを解消するために、以下のようにincludes関数を使ってN+1の問題を解消しました。

```ruby:rails/app/controllers/api/v1/current/tests/test_answers_controller.rb
def all_index
    ...
    @test_answers = TestAnswer.where(test: @test).includes(:test_answer_details) #　←ここで、N+１問題が発生が発生していたためincludesを追加
    render json: @test_answers, each_serializer: CurrentTestAnswerSerializer
  end
```

実行結果

```ruby
TestAnswer Load (0.7ms)  SELECT `test_answers`.* FROM `test_answers` WHERE `test_answers`.`test_id` = 3
  ↳ app/controllers/api/v1/current/tests/test_answers_controller.rb:39:in `all_index'
  TestAnswerDetail Load (1.1ms)  SELECT `test_answer_details`.* FROM `test_answer_details` WHERE `test_answer_details`.`test_answer_id` IN (5, 6)
  ↳ app/controllers/api/v1/current/tests/test_answers_controller.rb:39:in `all_index'
```
上記の結果のように、２回クエリが発行されるだけで処理が終了しています。


includes関数を追加することで以下のようにクエリが発行されるようになります。

- ある一つのTest(テスト)に紐づく、すべてのTestAnswer(回答結果)を検索するクエリが発行される。
- 上記で取得したTestAnswerに紐づく、すべての質問の回答結果の詳細（TestAnswerDetails）を取得する。

上記の流れで本来、取得した回答結果の数Nだけ、クエリが叩かれていたものの、２件に止めることができました。
これによって、メモリの使用量の削減や、パフォーマンスアップを向上させることができました。




## 工夫したところ　【フロントエンド】

### 1.結果をグラフ化して、直感的にテストの結果が分かるようにした。

フロントエンドでは、chart.jsを使って、テストの結果を

- 縦軸:点数
- 横軸:期間

の折れ線グラフで表示しました。

このグラフを表示することによって、ユーザの期間ごとのテスト結果の違いが分かります。

また、実際の研究で使われている平均点も表示することで、自分のテストで測る指標を客観的なデータと比較して、理解することができます。

![alt text](graph.png)

### 2.研究論文を紹介して、テストで測った指標のメリット・デメリットや改善案を提示

テスト結果のグラフの下部に研究についての説明やテストで測った指標の改善案を紹介する文を記載しました。

テストの結果の下に研究内容や改善案を提示することで、
ユーザが自分が得たテストの数値的な結果に加えて、さらにその結果のメリットやデメリットやテストで測った指標を改善するための具体的な方法を知ることができます。


改善案例（自己概念）
![alt text](image.png)

## データベース設計

以下は、このアプリのデータベース設計となっています。

```mermaid
---
title: "禅問道のデータベース設計"
---

erDiagram
    USERS {
        string provider "認証プロバイダの種類（デフォルトは 'email'）"
        string uid "ユーザ固有のID（デフォルトは空）"
        string encrypted_password "暗号化されたパスワード"
        string reset_password_token "パスワードリセット用トークン"
        datetime reset_password_sent_at "パスワードリセットトークンの送信日時"
        boolean allow_password_change "パスワード変更の許可フラグ（デフォルトは false）"
        datetime remember_created_at "ログイン情報の記憶日時"
        string confirmation_token "アカウント確認用トークン"
        datetime confirmed_at "アカウント確認完了日時"
        datetime confirmation_sent_at "確認メール送信日時"
        string unconfirmed_email "未確認のメールアドレス"
        string name "ユーザの名前"
        string nickname "ユーザのニックネーム"
        string image "ユーザのプロフィール画像"
        string email "ユーザのメールアドレス（ユニーク）"
        text tokens "認証用トークンの集合"
        datetime created_at "レコード作成日時"
        datetime updated_at "レコード更新日時"
    }

    TESTS {
        string title "テストのタイトル"
        text description "テストの詳細な説明"
        string site_url "テストに関連するウェブサイトのURL"
        text improvement_suggestion "改善の提案またはフィードバック"
        integer min_score "テストの最低スコア"
        integer max_score "テストの最高スコア"
        float avg_score "テストの平均スコア"
        datetime created_at "レコード作成日時"
        datetime updated_at "レコード更新日時"
    }

    QUESTIONS {
        bigint test_id "テストの外部キー、どのテストに属するかを示す"
        string question_text "質問のテキスト内容"
        boolean isReversedScore "スコアを反転するかのフラグ（デフォルトは false）"
        datetime created_at "レコード作成日時"
        datetime updated_at "レコード更新日時"
    }

    TEST_ANSWERS {
        bigint user_id "回答したユーザの外部キー"
        bigint test_id "回答したテストの外部キー"
        integer count "ユーザがテストを受けた回数"
        datetime timestamp "回答のタイムスタンプ"
        datetime created_at "レコード作成日時"
        datetime updated_at "レコード更新日時"
    }

    TEST_ANSWER_DETAILS {
        bigint test_answer_id "テストの回答の外部キー"
        integer score "質問に対するスコア"
        bigint question_id "対応する質問の外部キー"
        datetime created_at "レコード作成日時"
        datetime updated_at "レコード更新日時"
    }

    USERS ||--o{ TEST_ANSWERS : "user_id"
    TESTS ||--o{ QUESTIONS : "test_id"
    TESTS ||--o{ TEST_ANSWERS : "test_id"
    QUESTIONS ||--o{ TEST_ANSWER_DETAILS : "question_id"
    TEST_ANSWERS ||--o{ TEST_ANSWER_DETAILS : "test_answer_id"

```

## インフラ設計図

![alt text](zen-mondo-network.drawio.png)

上記は、ネットワークの構成については、以下の記事を参考に設計しました。

[【独学ポートフォリオ開発応援】実務未経験から学べる！Rails×Next.js×AWSハンズオン解説](https://zenn.dev/ddpmntcpbr/books/rna-hands-on)


## 論文PDFを生成系AIに渡して、質問を自動生成

以下を参照

- [【Nextjs】【TypeScript】PDFの内容を質問するアプリを作る_arafipro](https://zenn.dev/arafipro/books/pdf-question-yt)