---
title: Strong Parameters in Sinatra
date: 2015-12-08 10:00 PST
tags: Ruby, Sinatra, Security
---

A while ago a concept called "[Strong Parameters](https://github.com/rails/strong_parameters)" was added to Ruby on Rails, the general idea of which was to explicitly allow or deny parameters passing into your application code.

Since most of my work right now is in Sinatra, I was interested in creating something similar with my setup in mind. I decided to give it a go using [Sinatra's conditions](http://www.sinatrarb.com/intro.html#Conditions) and the result, is my "[sinatra-strong-params](https://github.com/evanleck/sinatra-strong-params)" Ruby gem.

Here's an example Sinatra application using StrongParams:

```ruby
require 'sinatra/base'
require 'sinatra/strong-params'

class ExampleApp < Sinatra::Base
  configure do
    register Sinatra::StrongParams
  end

  get '/', allows: [:search] do
    # Only the 'search' parameter will make it to the execution scope.
  end

  post '/search', needs: [:search, :_csrf] do
    # Will only ever return if both the 'search' and '_csrf' parameters are present.
    #   Otherwise, it will raise an instance of RequiredParamMissing
  end

  error RequiredParamMissing do
    # Handle parameter failures here.
    [400, "No dice"]
  end
end
```

There are two new conditions we can add to any request: "allows" and "needs". As you might have guessed, one specifies which parameters you'd like to allow through to the request handler and the other specifies which parameters must be present for the request to be handled.

## Allows

Here, we simply filter out parameters to the request that are not explicitly allowed by the condition.

```ruby
#
# A way to whitelist parameters.
#
#   get '/', allows: [:id, :action] do
#     erb :index
#   end
#
# Modifies the parameters available in the request scope.
# Stashes unmodified params in @_params
#
app.set(:allows) do |*passable|
  condition do
    unless @params.empty?
      @_params = @_params || @params # for safety
      globals  = settings.globally_allowed_parameters
      passable = (globals | passable).map(&:to_sym) # make sure it's a symbol

      # trim the params down
      @params = @params.select do |param, _value|
        passable.include?(param.to_sym)
      end
    end
  end
end
```

## Needs

And here, we actually fail the request if one of the defined parameters is missing.

```ruby
#
# A way to require parameters
#
#   get '/', needs: [:id, :action] do
#     erb :index
#   end
#
# Does not modify the parameters available to the request scope.
# Raises a RequiredParamMissing error if a needed param is missing
#
app.set(:needs) do |*needed|
  condition do
    if @params.nil? || @params.empty? && !needed.empty?
      fail RequiredParamMissing, settings.missing_parameter_message
    else
      needed     = needed.map(&:to_sym) # make sure it's a symbol
      sym_params = @params.dup

      # symbolize the keys so we know what we're looking at
      sym_params.keys.each do |key|
        sym_params[(key.to_sym rescue key) || key] = sym_params.delete(key)
      end

      if needed.any? { |key| sym_params[key].nil? || sym_params[key].empty? }
        fail RequiredParamMissing, settings.missing_parameter_message
      end
    end
  end
end
```

And there ya go! Lock down those parameters!
