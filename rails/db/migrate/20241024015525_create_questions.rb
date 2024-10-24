class CreateQuestions < ActiveRecord::Migration[7.0]
  def change
    create_table :questions do |t|
      t.references :test, null: false, foreign_key: true
      t.string :question_text, null: false
      t.boolean :isReversedScore, null: false, default: false

      t.timestamps
    end
  end
end
