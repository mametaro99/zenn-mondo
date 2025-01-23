class AddStatusToTests < ActiveRecord::Migration[7.0]
  def change
    add_column :tests, :status, :integer, comment: "ステータス（10:未保存, 20:下書き, 30:公開中）"
  end
end
