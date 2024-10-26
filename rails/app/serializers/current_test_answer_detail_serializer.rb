class CurrentTestAnswerDetailSerializer < ActiveModel::Serializer
  attributes :id, :question_id, :score
end
