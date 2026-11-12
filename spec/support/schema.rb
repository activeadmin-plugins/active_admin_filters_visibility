ActiveRecord::Schema.define do
  create_table :authors, force: true do |t|
    t.string :name
    t.string :last_name
    t.date :birthday
    t.boolean :active
    t.timestamps
  end
end
