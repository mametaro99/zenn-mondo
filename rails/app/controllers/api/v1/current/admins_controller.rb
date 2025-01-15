class Api::V1::Current::AdminsController < Api::V1::BaseController
  before_action :authenticate_admin!

  def show
    render json: current_admin, serializer: CurrentAdminSerializer
  end
end
