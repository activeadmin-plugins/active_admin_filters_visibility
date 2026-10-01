require 'spec_helper'

describe 'filters visibility', type: :feature, js: true do

  # The dummy app's active_admin.js calls
  # `$('#filters_sidebar_section').activeAdminFiltersVisibility()`, so these
  # are the filters Active Admin derives from the authors table.
  FILTERS = {
    'Name' => '#q_name_input',
    'Last name' => '#q_last_name_input',
    'Birthday' => '#q_birthday_input',
    'Created at' => '#q_created_at_input',
    'Updated at' => '#q_updated_at_input'
  }.freeze

  # The visibility panel is `display: none` until the gear button is clicked.
  def open_visibility_panel
    page.find('#filters_sidebar_section .filters-visibility-button').click
    expect(page).to have_css('.filters-visibility-panel')
  end

  def visibility_checkbox(label)
    page.find(".filters-visibility-panel input[type=checkbox][value='#{label}']")
  end

  before do
    Author.create!(name: 'John', last_name: 'Doe')
    Author.create!(name: 'Jane', last_name: 'Roe')
    add_author_resource
    visit '/admin/authors'
  end

  it 'renders the gear button and the visibility panel in the filters sidebar' do
    expect(page).to have_css('#filters_sidebar_section h3 span.filters-visibility-button')
    # hidden until the button is clicked
    expect(page).to have_css('#filters_sidebar_section .panel_contents > .filters-visibility-panel', visible: :hidden)
    expect(page).to have_css('.filters-visibility-panel > div > strong', text: 'Visibility:', visible: :hidden)

    open_visibility_panel
  end

  it 'has one checked checkbox per filter and shows every filter' do
    open_visibility_panel

    expect(page).to have_css('.filters-visibility-panel input[type=checkbox]', count: FILTERS.size)
    FILTERS.each do |label, selector|
      expect(visibility_checkbox(label)).to be_checked
      expect(page).to have_css(selector)
    end
    expect(page).not_to have_css('.filters-visibility-button.active')
  end

  it 'hides a filter when its checkbox is unchecked' do
    open_visibility_panel
    visibility_checkbox('Birthday').click

    expect(page).to have_css('#q_birthday_input', visible: :hidden)
    expect(page).to have_css('.filters-visibility-button.active')
    # the other filters are untouched
    expect(page).to have_css('#q_name_input')
    expect(page).to have_css('#q_created_at_input')
  end

  it 'keeps the filter hidden after a page reload' do
    open_visibility_panel
    visibility_checkbox('Birthday').click
    expect(page).to have_css('#q_birthday_input', visible: :hidden)

    visit '/admin/authors'

    expect(page).to have_css('#q_birthday_input', visible: :hidden)
    expect(page).to have_css('.filters-visibility-button.active')

    open_visibility_panel
    expect(visibility_checkbox('Birthday')).not_to be_checked
    expect(visibility_checkbox('Name')).to be_checked
  end

  it 'shows the filter again when the checkbox is re-checked' do
    open_visibility_panel
    visibility_checkbox('Birthday').click
    expect(page).to have_css('#q_birthday_input', visible: :hidden)

    visibility_checkbox('Birthday').click

    expect(page).to have_css('#q_birthday_input')
    expect(page).not_to have_css('.filters-visibility-button.active')
  end

end
