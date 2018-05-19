import scrapy


class BlogSpider(scrapy.Spider):
    name = 'tuCarroScrapper'
    start_urls = ['https://carros.tucarro.com.co']

    rate = 5

    def __init__(self):
        scrapy.Spider.__init__(self)
        self.download_delay = 1 / float(self.rate)

    def parse(self, response):
        # for maker in response.css('dl#id_9991744-AMCO_1744_1.filters__brand dd'):  # Popular only
        for maker in response.css('.modal-location-filter-9991744-AMCO_1744_1 .location_filter_inner'):  # All makers
            maker_url = response.urljoin(maker.css('a::attr("href")').extract_first(default=''))
            maker_name = maker.css("a::text").extract_first(default='').strip()
            req = scrapy.Request(url=maker_url, callback=self.parse_maker, meta={"maker": maker_name})
            yield req

    def parse_maker(self, response):
        # for model in response.css('dl#id_9991744-AMCO_1744_2.filters__model dd'):  # Popular only
        for model in response.css('.modal-location-filter-9991744-AMCO_1744_2 .location_filter_inner'):  # All models
            meta = response.meta
            meta["model"] = model.css("a::text").extract_first(default='').strip()
            req = scrapy.Request(url=response.urljoin(model.css('a::attr("href")').extract_first(default='')),
                                 callback=self.parse_grid,
                                 meta=meta)
            yield req

    def parse_grid(self, response):
        for item in response.css('.results-item'):
            req = scrapy.Request(url=response.urljoin(item.css('a::attr("href")').extract_first(default='')),
                                 callback=self.parse_car,
                                 meta=response.meta)
            yield req

    def parse_car(self, response):

        title = response.css('.item-title__primary::text').extract_first(default='').strip()

        # # Check that the title includes the maker and model
        # if title.upper().find(response.meta['maker'].upper()) == -1 or \
        #    title.upper().find(response.meta['model'].upper()) == -1:
        #   print "Car title doesn't include maker/model skipping", response.meta['maker'], response.meta['model'], title
        #   continue

        # print "Parse car ", title
        # print "Parsing maker ", response.meta.get('maker'), " model ", response.meta.get('model')

        kms = response.css('.vip-classified-info dd::text').extract()
        if len(kms) > 1:
            kms = kms[1]
            kms = kms.replace("Km", "")
            kms = kms.replace("kms", "")
            kms = kms.replace(",", "")
            kms = kms.strip()
        else:
            kms = ""

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
            'year': response.css('.vip-classified-info dd::text').extract_first(default=''),
            'kms': kms,
            'link': response.request.url,
            # 'img': response.css('.gallery-trigger img::attr(src)').extract_first(default=''),
            'maker': response.meta.get('maker'),
            'model': response.meta.get('model'),
            'location': location,
            'description': description,
            'phone_number': phone_number
        }

        for item in response.css('.specs-item'):
            property = item.css('strong::text').extract_first(default='')
            value = item.css('span::text').extract_first(default='')

            if value:
                vehicle_data[property] = value

        yield vehicle_data
