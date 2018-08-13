<?php

/**
 * @file
 * A Ctools Export UI plugin for Javascript Manager Add JS.
 */


$plugin = array(
  'schema' => 'js_manager_add_js',
  // As defined in hook_schema().
  'access' => 'manage javascript items',
  // Define a permission users must have to access these pages.
  // Define the menu item.
  'menu' => array(
    'menu item' => 'js_manager',
    'menu title' => 'JavaScript',
    'menu description' => 'Manage inline and external JavaScript.',
  ),
  // Define user interface texts.
  'title singular' => t('JavaScript item'),
  'title plural' => t('JavaScript items'),
  'title singular proper' => t('JavaScript item'),
  'title plural proper' => t('JavaScript items'),
  'handler' => array(
    'class' => 'js_manager_add_js_ui',
    'parent' => 'ctools_export_ui',
  ),
  // Define the names of the functions that provide the add/edit forms.
  'form' => array(
    'settings' => 'js_manager_add_js_ctools_export_ui_form',
    'validate' => 'js_manager_add_js_ctools_export_ui_form_validate',
    'submit' => 'js_manager_add_js_ctools_export_ui_form_submit',
  ),
);

/**
 * Define the preset add/edit form.
 */
function js_manager_add_js_ctools_export_ui_form(&$form, &$form_state) {
  $visibility = !empty($form_state['item']->visibility) ? unserialize($form_state['item']->visibility) : [];
  $form['js_type'] = array(
    '#type' => 'select',
    '#title' => t('Type'),
    '#options' => array(
      'external' => 'External',
      'inline' => 'Inline',
    ),
    '#description' => 'Type of JavaScript',
    '#default_value' => $form_state['item']->js_type,
  );

  // External Fields.
  $form['external'] = array(
    '#type' => 'fieldset',
    '#title' => t('External'),
    '#collapsible' => FALSE,
    '#collapsed' => FALSE,
    '#states' => array(
      'visible' => array(
        ':input[name="js_type"]' => array('value' => 'external'),
      ),
      'invisible' => array(
        ':input[name="js_type"]' => array('value' => 'inline'),
      ),
    ),
  );
  $form['external']['external_js'] = array(
    '#type' => 'textfield',
    '#title' => t('URL'),
    '#description' => 'External JavaScript URL',
    '#default_value' => $form_state['item']->external_js,
  );
  $form['external']['external_js_async'] = array(
    '#type' => 'checkbox',
    '#title' => t('Load Asynchronously'),
    '#description' => 'Load external JavaScript Asynchronously',
    '#default_value' => $form_state['item']->external_js_async,
  );

  // Inline Fields.
  $form['inline'] = array(
    '#type' => 'fieldset',
    '#title' => t('Inline'),
    '#collapsible' => FALSE,
    '#collapsed' => FALSE,
    '#states' => array(
      'visible' => array(
        ':input[name="js_type"]' => array('value' => 'inline'),
      ),
      'invisible' => array(
        ':input[name="js_type"]' => array('value' => 'external'),
      ),
    ),
  );
  $form['inline']['inline_js'] = array(
    '#type' => 'textarea',
    '#title' => t('Snippet'),
    '#description' => 'Inline JavaScript snippet',
    '#default_value' => $form_state['item']->inline_js,
  );

  $form['exclude_admin'] = array(
    '#type' => 'checkbox',
    '#title' => t('Exclude on admin paths'),
    '#description' => 'Exclude on admin paths',
    '#default_value' => $form_state['item']->exclude_admin,
  );
  $form['weight'] = array(
    '#type' => 'textfield',
    '#maxlength' => 5,
    '#size' => 5,
    '#title' => t('Weight'),
    '#description' => 'Weight to control the order of scripts.',
    '#default_value' => $form_state['item']->weight,
    '#element_validate' => array(
      'element_validate_integer',
    ),
  );
  $form['scope'] = array(
    '#type' => 'select',
    '#title' => t('Scope'),
    '#options' => array(
      'header' => 'Header',
      'footer' => 'Footer',
    ),
    '#description' => 'Where the script should be added.',
    '#default_value' => $form_state['item']->scope,
  );

  // Visibility settings.
  $form['visibility_title'] = array(
    '#type' => 'item',
    '#title' => t('Visibility settings'),
  );
  $form['visibility'] = array(
    '#type' => 'vertical_tabs',
  );

  // Per-path visibility.
  $form['visibility']['path'] = array(
    '#type' => 'fieldset',
    '#title' => t('Pages'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#group' => 'visibility',
    '#weight' => 0,
  );
  $access = user_access('use PHP for settings');
  if (isset($visibility['opt']) && $visibility['opt'] == JS_MANAGER_VISIBILITY_PHP && !$access) {
    $form['visibility']['path']['visibility'] = array(
      '#type' => 'value',
      '#value' => JS_MANAGER_VISIBILITY_PHP,
    );
    $form['visibility']['path']['pages'] = array(
      '#type' => 'value',
      '#value' => isset($visibility['pages']) ? $visibility['pages'] : '',
    );
  }
  else {
    $options = array(
      JS_MANAGER_VISIBILITY_NOTLISTED => t('All pages except those listed'),
      JS_MANAGER_VISIBILITY_LISTED => t('Only the listed pages'),
    );
    $description = t("Specify pages by using their paths. Enter one path per line. The '*' character is a wildcard. Example paths are %blog for the blog page and %blog-wildcard for every personal blog. %front is the front page.", array('%blog' => 'blog', '%blog-wildcard' => 'blog/*', '%front' => '<front>'));

    if (module_exists('php') && $access) {
      $options += array(JS_MANAGER_VISIBILITY_PHP => t('Pages on which this PHP code returns <code>TRUE</code> (experts only)'));
      $title = t('Pages or PHP code');
      $description .= ' ' . t('If the PHP option is chosen, enter PHP code between %php. Note that executing incorrect PHP code can break your Drupal site.', array('%php' => '<?php ?>'));
    }
    else {
      $title = t('Pages');
    }
    $form['visibility']['path']['opt'] = array(
      '#type' => 'radios',
      '#title' => t('Show block on specific pages'),
      '#options' => $options,
      '#default_value' => isset($visibility['opt']) ? $visibility['opt'] : JS_MANAGER_VISIBILITY_NOTLISTED,
    );
    $form['visibility']['path']['pages'] = array(
      '#type' => 'textarea',
      '#title' => '<span class="element-invisible">' . $title . '</span>',
      '#default_value' => isset($visibility['pages']) ? $visibility['pages'] : '',
      '#description' => $description,
    );
  }

  $default_type_options = isset($visibility['types']) ? $visibility['types'] : [];
  $form['visibility']['node_type'] = array(
    '#type' => 'fieldset',
    '#title' => t('Content types'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#group' => 'visibility',
    '#weight' => 5,
  );
  $form['visibility']['node_type']['types'] = array(
    '#type' => 'checkboxes',
    '#title' => t('Show block for specific content types'),
    '#default_value' => $default_type_options,
    '#options' => node_type_get_names(),
    '#description' => t('Show this block only on pages that display content of the given type(s). If you select no types, there will be no type-specific limitation.'),
  );

  // Per-role visibility.
  $default_role_options =  isset($visibility['roles']) ? $visibility['roles'] : [];
  $role_options = array_map('check_plain', user_roles());
  $form['visibility']['role'] = array(
    '#type' => 'fieldset',
    '#title' => t('Roles'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#group' => 'visibility',
    '#weight' => 10,
  );
  $form['visibility']['role']['roles'] = array(
    '#type' => 'checkboxes',
    '#title' => t('Show block for specific roles'),
    '#default_value' => $default_role_options,
    '#options' => $role_options,
    '#description' => t('Show this block only for the selected role(s). If you select no roles, the block will be visible to all users.'),
  );

}

function js_manager_add_js_ctools_export_ui_form_validate(&$form, &$form_state) {
  $visibility['opt'] = $form_state['values']['opt'];
  $visibility['pages'] = $form_state['values']['pages'];
  foreach($form_state['values']['types'] as $key => $item){
    if($key === $item){
      $visibility['types'][] = $item;
    }
  }
  foreach($form_state['values']['roles'] as $key => $role){
    if($key == $role){
      $visibility['roles'][] = $role;
    }
  }
  $form_state['values']['visibility'] = serialize($visibility);
}

/**
 * Submit callback.
 *
 * @param $form
 * @param $form_state
 */
function js_manager_add_js_ctools_export_ui_form_submit(&$form, &$form_state) {
  // Clear the Add JS cache.
  cache_clear_all('js_manager_add_js', 'cache', TRUE);
}
