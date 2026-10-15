@catalog @filters
Feature: Filtering and sorting the catalog
  As a shopper
  I want to narrow the catalog down by category and brand, and choose the order
  So that I can compare the right tools quickly

  Background:
    Given I am browsing the catalog

  @smoke
  Scenario: Filtering by a category shows only that kind of tool
    When I filter by the category "Pliers"
    Then the results include:
      | product            |
      | Combination Pliers |
      | Slip Joint Pliers  |
      | Bolt Cutters       |
    And the results do not include:
      | product     |
      | Thor Hammer |
      | Wood Saw    |

  @regression
  Scenario: Combining a category and a brand narrows the results further
    When I filter by the category "Pliers"
    And I filter by the brand "MightyCraft Hardware"
    Then the results are exactly:
      | product           |
      | Bolt Cutters      |
      | Long Nose Pliers  |
      | Slip Joint Pliers |

  @regression
  Scenario Outline: Sorting the catalog by <sort option>
    When I sort the products by "<sort option>"
    Then the products are sorted <order>

    Examples:
      | sort option        | order                          |
      | Name (A - Z)       | from A to Z                    |
      | Name (Z - A)       | from Z to A                    |
      | Price (Low - High) | from the lowest to the highest price |
      | Price (High - Low) | from the highest to the lowest price |

  @regression
  Scenario: Sorting keeps the active filter
    When I filter by the category "Hammer"
    And I sort the products by "Price (Low - High)"
    Then the products are sorted from the lowest to the highest price
    And the first product shown is "Thor Hammer"
