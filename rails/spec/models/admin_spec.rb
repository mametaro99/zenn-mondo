require 'rails_helper'

RSpec.describe Admin, type: :model do
  context "factoryのデフォルト設定に従った場合" do
    let(:admin) { create(:user) }

    it "認証済みの admin レコードを正常に新規作成できる" do
      expect(admin).to be_valid
      expect(admin).to be_confirmed
    end
  end
end