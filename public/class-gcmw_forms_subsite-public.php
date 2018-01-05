<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       http://example.com
 * @since      1.0.0
 *
 * @package    CCMT_Forms_Subsite
 * @subpackage CCMT_Forms_Subsite/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    CCMT_Forms_Subsite
 * @subpackage CCMT_Forms_Subsite/public
 * @author     Your Name <email@example.com>
 */
class CCMT_Forms_Subsite_Public {

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
	 * @param      string    $plugin_name       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in CCMT_Forms_Subsite_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The CCMT_Forms_Subsite_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/CCMT_forms_subsite-public.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in CCMT_Forms_Subsite_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The CCMT_Forms_Subsite_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/CCMT_forms_subsite-public.js', array( 'jquery' ), $this->version, false );
		wp_register_script( "ccmt-cff-render-vendor", plugin_dir_url( dirname( __FILE__ ) ) . 'scripts/dist/vendor.bundle.js' );
		wp_register_script( "ccmt-cff-render-app", plugin_dir_url( dirname( __FILE__ ) ) . 'scripts/dist/app.js', array('ccmt-cff-render-vendor') );

	}
	public function cff_shortcodes_init() {
		/* Initializes the shortcode for rendering a form.
		 */
		function cff_shortcodes_render_form_fn( $atts ) {
			$a = shortcode_atts( array(
				'id' => '',
				'apiKey' => '',
			), $atts );
			wp_enqueue_script("ccmt-cff-render-vendor");
			wp_enqueue_script("ccmt-cff-render-app");
			ob_start();
			include plugin_dir_path( __FILE__ ) . "partials/ccmt-cff-form-render.php";
			return ob_get_clean();
		}
		add_shortcode( 'ccmt-cff-render-form', 'cff_shortcodes_render_form_fn' );
	}
}