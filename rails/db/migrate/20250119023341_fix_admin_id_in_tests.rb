class FixAdminIdInTests < ActiveRecord::Migration[7.0]
  def change
    # 不要なカラムを削除
    remove_column :tests, :admin_id_id, :bigint

    # 正しいカラムを追加
    add_reference :tests, :admin, foreign_key: { to_table: :admins }
  end
end
