class CreateTestAnswerDetails < ActiveRecord::Migration[7.0]
  def change
    create_table :test_answer_details do |t|
      t.references :test_answer, null: false, foreign_key: true
      t.integer :score, null: false
      t.references :question, null: false, foreign_key: true

      t.timestamps
    end
  end
end
