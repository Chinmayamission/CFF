<?php
$ccmt_cff_options = get_option( 'ccmt_cff_settings' );
$ccmt_cff_options_page_url = admin_url('options-general.php?page=ccmt_cff_form_options');
if (!$ccmt_cff_options) {
    wp_redirect( $ccmt_cff_options_page_url ); exit;
}
$ccmt_cff_api_key = $ccmt_cff_options['ccmt_cff_api_key'];
?>
<a href="<?php echo $ccmt_cff_options_page_url; ?>">Set up API key</a>
<div id="ccmt-cff-admin" data-api-key="<?php echo $ccmt_cff_api_key; ?>"></div>