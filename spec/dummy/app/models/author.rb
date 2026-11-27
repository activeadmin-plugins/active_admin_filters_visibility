class Author < ApplicationRecord
  def self.ransackable_attributes(_auth_object = nil)
    %w[name last_name birthday active created_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    []
  end
end
