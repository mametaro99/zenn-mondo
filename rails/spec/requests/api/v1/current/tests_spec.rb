require "rails_helper"

RSpec.describe "Api::V1::Current::Tests", type: :request do
  describe "GET /index" do
    subject { get(api_v1_current_tests_path, headers: headers) }

    let(:current_user) { create(:user) }
    let(:headers) { current_user.create_new_auth_token }

    it "returns http success" do
      subject
      expect(response).to have_http_status(:success)
    end
  end
end
