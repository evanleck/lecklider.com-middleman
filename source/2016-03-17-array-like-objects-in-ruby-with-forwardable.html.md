---
title: Array-like Objects in Ruby with Forwardable
date: 2016-03-17 11:00 PDT
tags: Ruby
---

A couple of times recently I've needed something that behaved _like_ and array, but with some extra methods that are specific to the context of the list I'm dealing with. For example, an array of transactions with a couple of extra methods for common queries I want to perform against those transactions.

Here I'll show you how I deal with Array-like objects and why I like using Forwardable to create wrappers around arrays.


## Transaction

For this example, we'll use an array of Transaction objects. Let's assume our base Transaction class looks like this:

```ruby
class Transaction
  def initialize(data)
    @amount = data[:amount]
    @status = data[:status]
  end
end
```


## Array

If we have a simple array of Transaction objects, we can query it like this:

```ruby
# Select transactions that have settled.
@transactions.select do |transaction|
  transaction.status == 'settled'
end

# Select transactions that are still pending.
@transactions.select do |transaction|
  transaction.status == 'pending'
end
```

It's not super pretty, but it works. What I'd like is to shorten this up since there's a fairly finite set of common queries we'll perform against this collection.


## Forwardable

To this end, we'll create a new 'TransactionList' class that uses Ruby's [Forwardable](http://ruby-doc.org/stdlib-2.3.0/libdoc/forwardable/rdoc/Forwardable.html) module to delegate to our array. We know that we'll want to call 'each' and 'select' on our transactions, so let's start by delegating those using the [delegate](http://ruby-doc.org/stdlib-2.3.0/libdoc/forwardable/rdoc/Forwardable.html#method-i-delegate) method.

```ruby
class TransactionList
  extend Forwardable
  delegate [:each, :select] => :@transactions

  def initialize(transactions)
    @transactions = transactions
  end
end
```

Cool, this is shaping up! Let's add some extra methods to simplify our original queries.

```ruby
class TransactionList
  extend Forwardable
  delegate [:each, :select] => :@transactions

  def initialize(transactions)
    @transactions = transactions
  end

  # Select only transactions that have a 'settled' status.
  def settled
    @transactions.select do |transaction|
      transaction.status == 'settled'
    end
  end

  # Select only transactions that have a 'pending' status.
  def pending
    @transactions.select do |transaction|
      transaction.status == 'pending'
    end
  end
end
```

And now, we can use them like this:

```ruby
transactions = TransactionList.new(array)

# An array of Transaction objects that has the status 'pending'
transactions.pending.each do |transaction|
  puts "Transaction for #{ transaction.amount } still pending"
end

# An array of Transaction objects that has the status 'settled'
transactions.settled.each do |transaction|
  puts "Transaction settled for #{ transaction.amount }"
end
```

Pretty nifty, huh? This is a pretty simplified example but I use this pattern of wrapping arrays in custom 'List type objects all over the place.


## Caveats

Because we've only instructed TransactionList to delegate the 'each' and 'select' methods to our transactions array, if we try to call other [Enumerable](http://ruby-doc.org/core-2.3.0/Enumerable.html) or [Array](http://ruby-doc.org/core-2.3.0/Array.html) methods on our TransactionList we will get a NoMethodError. Remember, you have to *explicitly tell Forwardable what methods to delegate*.
