<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       http://example.com
 * @since      1.0.0
 *
 * @package    CCMT_Forms_Subsite
 * @subpackage CCMT_Forms_Subsite/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    CCMT_Forms_Subsite
 * @subpackage CCMT_Forms_Subsite/admin
 * @author     Your Name <email@example.com>
 */
class CCMT_Forms_Subsite_Admin {

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
		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/CCMT_forms_subsite-admin.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/CCMT_forms_subsite-admin.js', array( 'jquery' ), $this->version, false );
		wp_register_script( "ccmt-cff-edit-vendor", plugin_dir_url( dirname( __FILE__ ) ) . 'scripts/dist/vendor.bundle.js', false, filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'scripts/dist/vendor.bundle.js' ));
		wp_register_script( "ccmt-cff-edit-app", plugin_dir_url( dirname( __FILE__ ) ) . 'scripts/dist/app.js', array('ccmt-cff-edit-vendor'), filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'scripts/dist/app.js' ) );
	}

	public function ccmt_cff_add_form_management_page() {
		add_submenu_page(
			'tools.php',
			'CCMT CFF Manager', // Page title
			'CCMT CFF Manager', // Menu title
			'manage_options', // Capability
			'ccmt_cff_form_manager', // Menu slug
			array($this, 'ccmt_cff_render_form_management_page') // Function
		);
	}
	public function ccmt_cff_render_form_management_page() {
		wp_enqueue_script("ccmt-cff-edit-vendor");
		wp_enqueue_script("ccmt-cff-edit-app");
		wp_enqueue_style("ccmt-cff-form-css");
		include plugin_dir_path( __FILE__ ) . "partials/form-management.php";
	}

	public function ccmt_cff_add_form_options_page() {
		add_options_page(
			'CCMT CFF Options',
			'CCMT CFF Options',
			'manage_options',
			'ccmt_cff_form_options',
			array($this, 'ccmt_cff_options_page')
		);
	}

	public function ccmt_cff_init_form_settings(  ) { 
		
		register_setting( 'pluginPage', 'ccmt_cff_settings' );
	
		add_settings_section(
			'ccmt_cff_pluginPage_section', 
			__( 'Forms Framework Setup', 'ccmt-cff' ), 
			array($this, 'ccmt_cff_settings_section_callback'), 
			'pluginPage'
		);
	
		add_settings_field( 
			'ccmt_cff_api_key', 
			__( 'API Key', 'ccmt-cff' ), 
			array($this, 'ccmt_cff_api_key_render'), 
			'pluginPage', 
			'ccmt_cff_pluginPage_section' 
		);

		add_settings_field( 
			'ccmt_cff_api_endpoint', 
			__( 'API Endpoint', 'ccmt-cff' ), 
			array($this, 'ccmt_cff_api_endpoint_render'), 
			'pluginPage', 
			'ccmt_cff_pluginPage_section' 
		);
		
	}
	public function ccmt_cff_api_key_render(  ) { 	
		$options = get_option( 'ccmt_cff_settings' );
		?>
		<input type='text' name='ccmt_cff_settings[ccmt_cff_api_key]' value='<?php echo $options['ccmt_cff_api_key']; ?>'>
		<?php
	}
	public function ccmt_cff_api_endpoint_render(  ) { 	
		$options = get_option( 'ccmt_cff_settings' );
		?>
		<input type='text' name='ccmt_cff_settings[ccmt_cff_api_endpoint]' value='<?php echo $options['ccmt_cff_api_endpoint']; ?>'>
		<?php
	}
	
	
	public function ccmt_cff_settings_section_callback(  ) { 	
		echo __( 'API key that uniquely identifies your center. (Do not share!)<br>Contact <a href="mailto:itsupport@chinmayamission.in">itsupport@chinmayamission.in</a> to request an API key.', 'ccmt-cff' );
	}
	
	
	public function ccmt_cff_options_page(  ) { 
		include plugin_dir_path( __FILE__ ) . "partials/CCMT_forms_options-page.php";
	}

}