# JavaScript Manager

Allows external and inline JS to be added to pages.

## Requirements
This module requires the following modules:
 * [Ctools](https://drupal.org/project/ctools)

## Installation
 * Install as you would normally install a contributed Drupal module.
   See:
   https://drupal.org/documentation/install/modules-themes/modules-7
   for further information.

## Permissions
* `Manage JavaScript Items`: Allows management of external and inline JavaScript.

## Usage
JavaScript items can be configured at `/admin/structure/js_manager`

  | Property               | Description                                             |
  | ---------------------- | ------------------------------------------------------- |
  | Name                   | Descriptive machine name for the JavaScript being added |
  | Type                   | Internal / External                                     |
  | External URL           | Full URL to external script                             |
  | Load Asynchronously    | Load the external script asynchronously                 |
  | Exclude on admin paths | Excludes the script on admin paths                      |
  | Snippet                | Inline JavaScript snippet                               |
  | Weight                 | Script weight (integer) to control ordering             |
  | Scope                  | Header / Footer                                         |
