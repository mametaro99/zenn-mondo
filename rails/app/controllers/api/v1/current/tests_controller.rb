class Api::V1::Current::TestsController < Api::V1::BaseController
  include Pagination
  before_action :authenticate_user!, only: [:index]
  before_action :authenticate_admin!, only: [:admin_index, :show, :create, :update, :destroy, :bulk_question_create] 


  # ログインしたユーザが受けたテストの一覧を返す
  def index
    @test_answers = TestAnswer.where(user: current_user)
    @tests = Test.where(id: @test_answers.map(&:test_id))
    render json: @tests
  end
  
  def admin_index
    @tests = current_admin.tests.not_unsaved.order(created_at: :desc)
    render json: @tests, each_serializer: TestSerializer, adapter: :json
  end

  def show
    test = current_admin.tests.find(params[:id])
    render json: test
  end

  def create
    unsaved_test = current_admin.tests.unsaved.first || current_admin.tests.create!(status: :unsaved)
    render json: unsaved_test
  end

  def bulk_question_create
    questions = params.require(:questions).map do |question_params|
      Question.create!(
        test_id: params[:id],
        question_text: question_params[:question_text],
        isReversedScore: question_params[:isReversedScore]
      )
    end

    render json: questions, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors }, status: :unprocessable_entity
  end

  def update
    test = Test.find(params[:id])
    if test.admin == current_admin
      test.update!(test_params)
      render json: test
    else
      render json: { errors: 'You do not have permission to update this test' }, status: :forbidden
    end
  end

  def destroy
    test = Test.find(params[:id])
    if test.admin == current_admin
      test.destroy!
      render json: test
    else
      render json: { errors: 'You do not have permission to delete this test' }, status: :forbidden
    end
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
    params.require(:test).permit(:title, :description, :site_url, :improvement_suggestion, :min_score, :max_score, :avg_score, :status)
  end

  def questions_params
    params.require(:questions).map do |question|
      question.permit(:question_text, :isReversedScore)
    end
  end
end
