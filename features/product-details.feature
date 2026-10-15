@product
Feature: Product details
  As a shopper
  I want to see the details of a tool before I buy it
  So that I know what I am getting and what it costs

  @smoke
  Scenario: Opening a product from the catalog shows its details
    Given I am browsing the catalog
    When I search for "Combination Pliers"
    And I open the product "Combination Pliers"
    Then I see the product details:
      | name     | Combination Pliers |
      | price    | $14.15             |
      | category | Pliers             |
      | brand    | ForgeFlex Tools    |
    And the product has a description

  @regression
  Scenario: An out-of-stock product cannot be added to the cart
    Given I am viewing the product "Long Nose Pliers"
    Then I am told the product is out of stock
    And I cannot add the product to my cart
