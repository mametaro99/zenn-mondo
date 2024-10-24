class Test < ApplicationRecord
  has_many :questions, dependent: :destroy
  has_many :test_answers, dependent: :destroy

  validates :title, presence: true
  validates :description, presence: true
end
