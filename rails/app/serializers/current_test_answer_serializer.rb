class CurrentTestAnswerSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :test_id, :timestamp, :average

  has_many :test_answer_details

  # 各テストの平均点を計算して返す
  def average
    total_score = object.test_answer_details.sum(&:score)
    question_count = object.test_answer_details.size
    (question_count > 0) ? (total_score / question_count.to_f).round(2) : 0
  end
end
