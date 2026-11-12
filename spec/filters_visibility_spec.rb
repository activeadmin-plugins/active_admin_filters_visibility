describe 'filters visibility', type: :feature do
  FILTERS = {
    'q_name_input' => 'Name',
    'q_last_name_input' => 'Last name',
    'q_birthday_input' => 'Birthday',
    'q_active_input' => 'Active',
    'q_created_at_input' => 'Created at'
  }.freeze

  let(:section) { '#filters_sidebar_section' }

  def theme?
    defined?(ActiveAdminTheme)
  end

  def open_panel
    find("#{section} [data-filters-visibility-toggle]").click
    expect(page).to have_css('[data-filters-visibility-panel]', visible: :visible)
  end

  def checkbox(id)
    find("[data-filters-visibility-checkbox='#{id}']")
  end

  def form_order
    page.evaluate_script(<<~JS)
      Array.from(document.querySelectorAll('#{section} form .filters-form-field')).map((el) => el.id)
    JS
  end

  # Chrome DevTools has no HTML5 drag and drop, so dispatch the events.
  def drag(source_id, onto:)
    page.execute_script(<<~JS)
      const list = document.querySelector('[data-filters-visibility-panel] ul')
      const source = list.querySelector('[data-filters-visibility-item="#{source_id}"]')
      const target = list.querySelector('[data-filters-visibility-item="#{onto}"]')
      const rect = target.getBoundingClientRect()
      const dataTransfer = new DataTransfer()
      const fire = (el, type) => el.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer, clientY: rect.top + 1 }))
      fire(source, 'dragstart')
      fire(target, 'dragover')
      fire(target, 'drop')
      fire(source, 'dragend')
    JS
  end

  before do
    Author.create!(name: 'John', last_name: 'Doe')
    visit '/admin/authors'
  end

  it 'puts the toggle in the header the layout shows' do
    header = theme? ? "#{section} .panel > .panel-title" : "#{section} > h3.filters-form-title"
    expect(page).to have_css("#{header}[data-filters-visibility-header] > [data-filters-visibility-toggle]", visible: :visible)
    expect(page).to have_css('[data-filters-visibility-panel]', visible: :hidden)
    expect(find("#{section} [data-filters-visibility-toggle]")['aria-expanded']).to eq('false')
  end

  it 'lists every filter, checked, in the panel' do
    open_panel

    expect(find("#{section} [data-filters-visibility-toggle]")['aria-expanded']).to eq('true')
    expect(page).to have_css('[data-filters-visibility-checkbox]', count: FILTERS.size)
    FILTERS.each do |id, label|
      expect(page).to have_css("[data-filters-visibility-item='#{id}']", text: label)
      expect(checkbox(id)).to be_checked
      expect(page).to have_css("##{id}", visible: :visible)
    end
    expect(page).not_to have_css('[data-filters-visibility-toggle][data-filters-visibility-active]')
  end

  it 'hides a filter, keeps it hidden after a reload, and shows it again' do
    open_panel
    checkbox('q_birthday_input').uncheck

    expect(page).to have_css('#q_birthday_input[data-filters-visibility-hidden]', visible: :hidden)
    expect(page).to have_css('[data-filters-visibility-toggle][data-filters-visibility-active]')
    expect(page).to have_css('#q_name_input', visible: :visible)

    visit '/admin/authors'
    expect(page).to have_css('#q_birthday_input', visible: :hidden)
    expect(page).to have_css('[data-filters-visibility-toggle][data-filters-visibility-active]')

    open_panel
    expect(checkbox('q_birthday_input')).not_to be_checked
    checkbox('q_birthday_input').check
    expect(page).to have_css('#q_birthday_input', visible: :visible)
    expect(page).not_to have_css('[data-filters-visibility-toggle][data-filters-visibility-active]')

    visit '/admin/authors'
    expect(page).to have_css('#q_birthday_input', visible: :visible)
  end

  it 'stores the state per page under a prefixed key' do
    open_panel
    checkbox('q_birthday_input').uncheck
    expect(page).to have_css('#q_birthday_input', visible: :hidden)

    stored = page.evaluate_script("localStorage.getItem('active_admin_filters_visibility:/admin/authors')")
    expect(JSON.parse(stored)).to eq('hidden' => ['q_birthday_input'])
  end

  it 'keeps a hidden filter visible while it has a value' do
    open_panel
    checkbox('q_name_input').uncheck
    checkbox('q_active_input').uncheck

    visit '/admin/authors?q[name_cont]=Jo&q[active_eq]=true'

    expect(page).to have_css('#q_name_input', visible: :visible)
    expect(page).to have_css('#q_active_input', visible: :visible)

    visit '/admin/authors'
    expect(page).to have_css('#q_name_input', visible: :hidden)
    expect(page).to have_css('#q_active_input', visible: :hidden)
  end

  it 'reorders filters by drag and drop and keeps the order' do
    open_panel
    drag('q_created_at_input', onto: 'q_name_input')

    expected = %w[q_created_at_input q_name_input q_last_name_input q_birthday_input q_active_input]
    expect(form_order).to eq(expected)

    visit '/admin/authors'
    expect(form_order).to eq(expected)
    items = all('[data-filters-visibility-item]', visible: :all).map { |item| item['data-filters-visibility-item'] }
    expect(items).to eq(expected)
  end

  it 'resets visibility and order' do
    open_panel
    checkbox('q_birthday_input').uncheck
    drag('q_created_at_input', onto: 'q_name_input')

    find('[data-filters-visibility-reset]').click

    expect(page).to have_css('#q_birthday_input', visible: :visible)
    expect(form_order).to eq(FILTERS.keys)
    expect(page).not_to have_css('[data-filters-visibility-toggle][data-filters-visibility-active]')

    visit '/admin/authors'
    expect(page).to have_css('#q_birthday_input', visible: :visible)
    expect(form_order).to eq(FILTERS.keys)
  end
end
