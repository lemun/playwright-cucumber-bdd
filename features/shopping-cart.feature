@cart
Feature: Shopping cart
  As a shopper
  I want to collect tools in a cart and adjust it
  So that I can see what my order will cost before checking out

  @smoke
  Scenario: Adding a product to the cart
    Given I am viewing the product "Combination Pliers"
    When I add 3 of this product to my cart
    Then I am told "Product added to shopping cart."
    And the cart icon shows 3 items

  @regression
  Scenario: The cart adds up several products
    Given I have added these products to my cart:
      | product     | quantity |
      | Claw Hammer | 2        |
      | Wood Saw    | 1        |
    When I open my cart
    Then my cart contains:
      | product     | quantity | line total |
      | Claw Hammer | 2        | $22.96     |
      | Wood Saw    | 1        | $12.18     |
    And the cart total is "$35.14"

  @regression
  Scenario: Changing a quantity in the cart updates the totals
    Given I have added these products to my cart:
      | product     | quantity |
      | Claw Hammer | 1        |
    When I open my cart
    And I change the quantity of "Claw Hammer" to 4
    Then my cart contains:
      | product     | quantity | line total |
      | Claw Hammer | 4        | $45.92     |
    And the cart total is "$45.92"

  @regression
  Scenario: The shop allows only one Thor Hammer per order
    Given I am viewing the product "Thor Hammer"
    When I try to add 2 of this product to my cart
    Then I am told "You can only have one Thor Hammer in the cart."
    And my cart is still empty

  @regression
  Scenario: Removing the only product empties the cart
    Given I have added these products to my cart:
      | product  | quantity |
      | Wood Saw | 1        |
    When I open my cart
    And I remove "Wood Saw" from my cart
    Then I am told my cart is empty
