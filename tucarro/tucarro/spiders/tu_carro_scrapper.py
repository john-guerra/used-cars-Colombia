import scrapy


class BlogSpider(scrapy.Spider):
    name = 'tuCarroScrapper'
    start_urls = ['https://carros.tucarro.com.co']
    allowed_domains = ['tucarro.com.co']

    def parse(self, response):
        # for maker in response.css('dl#id_9991744-AMCO_1744_1.filters__brand dd a'):  # Popular only
        for maker in response.css('.modal-location-filter-9991744-AMCO_1744_1 .location_filter_inner a'):  # All makers
            yield response.follow(url=maker, callback=self.parse_grid, meta={'dont_cache': True})

    def parse_grid(self, response):
        for item in response.css('#results-section .results-item .rowItem > a'):
            yield response.follow(url=item, callback=self.parse_car)
        next_page = response.css('.pagination__page--current + li.pagination__page a::attr(href)').extract_first()
        if next_page:
            yield response.follow(url=next_page, callback=self.parse_grid, meta={'dont_cache': True})

    def parse_car(self, response):
        self.logger.info("Parsing: %s" % response.request.url)
        title = response.css('.item-title__primary::text').extract_first(default='').strip()

        price = response.css('.price-tag-fraction::text').extract_first(default='').replace("$", "")
        price = price.replace(".", "")
        price = price.strip()

        location = response.css('.location-info::text').extract()
        if len(location) > 3:
            location = location[3].strip()
        else:
            location = ""

        description = response.css('#description-includes .item-description__text p::text').extract_first(default='')
        phone_number = response.css('.profile-info-phone-value::text').extract_first(default='')
        vehicle_data = {
            'title': title,
            'price': price,
            'link': response.request.url,
            'location': location,
            'description': description,
            'phone_number': phone_number
        }

        if location:
            vehicle_data['departamento'] = location.split("-")[-1].strip()

        for item in response.css('.specs-item'):
            property = item.css('strong::text').extract_first(default='')
            value = item.css('span::text').extract_first(default='')

            if value:
                vehicle_data[property] = value

        yield vehicle_data
