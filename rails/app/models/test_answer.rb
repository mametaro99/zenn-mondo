class TestAnswer < ApplicationRecord
  belongs_to :user
  belongs_to :test
  has_many :test_answer_details, dependent: :destroy

  before_create :set_count

  private

    # countに、同じユーザー、同じテストの中で最大のcount + 1をセットする
    def set_count
      max_count = TestAnswer.where(user: user, test: test).maximum(:count) || 0
      self.count = max_count + 1
    end
end
