@catalog @search
Feature: Searching the catalog
  As a shopper
  I want to search the tool catalog by keyword
  So that I only see the products I am looking for

  Background:
    Given I am browsing the catalog

  @smoke
  Scenario: A keyword search shows only matching products
    When I search for "pliers"
    Then I see 4 products found for "pliers"
    And every product shown has "pliers" in its name

  @regression
  Scenario Outline: Searching for a <keyword> finds the expected tools
    When I search for "<keyword>"
    Then every product shown has "<keyword>" in its name
    And the results include "<expected product>"

    Examples:
      | keyword | expected product   |
      | hammer  | Thor Hammer        |
      | saw     | Circular Saw       |
      | wrench  | Adjustable Wrench  |

  @regression
  Scenario: A search with no matches says so
    When I search for "unicorn polish"
    Then I am told that no products were found
