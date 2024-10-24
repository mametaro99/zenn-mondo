class Api::V1::QuestionsController < Api::V1::BaseController
  before_action :set_test
  before_action :authenticate_user!, only: [:create]

  def index
    questions = @test.questions
    render json: questions
  end

  def create
    @test_answer = TestAnswer.new(test_answer_params)
    @test_answer.user = current_user
    @test_answer.test = @test
    @test_answer.timestamp = Time.now

    @test.questions.each do |question|
      score = params[:scores][question.id.to_s].to_i
      # 反転スコアの処理
      if question.isReversedScore
        score = @test.max_score - score + @test.min_score
      end
      TestAnswerDetail.create!(test_answer: @test_answer, question: question, score: score)
    end
    render json: @test_answer
  end

  private

  def set_test
    @test = Test.find(params[:test_id])
  end

  def test_answer_params
    params.permit(:user_id, :test_id, :timestamp)
  end
end
