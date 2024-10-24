class CreateTestAnswers < ActiveRecord::Migration[7.0]
  def change
    create_table :test_answers do |t|
      t.references :user, null: false, foreign_key: true
      t.references :test, null: false, foreign_key: true
      t.integer :count, null: false # 同じユーザの同じテストに対する回答数
      t.datetime :timestamp

      t.timestamps
    end
    
    # ユニーク制約の追加
    add_index :test_answers, [:user_id, :test_id, :count], unique: true
  end
end
