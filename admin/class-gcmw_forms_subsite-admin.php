<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       http://example.com
 * @since      1.0.0
 *
 * @package    GCMW_Forms_Subsite
 * @subpackage GCMW_Forms_Subsite/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    GCMW_Forms_Subsite
 * @subpackage GCMW_Forms_Subsite/admin
 * @author     Your Name <email@example.com>
 */
class GCMW_Forms_Subsite_Admin {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;
	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of this plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {
		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/gcmw_forms_subsite-admin.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/gcmw_forms_subsite-admin.js', array( 'jquery' ), $this->version, false );
	}

	public function form_management_page_add() {
		add_submenu_page(
			'tools.php',
			'GCMW Form Manager', // Page title
			'GCMW Form Manager', // Menu title
			'manage_options', // Capability
			'gcmw_form_management_page', // Menu slug
			array($this, 'form_management_page_render') // Function
		);
	}
	public function form_management_page_render() {
		wp_enqueue_script( "gcmw-forms-edit-vendor", plugin_dir_url( dirname( __FILE__ ) ) . 'scripts/dist/vendor.bundle.js' );
		wp_enqueue_script( "gcmw-forms-edit-app", plugin_dir_url( dirname( __FILE__ ) ) . 'scripts/dist/app.js' );
		include plugin_dir_path( __FILE__ ) . "partials/form-management.php";
	}

}
