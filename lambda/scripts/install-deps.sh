# Originally from https://github.com/JazzCore/python-pdfkit/blob/master/travis/before-script.sh

WKHTML2PDF_VERSION='0.12.4'

sudo apt-get install -y openssl build-essential xorg libssl-dev
wget "https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/${WKHTML2PDF_VERSION}/wkhtmltox-${WKHTML2PDF_VERSION}_linux-generic-amd64.tar.xz"
tar -xJf "wkhtmltox-${WKHTML2PDF_VERSION}_linux-generic-amd64.tar.xz"
chmod +x wkhtmltox/bin/wkhtmltopdf
cp wkhtmltox/bin/wkhtmltopdf vendor/bin
rm -r wkhtmltox "wkhtmltox-${WKHTML2PDF_VERSION}_linux-generic-amd64.tar.xz"
# sudo chown root:root bin/wkhtmltopdf
# sudo cp -r * /usr/