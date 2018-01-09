<form action='options.php' method='post'>
	
<h2>Chinmaya Forms Framework Options</h2>

<?php
settings_fields( 'pluginPage' );
do_settings_sections( 'pluginPage' );
submit_button();
?>
	
</form>

<a href="<?php echo admin_url('tools.php?page=ccmt_cff_form_manager'); ?>">Back to CCMT form management page</a>