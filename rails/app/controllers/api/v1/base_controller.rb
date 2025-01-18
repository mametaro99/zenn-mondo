class Api::V1::BaseController < ApplicationController
  alias_method :current_user, :current_api_v1_user
  alias_method :authenticate_user!, :authenticate_api_v1_user!
  alias_method :user_signed_in?, :api_v1_user_signed_in?

  alias_method :current_admin, :current_api_v1_admin_admin
  alias_method :authenticate_admin!, :authenticate_api_v1_admin_admin!
  alias_method :admin_signed_in?, :api_v1_admin_admin_signed_in?
end
