class Api::V1::Tests::QuestionsController < Api::V1::BaseController
  before_action :set_test
  def index
    questions = @test.questions
    render json: questions
  end

  private

  def set_test
    @test = Test.find(params[:test_id])
  end
end