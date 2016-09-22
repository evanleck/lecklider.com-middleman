---
title: Decorating Ruby's Net::HTTP for Fun and Profit
date: 2016-09-22 10:03 PDT
tags: Ruby, HTTP
---

Ruby's [`Net::HTTP`](http://ruby-doc.org/stdlib-2.3.1/libdoc/net/http/rdoc/Net/HTTP.html) library gets a bad wrap, somewhat appropriately, for being opaque and cumbersome to implement in any meaninful way. It _works_ but it is gruesome to write every time you need to get data from a remote host. Obviously there are [a](https://github.com/lostisland/faraday) [zillion](https://github.com/typhoeus/typhoeus) [HTTP](https://github.com/jnunemaker/httparty) [wrappers](https://github.com/taf2/curb) [already](https://github.com/rest-client/rest-client) implemented, but I wanted to keep my dependencies low so I built my own little decorator around `Net::HTTP` called `HTTPDecorator`.

It's limited. I know that and you should too, but it does what I need and could be extended with more features as needed. Right now it supports:

1. These HTTP verbs: `GET` `POST` `PUT` `DELETE` `PATCH`.
2. Multipart uploads from the `params['file']` .
3. Send/receive JSON by default. _Sidebar: I use [Oj](https://github.com/ohler55/oj) for marshalling, but figured I'd keep it simple here._
4. Allow sending `application/x-www-form-urlencoded` as needed.
5. Separate read/open timeouts configured as constants.
6. Reusable, open connections using the `start` and `finish` methods.

Here are some examples of it in use:

```ruby
##
# Create an instance with the domain we'd like to call.
@api = HTTPDecorator.new('endpoint.com')

##
# Basic usage
get  = @api.get('/info')    # GET  https://endpoint.com/info
post = @api.post('/create') # POST https://endpoint.com/create

##
# Using the parsed response (assuming the response is JSON).
user = @api.get('/users/2') # { "name": "Bob" }
user['name'] # => "Bob"

##
# Reuse one connection across requests.
@api.start do |api|
  api.get('/info')
  api.put('/updated')
end

# -- OR --
@api.start
@api.get('/info')
@api.put('/updated')
@api.finish
```

And here's the implementation (which I also [posted as a gist](https://gist.github.com/evanleck/f60b6437ebbbbf96709937804e81d44c)):

```ruby
# encoding: UTF-8
# frozen_string_literal: true
require 'net/http'
require 'json'
require 'uri'

class HTTPDecorator
  # Timeouts
  OPEN_TIMEOUT = 10  # in seconds
  READ_TIMEOUT = 120 # in seconds

  # Content-types
  CONTENT_TYPE_JSON = 'application/json'
  CONTENT_TYPE_FORM = 'application/x-www-form-urlencoded'
  CONTENT_TYPE_MULTIPART = "multipart/form-data; boundary=#{ Rack::Multipart::MULTIPART_BOUNDARY }"

  def initialize(domain)
    # Build up our HTTP object
    @http = Net::HTTP.new(domain, 443)
    @http.use_ssl = true
    @http.verify_mode = OpenSSL::SSL::VERIFY_PEER
    @http.open_timeout = OPEN_TIMEOUT
    @http.read_timeout = READ_TIMEOUT

    # In local development we can log requests and responses to $stdout.
    #   DO NOT EVER do this in production. EVER.
    if ENV['RACK_ENV'] == 'development'
      @http.set_debug_output($stdout)
    end
  end

  # Open a connection for multiple calls.
  # - Accepts a block, otherwise just opens the connection.
  # - You'll need to close the connection if you just open it.
  def start
    if block_given?
      # Open the connection.
      @http.start unless @http.started?

      # Yield to the calling block.
      yield(self)

      # Clean up the connection.
      @http.finish if @http.started?
    else
      # Open the connection.
      @http.start unless @http.started?
    end
  end

  # Clean up the connection if needed.
  def finish
    @http.finish if @http.started?
  end

  # GET
  def get(path, params = {})
    uri       = URI.parse(path)
    uri.query = URI.encode_www_form(params) unless params.empty?
    request   = Net::HTTP::Get.new(uri.to_s)

    parse fetch(request)
  end

  # POST
  def post(path, params = {}, as: :json)
    request = Net::HTTP::Post.new(path)

    case as
    when :json
      request.content_type = CONTENT_TYPE_JSON
      request.body = JSON.generate(params) unless params.empty?
    else
      request.content_type = CONTENT_TYPE_FORM
      request.body = URI.encode_www_form(params) unless params.empty?
    end

    parse fetch(request)
  end

  # DELETE
  def delete(path)
    request = Net::HTTP::Delete.new(path)

    parse fetch(request)
  end

  # PATCH
  def patch(path, params = {}, as: :form)
    request = Net::HTTP::Patch.new(path)

    case as
    when :json
      request.content_type = CONTENT_TYPE_JSON
      request.body = JSON.generate(params) unless params.empty?
    else
      request.content_type = CONTENT_TYPE_FORM
      request.body = URI.encode_www_form(params) unless params.empty?
    end

    parse fetch(request)
  end

  # PUT
  def put(path, params = {}, as: :json)
    request = Net::HTTP::Put.new(path)

    case as
    when :json
      request.content_type = CONTENT_TYPE_JSON
      request.body = JSON.generate(params) unless params.empty?
    else
      request.content_type = CONTENT_TYPE_FORM
      request.body = URI.encode_www_form(params) unless params.empty?
    end

    parse fetch(request)
  end

  # POST multipart
  def multipart(path, params)
    request = Net::HTTP::Post.new(path)

    request.content_type = CONTENT_TYPE_MULTIPART
    request.body = Rack::Multipart::Generator.new(
      'file' => Rack::Multipart::UploadedFile.new(params['file'][:tempfile].path, params['file'][:type])
    ).dump

    parse fetch(request)
  end

  private

  # Perform the request.
  def fetch(request)
    # Shore up default headers for the request.
    request['Accept'] = CONTENT_TYPE_JSON
    request['Connection'] = 'keep-alive'
    request['User-Agent'] = 'HTTPDecorator v0.1'

    # Actually make the request.
    response = @http.request(request)

    # Net::HTTPResponse.value will raise an error for non-200 responses.
    #   Simpler than trying to detect every possible exception.
    response.value || response
  end

  def parse(response)
    # Parse the response as JSON if possible.
    if response.content_type == CONTENT_TYPE_JSON
      JSON.parse(response.body)

    # Otherwise just return the response body.
    else
      response.body
    end
  end
end
```
