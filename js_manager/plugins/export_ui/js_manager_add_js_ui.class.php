<?php

/**
 * @file
 * A custom Ctools Export UI class for JavaScript items.
 */

/**
 * Customizations of the JavaScript Manager Add JS UI.
 */
class js_manager_add_js_ui extends ctools_export_ui {

  /**
   * Build a row based on the item.
   *
   * By default all of the rows are placed into a table by the render
   * method, so this is building up a row suitable for theme('table').
   * This doesn't have to be true if you override both.
   */
  function list_build_row($item, &$form_state, $operations) {
    // Set up sorting
    $name = $item->{$this->plugin['export']['key']};
    $schema = ctools_export_get_schema($this->plugin['schema']);

    switch ($form_state['values']['order']) {
      case 'disabled':
        $this->sorts[$name] = empty($item->disabled) . $name;
        break;
      case 'name':
        $this->sorts[$name] = $name;
        break;
      case 'storage':
        $this->sorts[$name] = $item->{$schema['export']['export type string']} . $name;
        break;
    }

    $this->rows[$name]['data'] = array();
    $this->rows[$name]['class'] = !empty($item->disabled) ? array('ctools-export-ui-disabled') : array('ctools-export-ui-enabled');
    $this->rows[$name]['data'][] = array('data' => check_plain($item->name), 'class' => array('ctools-export-ui-name'));
    $this->rows[$name]['data'][] = array('data' => ucwords(check_plain($item->js_type)), 'class' => array('ctools-export-ui-js-type'));
    $this->rows[$name]['data'][] = array('data' => ucwords(check_plain($item->scope)), 'class' => array('ctools-export-ui-scope'));
    $this->rows[$name]['data'][] = array('data' => check_plain($item->weight), 'class' => array('ctools-export-ui-weight'));
    $this->rows[$name]['data'][] = array('data' => check_plain($item->{$schema['export']['export type string']}), 'class' => array('ctools-export-ui-storage'));
    $ops = theme('links__ctools_dropbutton', array('links' => $operations, 'attributes' => array('class' => array('links', 'inline'))));
    $this->rows[$name]['data'][] = array('data' => $ops, 'class' => array('ctools-export-ui-operations'));
  }

  /**
   * Provide the table header.
   *
   * If you've added columns via list_build_row() but are still using a
   * table, override this method to set up the table header.
   */
  function list_table_header() {
    $header = array();
    $header[] = array('data' => t('JavaScript'), 'class' => array('ctools-export-ui-name'));
    $header[] = array('data' => t('Type'), 'class' => array('ctools-export-ui-js-type'));
    $header[] = array('data' => t('Scope'), 'class' => array('ctools-export-ui-scope'));
    $header[] = array('data' => t('Weight'), 'class' => array('ctools-export-ui-weight'));
    $header[] = array('data' => t('Storage'), 'class' => array('ctools-export-ui-storage'));
    $header[] = array('data' => t('Operations'), 'class' => array('ctools-export-ui-operations'));

    return $header;
  }
}
