class AddAdminIdIdToTests < ActiveRecord::Migration[7.0]
  def change
    add_reference :tests, :admin_id, foreign_key: { to_table: :admins }
  end
end
