<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              http://chinmayamission.com
 * @since             1.0.0
 * @package           CCMT_Forms_Subsite
 *
 * @wordpress-plugin
 * Plugin Name:       CCMT Forms Subsite Plugin
 * Plugin URI:        
 * Description:       Allows Chinmaya Mission Subsites to access the CCMT forms api.
 * Version:           1.1.2
 * Author:            CCMT
 * Author URI:        
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'PLUGIN_NAME_VERSION', '1.1.2' );

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-CCMT_forms_subsite-activator.php
 */
function activate_plugin_name() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-CCMT_forms_subsite-activator.php';
	CCMT_Forms_Subsite_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-CCMT_forms_subsite-deactivator.php
 */
function deactivate_plugin_name() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-CCMT_forms_subsite-deactivator.php';
	CCMT_Forms_Subsite_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_plugin_name' );
register_deactivation_hook( __FILE__, 'deactivate_plugin_name' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-CCMT_forms_subsite.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_plugin_name() {

	$plugin = new CCMT_Forms_Subsite();
	$plugin->run();

}
run_plugin_name();
