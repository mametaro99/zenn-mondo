class QuestionSerializer < ActiveModel::Serializer
  attributes :id, :question_text, :isReversedScore
end
