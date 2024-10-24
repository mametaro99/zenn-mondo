class Api::V1::Current::TestsController < Api::V1::BaseController
  before_action :authenticate_user!

  #ログインしたユーザが受けたテストの一覧を返す
  def index 
    @test_answers = TestAnswer.where(user: current_user)
    @tests = Test.where(id: @test_answers.map(&:test_id))
    render json: @tests
  end
end
