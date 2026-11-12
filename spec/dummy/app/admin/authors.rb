ActiveAdmin.register Author do
  filter :name
  filter :last_name
  filter :birthday
  # The custom detector counts only "Yes", so it must win over the built-in
  # select detector.
  filter :active, as: :select, collection: [['Yes', true], ['No', false]], wrapper_html: { class: 'yes-only' }
  filter :created_at
end
