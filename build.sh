# cd /mnt/c/Users/arama/Documents/My\ Web\ Sites/WordPress/wp-content/plugins/CFF/wp-plugin
# ../build.sh 1.1.0
#Just zip manually the wp-plugin folder for now.
 zip -r "../$1-ccmt-cff-wp-client-plugin.zip" . -x *.zip *.git* node_modules/**\* 
#git archive --format=zip HEAD -o $0.zip
# apex deploy --env prod --alias PROD