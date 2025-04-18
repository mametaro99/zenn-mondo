class Api::V1::TestsController < ApplicationController
  include Pagination
  def show
    test = Test.find(params[:id])
    render json: test
  end

  def index
    tests = Test.order(created_at: :desc).page(params[:page] || 1).per(10)
    published_tests = tests.where(status: :published)
    render json: published_tests, each_serializer: TestSerializer, meta: pagination(published_tests), adapter: :json
  end
end
