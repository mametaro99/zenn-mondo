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

  end

  def update

  end

  def destroy
  
  end
end
