@account
Feature: Signing in
  As a returning customer
  I want to sign in to my account
  So that I can see my orders, favorites and profile

  The Toolshop publishes demo customer accounts for practice. Failed sign-ins are only
  tried with an address that has no account, because three wrong passwords lock a real
  demo account for everyone who uses the shared site.

  Scenarios tagged @shared-account sign in to those shared accounts. The default run
  leaves them out; `npm run test:shared-account` runs them on purpose, one at a time.

  Background:
    Given I am on the sign-in page

  @smoke @shared-account
  Scenario Outline: A demo customer signs in
    When I sign in as the demo user "<demo user>"
    Then I am on my account page
    And I am signed in as "<full name>"

    Examples:
      | demo user | full name |
      | customer  | Jane Doe  |
      | customer3 | Bob Smith |

  @regression @shared-account
  Scenario: A signed-in customer can sign out
    Given I sign in as the demo user "customer"
    When I sign out
    Then I am signed out

  @regression
  Scenario Outline: The sign-in form explains what is wrong before sending anything
    When I sign in with the email "<email>" and the password "<password>"
    Then I see the message "<message>"
    And I am still on the sign-in page

    Examples:
      | email                      | password  | message                 |
      |                            | welcome01 | Email is required       |
      | not-an-email               | welcome01 | Email format is invalid |
      | someone@example.com        |           | Password is required    |
