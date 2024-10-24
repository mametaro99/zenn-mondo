class Question < ApplicationRecord
  belongs_to :test
  has_many :test_answer_details, dependent: :destroy
end
