Time.zone = 'America/Los_Angeles'

# helpers and such
helpers do
  def title
    suffix = 'Evan Lecklider'
    joiner = ' | '
    if current_article.present?
      [current_article.title, suffix].join(joiner)
    elsif current_page.data.title.present?
      [current_page.data.title, suffix].join(joiner)
    else
      suffix
    end
  end
end

# markdown options
set :markdown_engine, :redcarpet
set :markdown, fenced_code_blocks: true, smartypants: true

# dirs
set :css_dir,    'styles'
set :js_dir,     'scripts'
set :images_dir, 'images'

# autoprefix the business
activate :autoprefixer do |config|
  config.browsers = ['last 2 versions']
end

# blog blog blog
activate :blog do |blog|
  blog.permalink         = '{year}/{month}/{title}.html'
  blog.layout            = 'post'
  blog.tag_template      = 'tag.html'
  blog.calendar_template = 'calendar.html'
end

# pages
page '/feed.xml', layout: false
page 'CNAME', layout: false

# Reload the browser automatically whenever files change in dev
configure :development do
  activate :livereload
end

# Used for our in-page syntax highlighting.
activate :syntax, line_numbers: true

# Minify and hash all the things!
configure :build do
  activate :asset_hash
  activate :gzip
  activate :minify_css
  activate :minify_javascript
  activate :minify_html do |html|
    html.simple_doctype = true
  end
end

# Deploy via GitHub pages.
activate :deploy do |deploy|
  deploy.build_before = true
  deploy.method       = :git
end
