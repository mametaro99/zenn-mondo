class Api::V1::Current::Tests::TestAnswersController < Api::V1::BaseController
  before_action :set_test
  before_action :authenticate_user!, only: [:create]
  before_action :authenticate_admin!, only: [:all_index]

  def index
    @test_answers = TestAnswer.where(user: current_user, test: @test)
    # 各テストの回答結果も含めて返す
    render json: @test_answers, each_serializer: CurrentTestAnswerSerializer
  end

  def create
    @test_answer = TestAnswer.new(test_answer_params)
    @test_answer.user = current_user
    @test_answer.test = @test
    @test_answer.timestamp = Time.zone.now
    if @test_answer.save
      @test.questions.each do |question|
        score = params[:scores][question.id.to_s].to_i
        # 反転スコアの処理
        if question.isReversedScore
          score = @test.max_score - score + @test.min_score
        end
        TestAnswerDetail.create!(test_answer: @test_answer, question: question, score: score)
      end
      render json: @test_answer, serializer: CurrentTestAnswerSerializer
    else
      render json: { errors: @test_answer.errors.full_messages }, status: :unprocessable
    end
  end
  
  # 一つのテストに紐づく回答をすべて表示する
  def all_index
    if current_admin != @test.admin
      render json: { errors: 'You do not have permission to view this test answers' }, status: :forbidden
      return
    end
    @test_answers = TestAnswer.where(test: @test).includes(:test_answer_details)
    render json: @test_answers, each_serializer: CurrentTestAnswerSerializer
  end

  private

    def set_test
      @test = Test.find(params[:test_id])
    end

    def test_answer_params
      params.permit(:user_id, :test_id, :timestamp)
    end
end
