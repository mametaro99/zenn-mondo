class Api::V1::Current::Tests::QuestionsController < Api::V1::BaseController
  before_action :set_test
  before_action :authenticate_admin!, only: [:create, :update, :destroy]

  def create
    if @test.admin == current_admin
      question = @test.questions.create!(question_params)
      render json: question
    else
      render json: { errors: 'You do not have permission to create a question for this test' }, status: :forbidden
    end
  end

  def update
    question = @test.questions.find(params[:id])
    if @test.admin == current_admin
      question.update!(question_params)
      render json: question
    else
      render json: { errors: 'You do not have permission to update this question' }, status: :forbidden
    end
  end

  def destroy
    question = @test.questions.find(params[:id])
    if @test.admin == current_admin
      question.destroy!
      render json: question
    else
      render json: { errors: 'You do not have permission to delete this question' }, status: :forbidden
    end
  end

  private

  def set_test
    @test = Test.find(params[:test_id])
  end

  def question_params
    params.require(:question).permit(:question_text, :isReversedScore)
  end
end