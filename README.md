# used-cars-Colombia
Just some hacking on the prices of used cars in Colombia

Based on ToS hosted on tucarro.com.co, datasets with actual data should not be provided. You could get that data yourself by running:

git clone https://github.com/julianx/used-cars-Colombia.git
cd used-cars-Colombia/tucarro
scrapy crawl tuCarroScrapper -o out_file.json

Also, the output file can be either CSV, JSON, and some more [Scrapy Exporters|https://doc.scrapy.org/en/latest/topics/exporters.html] and you just have to change the extension for getting the new format.

Requirements:
scrapy [https://doc.scrapy.org/en/latest/intro/install.html]