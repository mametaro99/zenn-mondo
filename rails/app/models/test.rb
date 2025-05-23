class Test < ApplicationRecord
  has_many :questions, dependent: :destroy
  has_many :test_answers, dependent: :destroy
  belongs_to :admin

  validates :title, presence: true, if: -> { published? }
  validates :description, presence: true, if: -> { published? }
  enum :status, { unsaved: 10, draft: 20, published: 30 }

  validate :verify_only_one_unsaved_status_is_allowed

   private

    def verify_only_one_unsaved_status_is_allowed
      if unsaved? && admin.tests.unsaved.present?
        raise StandardError, "未保存の記事は複数保有できません"
      end
    end
end
