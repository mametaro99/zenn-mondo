class CreateTests < ActiveRecord::Migration[7.0]
  def change
    create_table :tests do |t|
      t.string :title #テストのタイトル
      t.text :description #テストの説明、目的、採点方法（MarkDownで記述）
      t.string :site_url #テスト内容が記載されている論文URL、または自身のブログ記事URL
      t.text :improvement_suggestion #テストで測定される結果の改善案や豆知識（MarkDownで記述）
      t.integer :min_score #テストの採点範囲の最低点
      t.integer :max_score #テストの採点範囲の最高点
      t.float :avg_score #論文や調査で判明しているテストの平均点

      t.timestamps
    end
  end
end
