class Api::V1::Current::TestsController < Api::V1::BaseController
  before_action :authenticate_user!, only: [:index]
  before_action :authenticate_admin!, only: [:create, :update, :destroy] 


  # ログインしたユーザが受けたテストの一覧を返す
  def index
    @test_answers = TestAnswer.where(user: current_user)
    @tests = Test.where(id: @test_answers.map(&:test_id))
    render json: @tests
  end

  def create
    test = Test.create!(test_params.merge(admin_id_id: current_admin.id))
    render json: test
  end

  def update
    
  end

  def destroy
  
  end

  protected

  # t.string :title # テストのタイトル
  # t.text :description # テストの説明、目的、採点方法（MarkDownで記述）
  # t.string :site_url # テスト内容が記載されている論文URL、または自身のブログ記事URL
  # t.text :improvement_suggestion # テストで測定される結果の改善案や豆知識（MarkDownで記述）
  # t.integer :min_score # テストの採点範囲の最低点
  # t.integer :max_score # テストの採点範囲の最高点
  # t.float :avg_score # 論文や調査で判明しているテストの平均点

  def test_params
    params.require(:test).permit(:title, :description, :site_url, :improvement_suggestion, :min_score, :max_score, :avg_score)
  end
end
