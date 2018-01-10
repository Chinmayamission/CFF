<?php
$ccmt_cff_options = get_option( 'ccmt_cff_settings' );
$ccmt_cff_options_page_url = admin_url('options-general.php?page=ccmt_cff_form_options');
if (!$ccmt_cff_options) {
    echo "<meta http-equiv=\"refresh\" content=\"0;URL='$ccmt_cff_options_page_url'\" />";
}
$ccmt_cff_api_key = $ccmt_cff_options['ccmt_cff_api_key'];
$ccmt_cff_api_endpoint = $ccmt_cff_options['ccmt_cff_api_endpoint'];
?>

<a href="<?php echo $ccmt_cff_options_page_url; ?>">Set up API key</a>
<div id="ccmt-cff-admin"
    data-ccmt-cff-api-key="<?php echo $ccmt_cff_api_key; ?>"
    data-ccmt-cff-api-endpoint="<?php echo $ccmt_cff_api_endpoint; ?>></div>