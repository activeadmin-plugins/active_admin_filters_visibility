ActiveAdmin.register Author do
  filter :name
  filter :last_name
  filter :birthday
  filter :active, as: :select, collection: [['Yes', true], ['No', false]]
  filter :created_at
end
