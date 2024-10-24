class TestAnswerDetail < ApplicationRecord
  belongs_to :test_answer
  belongs_to :question
end
