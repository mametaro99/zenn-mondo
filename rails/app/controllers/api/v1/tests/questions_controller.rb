class Api::V1::Tests::QuestionsController < Api::V1::BaseController
  before_action :set_test
  before_action :authenticate_admin!, only: [:create, :update, :destroy]

  def index
    questions = @test.questions
    render json: questions
  end

  def create

  end

  def update

  end

  def destroy
  
  end

  private

    def set_test
      @test = Test.find(params[:test_id])
    end
end
